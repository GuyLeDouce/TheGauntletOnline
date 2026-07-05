const assert = require("assert");

const { QUESTIONS, validateQuestions } = require("../server/interview-questions");
const {
  CHARM_DECAY_GRACE_SECONDS,
  DEFAULT_TIER_PLAN,
  buildRunPlan,
  rewardForProgress,
  rewardForTimedProgress,
  sanitizeQuestion,
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
  rewardForTimedProgress(4, timedRun, new Date(startedAt.getTime() + CHARM_DECAY_GRACE_SECONDS * 1000), config),
  baseReward,
  "Full reward should apply through the reading grace period"
);
assert.strictEqual(
  rewardForTimedProgress(4, timedRun, new Date(startedAt.getTime() + 15_000), config),
  30,
  "Reward should decay only after the grace period"
);
assert.strictEqual(
  rewardForTimedProgress(4, timedRun, new Date(startedAt.getTime() + 20_000), config),
  20,
  "Half the decay window should pay half the reward"
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

validateQuestions(QUESTIONS);
const plannedIds = buildRunPlan(QUESTIONS, 15);
assert.strictEqual(plannedIds.length, 15, "Run plan should contain 15 questions");
const plannedQuestions = plannedIds.map((id) => QUESTIONS.find((question) => question.id === id));
for (const { tier, count } of DEFAULT_TIER_PLAN) {
  assert.strictEqual(
    plannedQuestions.filter((question) => question?.tier === tier).length,
    count,
    `Run plan should include ${count} tier ${tier} question(s)`
  );
}
const sanitized = sanitizeQuestion(QUESTIONS[0], 1, { interviewLength: 15 }, config);
assert.strictEqual(typeof sanitized.prompt.en, "string", "Sanitized question should include English prompt display text");
assert.strictEqual(typeof sanitized.prompt.fr, "string", "Sanitized question should include French prompt display text");
assert.strictEqual(typeof sanitized.prompt.es, "string", "Sanitized question should include Spanish prompt display text");
assert.strictEqual(typeof sanitized.options[0].label.fr, "string", "Sanitized options should include localized labels");
assert.strictEqual(sanitized.rewardGraceSeconds, CHARM_DECAY_GRACE_SECONDS, "Sanitized question should expose reward grace seconds for display");
assert.strictEqual(sanitized.correct, undefined, "Sanitized question must not expose raw correct text");
assert.strictEqual(sanitized.wrong, undefined, "Sanitized question must not expose raw wrong text");
assert.strictEqual(sanitized.i18n, undefined, "Sanitized question must not expose raw i18n correctness groups");
assert.strictEqual(sanitized.correctOptionId, undefined, "Sanitized question must not expose correct option before answering");

console.log("Game logic checks passed.");
