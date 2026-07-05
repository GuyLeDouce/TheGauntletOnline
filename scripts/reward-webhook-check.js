const assert = require("assert");
const crypto = require("crypto");

process.env.DATABASE_URL_LEADERBOARD = "";
delete process.env.DISCORD_PAYOUT_WEBHOOK_URL;

const {
  createPendingPayoutForRun,
  rewardWebhookSecretFingerprint
} = require("../server/rewards");

const REWARD_ENV_KEYS = [
  "GAUNTLET_DISCORD_REWARD_WEBHOOK_URL",
  "GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET",
  "GAUNTLET_DISCORD_REWARD_WEBHOOK_TIMEOUT_MS",
  "GAUNTLET_DISCORD_REWARD_WEBHOOK_ENABLED"
];

function clearRewardEnv() {
  for (const key of REWARD_ENV_KEYS) delete process.env[key];
  delete process.env.DISCORD_PAYOUT_WEBHOOK_URL;
}

function makeRun(suffix, overrides = {}) {
  return {
    runId: `reward-webhook-check-${suffix}`,
    clientId: `reward_webhook_check_${suffix}`,
    mode: "reward",
    status: "completed",
    resultType: "Full Clear",
    discordUserId: `discord-${suffix}`,
    discordHandle: `squig-${suffix}`,
    walletAddress: "0x1111111111111111111111111111111111111111",
    correctCount: 15,
    wrongCount: 0,
    charmStack: 1600,
    charmFinal: 3600,
    squigCount: 2,
    hasRevivePill: true,
    walletScanId: 42,
    ...overrides
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload)
  };
}

async function captureConsole(method, fn) {
  const original = console[method];
  const messages = [];
  console[method] = (...args) => messages.push(args.map(String).join(" "));
  try {
    await fn(messages);
  } finally {
    console[method] = original;
  }
  return messages;
}

async function withFetch(mockFetch, fn) {
  const original = global.fetch;
  global.fetch = mockFetch;
  try {
    await fn();
  } finally {
    global.fetch = original;
  }
}

async function assertMissingWebhookEnvLeavesPending() {
  clearRewardEnv();
  await withFetch(
    async () => {
      throw new Error("fetch should not be called when reward webhook URL is missing");
    },
    async () => {
      const payout = await createPendingPayoutForRun(makeRun("missing-url"));
      assert.strictEqual(payout.status, "pending", "missing reward webhook URL should leave payout pending");
    }
  );
}

async function assertDisabledWebhookLeavesPending() {
  clearRewardEnv();
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_URL = "https://discord-bot.example/webhooks/gauntlet-online/reward";
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET = "shared-secret";
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_ENABLED = "false";
  await withFetch(
    async () => {
      throw new Error("fetch should not be called when reward webhook is disabled");
    },
    async () => {
      const payout = await createPendingPayoutForRun(makeRun("disabled"));
      assert.strictEqual(payout.status, "pending", "disabled reward webhook should leave payout pending");
    }
  );
}

async function assertMissingSecretSkipsUnsignedWebhook() {
  clearRewardEnv();
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_URL = "https://discord-bot.example/webhooks/gauntlet-online/reward";
  let fetchCalled = false;
  await withFetch(
    async () => {
      fetchCalled = true;
      throw new Error("fetch should not be called without a reward webhook secret");
    },
    async () => {
      const messages = await captureConsole("warn", async () => {
        const payout = await createPendingPayoutForRun(makeRun("missing-secret"));
        assert.strictEqual(payout.status, "pending", "missing secret should leave payout pending");
      });
      assert.strictEqual(fetchCalled, false, "unsigned reward webhook should not be sent");
      assert(messages.some((message) => message.includes("GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET")), "missing secret should log a clear warning");
    }
  );
}

async function assertSuccessfulWebhookMarksPaid() {
  clearRewardEnv();
  const webhookUrl = "https://discord-bot.example/webhooks/gauntlet-online/reward";
  const secret = "shared-secret";
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_URL = webhookUrl;
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET = secret;
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_TIMEOUT_MS = "8000";

  let calls = 0;
  await withFetch(
    async (url, options) => {
      calls += 1;
      assert.strictEqual(url, webhookUrl, "reward webhook URL should target the bot endpoint");
      assert.strictEqual(options.method, "POST");
      assert.strictEqual(options.headers["content-type"], "application/json");
      assert.strictEqual(options.headers["x-gauntlet-secret-fingerprint"], rewardWebhookSecretFingerprint(secret));
      assert.strictEqual(options.headers["x-gauntlet-secret-fingerprint"].length, 12);

      const body = options.body;
      const payload = JSON.parse(body);
      const timestamp = options.headers["x-gauntlet-timestamp"];
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${body}`)
        .digest("hex");

      assert.strictEqual(options.headers["x-gauntlet-signature"], `sha256=${expectedSignature}`);
      assert.strictEqual(options.headers["x-gauntlet-idempotency-key"], payload.payoutId);
      assert.strictEqual(payload.type, "ugly_interview.reward");
      assert.strictEqual(payload.eventId, payload.payoutId);
      assert.strictEqual(payload.player.discordUserId, "discord-success");
      assert.strictEqual(payload.player.walletAddress, "0x1111111111111111111111111111111111111111");
      assert.deepStrictEqual(payload.reward, { amount: 3600, currency: "CHARM" });
      assert.strictEqual(payload.run.correctCount, 15);
      assert.strictEqual(payload.run.hasRevivePill, true);
      assert(Number.isFinite(Date.parse(payload.createdAt)), "createdAt should be an ISO timestamp");

      return jsonResponse(200, { ok: true, paid: true });
    },
    async () => {
      const payout = await createPendingPayoutForRun(makeRun("success"));
      assert.strictEqual(calls, 1, "successful reward webhook should be sent once");
      assert.strictEqual(payout.status, "paid", "successful reward webhook should mark payout paid");
      assert.strictEqual(payout.adminNote, "Auto-paid by The Gauntlet Discord webhook");
      assert(payout.paidAt, "paid payout should include paidAt");
    }
  );
}

async function assertFailedWebhookLeavesPending() {
  clearRewardEnv();
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_URL = "https://discord-bot.example/webhooks/gauntlet-online/reward";
  process.env.GAUNTLET_DISCORD_REWARD_WEBHOOK_SECRET = "shared-secret";

  await withFetch(
    async () => jsonResponse(500, { ok: false, error: "bot unavailable" }),
    async () => {
      const messages = await captureConsole("error", async () => {
        const payout = await createPendingPayoutForRun(makeRun("failed"));
        assert.strictEqual(payout.status, "pending", "failed reward webhook should leave payout pending");
      });
      assert(messages.some((message) => message.includes("HTTP 500")), "failed webhook should log the HTTP status");
    }
  );
}

async function main() {
  await assertMissingWebhookEnvLeavesPending();
  await assertDisabledWebhookLeavesPending();
  await assertMissingSecretSkipsUnsignedWebhook();
  await assertSuccessfulWebhookMarksPaid();
  await assertFailedWebhookLeavesPending();
  clearRewardEnv();
  console.log("Reward webhook checks passed.");
}

main().catch((error) => {
  clearRewardEnv();
  console.error(error.stack || error.message);
  process.exit(1);
});
