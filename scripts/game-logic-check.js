const assert = require("assert");

const {
  rewardForProgress,
  rewardForTimedProgress,
  timerForTier
} = require("../server/game-engine");

const config = {
  rewardMultiplier: 1,
  timersEnabled: true
};

const startedAt = new Date("2026-07-03T12:00:00.000Z");
const expiresAt = new Date(startedAt.getTime() + 30_000);
const timedRun = {
  questionStartedAt: startedAt.toISOString(),
  questionExpiresAt: expiresAt.toISOString()
};

const baseReward = rewardForProgress(4, config);
assert.strictEqual(baseReward, 40, "Unexpected base reward for question 4");
assert.strictEqual(
  rewardForTimedProgress(4, timedRun, startedAt, config),
  baseReward,
  "Full reward should apply at the start of the timer"
);
assert.strictEqual(
  rewardForTimedProgress(4, timedRun, new Date(startedAt.getTime() + 15_000), config),
  20,
  "Half the timer should pay half the reward"
);
assert.strictEqual(
  rewardForTimedProgress(4, timedRun, expiresAt, config),
  0,
  "Expired timers should pay zero"
);
assert.strictEqual(
  rewardForTimedProgress(4, {}, new Date(startedAt.getTime() + 15_000), config),
  baseReward,
  "Untimed questions should keep the full reward"
);

for (let tier = 1; tier <= 5; tier += 1) {
  assert.strictEqual(timerForTier(tier, config), 60, `Tier ${tier} should have a 60-second timer`);
}

console.log("Game logic checks passed.");
