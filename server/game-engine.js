const crypto = require("crypto");
const { toBoolean, toNumber } = require("./validators");

const DIGNITY_BASE = 1;
const DIGNITY_BONUS_TIERS = [
  { min: 1, max: 3, bonus: 1 },
  { min: 4, max: 9, bonus: 2 },
  { min: 10, max: Infinity, bonus: 3 }
];
const REVIVE_PILL_BONUS = 1;

const DEFAULT_REWARD_TABLE = [
  10, 15, 25, 40, 60, 90, 140, 200, 275, 375, 500, 650, 850, 1200, 1600
];
const CASHOUT_CHECKPOINTS = new Set([5, 8, 10, 12, 13, 14]);
const TIER_LABELS = {
  1: "Easy Ugly HR",
  2: "Certified Ugly Applicant",
  3: "Deep Ugly Department",
  4: "Ugly Labs Internal",
  5: "Impossible Ugly Final"
};
const TIER_TIMER_SECONDS = {
  1: 60,
  2: 60,
  3: 60,
  4: 60,
  5: 60
};

function getGameConfig() {
  return {
    interviewLength: Math.trunc(toNumber(process.env.INTERVIEW_LENGTH, 15, { min: 5, max: 15 })),
    timersEnabled: toBoolean(process.env.INTERVIEW_TIMERS_ENABLED, true),
    fullClearBonus: Math.trunc(toNumber(process.env.CHARM_FULL_CLEAR_BONUS, 2000, { min: 0 })),
    outOfDignityMultiplier: toNumber(process.env.CHARM_OUT_OF_DIGNITY_MULTIPLIER, 0.5, { min: 0, max: 1 }),
    rewardMultiplier: toNumber(process.env.CHARM_REWARD_MULTIPLIER, 1, { min: 0 }),
    rewardCooldownHours: toNumber(process.env.REWARD_COOLDOWN_HOURS, 24, { min: 0 }),
    runMaxActiveHours: toNumber(process.env.RUN_MAX_ACTIVE_HOURS, 2, { min: 0.25 }),
    allowZeroSquigReward: toBoolean(process.env.ALLOW_ZERO_SQUIG_REWARD, false)
  };
}

function calculateDignity(squigCount, hasRevivePill) {
  const count = Math.max(0, Number(squigCount || 0));
  const tier = DIGNITY_BONUS_TIERS.find((entry) => count >= entry.min && count <= entry.max);
  return DIGNITY_BASE + (tier ? tier.bonus : 0) + (hasRevivePill ? REVIVE_PILL_BONUS : 0);
}

function getWalletTitle(squigCount, hasRevivePill) {
  if (hasRevivePill) return "Pill Goblin";
  if (squigCount >= 10) return "Ugly Whale";
  if (squigCount >= 4) return "Deep Ugly";
  if (squigCount >= 1) return "Certified Ugly";
  return "Unpaid Tourist";
}

function getInterviewRank(correctCount, wrongCount) {
  if (correctCount >= 15 && wrongCount === 0) return "Too Ugly To Reject";
  if (correctCount >= 15) return "Hired By InSquignito";
  if (correctCount >= 13) return "Ugly Labs Finalist";
  if (correctCount >= 10) return "Deeply Unwell Candidate";
  if (correctCount >= 7) return "Certified Ugly";
  if (correctCount >= 4) return "Mildly Ugly Applicant";
  return "Pretty Intern";
}

function rewardForProgress(progressNumber, config = getGameConfig()) {
  const base = DEFAULT_REWARD_TABLE[Math.max(0, progressNumber - 1)] || 0;
  return Math.floor(base * config.rewardMultiplier);
}

function rewardForTimedProgress(progressNumber, runState = {}, answeredAt = new Date(), config = getGameConfig()) {
  const baseReward = rewardForProgress(progressNumber, config);
  if (!baseReward || !runState.questionStartedAt || !runState.questionExpiresAt) return baseReward;

  const startedAt = Date.parse(runState.questionStartedAt);
  const expiresAt = Date.parse(runState.questionExpiresAt);
  const answeredAtMs = answeredAt instanceof Date ? answeredAt.getTime() : Date.parse(answeredAt);
  if (![startedAt, expiresAt, answeredAtMs].every(Number.isFinite) || expiresAt <= startedAt) {
    return baseReward;
  }

  const remainingMs = Math.max(0, expiresAt - answeredAtMs);
  if (remainingMs <= 0) return 0;
  const totalMs = expiresAt - startedAt;
  return Math.max(1, Math.floor(baseReward * (remainingMs / totalMs)));
}

function timerForTier(tier, config = getGameConfig()) {
  if (!config.timersEnabled) return null;
  return TIER_TIMER_SECONDS[tier] || null;
}

function getQuestionWindow(question, startedAt = new Date(), config = getGameConfig()) {
  const seconds = timerForTier(question.tier, config);
  const start = new Date(startedAt);
  return {
    questionStartedAt: start,
    questionExpiresAt: seconds ? new Date(start.getTime() + seconds * 1000) : null,
    timerSeconds: seconds
  };
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.randomInt(index + 1);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function buildRunPlan(questions, interviewLength = 15) {
  const plan = [];
  for (let tier = 1; tier <= 5; tier += 1) {
    const tierQuestions = questions.filter((question) => question.tier === tier);
    plan.push(...shuffle(tierQuestions).slice(0, 3));
  }
  return plan.slice(0, interviewLength).map((question) => question.id);
}

function sanitizeQuestion(question, progressNumber, runState = {}, config = getGameConfig()) {
  const window = getQuestionWindow(question, runState.questionStartedAt || new Date(), config);
  return {
    id: question.id,
    tier: question.tier,
    tierLabel: question.difficulty || TIER_LABELS[question.tier],
    progressNumber,
    interviewLength: runState.interviewLength || config.interviewLength,
    category: question.category,
    imageKey: question.imageKey || "interviewDesk",
    prompt: question.prompt,
    options: question.options.map((option) => ({ id: option.id, text: option.text, label: option.label })),
    reward: rewardForProgress(progressNumber, config),
    timerSeconds: window.timerSeconds,
    startedAt: runState.questionStartedAt || window.questionStartedAt.toISOString(),
    expiresAt: runState.questionExpiresAt || (window.questionExpiresAt ? window.questionExpiresAt.toISOString() : null),
    flavorText: question.flavorText || "InSquignito taps the clipboard. It leaves a stain."
  };
}

function questionMap(questions) {
  return new Map(questions.map((question) => [question.id, question]));
}

module.exports = {
  CASHOUT_CHECKPOINTS,
  DEFAULT_REWARD_TABLE,
  DIGNITY_BASE,
  DIGNITY_BONUS_TIERS,
  REVIVE_PILL_BONUS,
  TIER_LABELS,
  buildRunPlan,
  calculateDignity,
  getGameConfig,
  getInterviewRank,
  getQuestionWindow,
  getWalletTitle,
  questionMap,
  rewardForProgress,
  rewardForTimedProgress,
  sanitizeQuestion,
  timerForTier
};
