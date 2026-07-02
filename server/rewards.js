const crypto = require("crypto");
const { createPayout } = require("./db");

const CLAIM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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
  await notifyPayoutWebhook(run, payout);
  return payout;
}

module.exports = {
  createPendingPayoutForRun,
  generateClaimCode
};
