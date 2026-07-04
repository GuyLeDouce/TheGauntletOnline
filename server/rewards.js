const crypto = require("crypto");
const { createPayout, updatePayoutStatus } = require("./db");
const { toBoolean, toNumber } = require("./validators");

const CLAIM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_REWARD_WEBHOOK_TIMEOUT_MS = 8000;

function generateClaimCode() {
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += CLAIM_ALPHABET[crypto.randomInt(CLAIM_ALPHABET.length)];
  }
  return `UGLY-${suffix}`;
}

async function notifyPayoutWebhook(run, payout) {
  const webhookUrl = process.env.DISCORD_PAYOUT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "New Ugly Interview $CHARM Claim",
            color: 0x7cff4f,
            fields: [
              { name: "Discord", value: run.discordHandle || "Unknown", inline: true },
              { name: "Discord User ID", value: run.discordUserId || "Unknown", inline: true },
              { name: "Wallet", value: run.walletAddress || "Unknown" },
              { name: "Squigs Held", value: String(run.squigCount || 0), inline: true },
              { name: "Revive Pill", value: run.hasRevivePill ? "Yes" : "No", inline: true },
              { name: "Dignity Start", value: String(run.dignityStart || 1), inline: true },
              { name: "Result", value: run.resultType || run.status, inline: true },
              { name: "Final $CHARM", value: String(payout.amount), inline: true },
              { name: "Payout Status", value: payout.status || "pending", inline: true },
              { name: "Claim Code", value: payout.claimCode, inline: true },
              { name: "Run ID", value: run.runId },
              { name: "Payout ID", value: payout.payoutId }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      })
    });
  } catch (error) {
    console.error("Discord payout webhook failed:", error?.message || error);
  }
}

function buildRewardWebhookPayload(run, payout) {
  return {
    type: "ugly_interview.reward",
    eventId: payout.payoutId,
    payoutId: payout.payoutId,
    runId: run.runId,
    claimCode: payout.claimCode,
    createdAt: new Date().toISOString(),
    player: {
      discordUserId: run.discordUserId || payout.discordUserId,
      discordHandle: run.discordHandle || payout.discordHandle || "",
      walletAddress: run.walletAddress || payout.walletAddress || ""
    },
    reward: {
      amount: Number(payout.amount),
      currency: "CHARM"
    },
    run: {
      status: run.status,
      resultType: run.resultType || "",
      correctCount: run.correctCount || 0,
      wrongCount: run.wrongCount || 0,
      charmStack: run.charmStack || 0,
      charmFinal: run.charmFinal || payout.amount,
      squigCount: run.squigCount || 0,
      hasRevivePill: Boolean(run.hasRevivePill),
      walletScanId: run.walletScanId || null
    }
  };
}

function signRewardWebhookBody(body, secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  return {
    timestamp,
    signature: `sha256=${signature}`
  };
}

async function sendRewardToGauntletDiscordBot(run, payout) {
  const enabled = toBoolean(process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_ENABLED, true);
  const webhookUrl = String(process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_URL || "").trim();
  if (!enabled || !webhookUrl) return payout;

  const secret = String(process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    console.warn("GAUNTLET_DISCORD_REWARD_WEBHOOK_URL is set but GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET is missing; skipping unsigned reward webhook.");
    return payout;
  }

  const timeoutMs = Math.trunc(toNumber(
    process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_TIMEOUT_MS,
    DEFAULT_REWARD_WEBHOOK_TIMEOUT_MS,
    { min: 1, max: 60_000 }
  ));
  const payload = buildRewardWebhookPayload(run, payout);
  const body = JSON.stringify(payload);
  const signed = signRewardWebhookBody(body, secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-gauntlet-timestamp": signed.timestamp,
        "x-gauntlet-signature": signed.signature,
        "x-gauntlet-idempotency-key": payout.payoutId
      },
      body,
      signal: controller.signal
    });

    if (!response.ok) {
      const responseText = typeof response.text === "function" ? await response.text().catch(() => "") : "";
      console.error(`Gauntlet Discord reward webhook failed for payout ${payout.payoutId}: HTTP ${response.status}${responseText ? ` ${responseText.slice(0, 300)}` : ""}`);
      return payout;
    }

    const result = typeof response.json === "function" ? await response.json().catch((error) => ({ ok: false, error: error?.message || "Invalid JSON response" })) : {};
    if (result?.ok === true && result?.paid === true) {
      const updated = await updatePayoutStatus(payout.payoutId, "paid", "Auto-paid by The Gauntlet Discord webhook");
      return updated || payout;
    }

    console.error(`Gauntlet Discord reward webhook did not auto-pay payout ${payout.payoutId}: ${result?.error || result?.message || JSON.stringify(result)}`);
  } catch (error) {
    const reason = error?.name === "AbortError" ? `timed out after ${timeoutMs}ms` : error?.message || error;
    console.error(`Gauntlet Discord reward webhook failed for payout ${payout.payoutId}: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }

  return payout;
}

async function createPendingPayoutForRun(run) {
  if (run.mode !== "reward" || !run.discordUserId || !run.walletAddress || Number(run.charmFinal || 0) <= 0) {
    return null;
  }
  const payout = await createPayout({
    payoutId: crypto.randomUUID(),
    runId: run.runId,
    clientId: run.clientId,
    discordUserId: run.discordUserId,
    discordHandle: run.discordHandle,
    walletAddress: run.walletAddress,
    amount: run.charmFinal,
    claimCode: generateClaimCode()
  });
  const finalPayout = await sendRewardToGauntletDiscordBot(run, payout);
  await notifyPayoutWebhook(run, finalPayout);
  return finalPayout;
}

module.exports = {
  createPendingPayoutForRun,
  generateClaimCode,
  sendRewardToGauntletDiscordBot
};
