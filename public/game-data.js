export const APP_COPY = {
  info: [
    "Every player starts with 2 lives.",
    "Each run is seeded by the arena. The server validates every choice and payout.",
    "Each room gives a readable arena tell. Pick the safer symbol, but nothing is guaranteed.",
    "If you die and still have lives left, you choose whether to spend the next life or return to the lobby.",
    "Death reveals a room hint for the rest of that run, so failure can teach the next attempt.",
    "After each cleared room, choose Continue or Go Home Scared.",
    "If you run out of lives, the arena halves your current stack.",
    "Clearing all 10 rooms grants a 1000 Pts completion bonus.",
    "A strong player should clear all rooms about 5% of the time.",
    "Points are leaderboard-only for now.",
    "The leaderboard defaults to monthly, with weekly and all-time views."
  ]
};

export const TIMINGS = {
  typewriterMsPerCharacter: 24,
  preRevealDelayMs: 850,
  revealHoldMs: 1300
};

export const COMPLETION_BONUS = 1000;
export const LOBBY_IMAGE = "/assets/squigs-gauntlet-lobby.png";
export const DEAD_IMAGE = "/assets/squigs-gauntlet-failure.png";
export const RETRY_IMAGE = "/assets/squigs-gauntlet-retry.png";

export const DECISION_GAUNTLET_RESTART_TEXT = (deathHint) =>
  [
    "ELIMINATED.",
    "",
    "The arena marks the mistake instead of hiding it.",
    deathHint ? `Hint saved: ${deathHint}` : "Hint saved: the room remembers what happened.",
    "",
    "You still have a life left.",
    "Spend it to restart at Room 1, or return to the lobby."
  ].join("\n");

export const DECISION_GAUNTLET_FAIL_END_TEXT = (amount) =>
  [
    "FINAL ELIMINATION.",
    "",
    "No more chances.",
    "No more symbols.",
    "",
    "InSquignito falls out of the spotlight.",
    "",
    `You walk away with ${amount} Pts.`,
    "",
    "The lobby is waiting."
  ].join("\n");

export const DECISION_GAUNTLET_HALVED_TEXT = (startingAmount, finalAmount, deathHint) =>
  [
    "THE ARENA COLLECTS.",
    "",
    deathHint ? `Final room note: ${deathHint}` : "No useful mark remains.",
    "",
    `Your stacked ${startingAmount} Pts has been halved.`,
    `Final payout: ${finalAmount} Pts.`
  ].join("\n");

export const DECISION_GAUNTLET_WIN_END_TEXT = (basePoints, bonus, total) =>
  [
    "ALIVE.",
    "",
    "The final symbol locks into place.",
    "The spotlight intensifies.",
    "The arena trembles.",
    "",
    "You have completed The Gauntlet.",
    "",
    `${basePoints} Pts earned`,
    `+${bonus} Completion Bonus`,
    "",
    `Total: ${total} Pts`,
    "",
    "Go brag. You earned it."
  ].join("\n");

export const DECISION_GAUNTLET_CLAIM_TEXT = [
  "You cleared every room.",
  "",
  "Open a ticket in the Ugly Labs Discord and claim your prize:",
  "https://squigs.io/discord"
].join("\n");

export const DECISION_GAUNTLET_ROUNDS = [
  {
    roundIndex: 1,
    difficultyLabel: "Door Wake",
    safeSurvivalChance: 0.98,
    mistakeSurvivalChance: 0.45,
    reward: 15,
    image: LOBBY_IMAGE,
    text: [
      "Two doors light up first.",
      "The red circle door and the blue triangle door both unlock.",
      "One light blinks before the other catches up.",
      "",
      "Choose the symbol that woke first."
    ].join("\n"),
    buttons: ["Red Circle", "Blue Triangle"]
  },
  {
    roundIndex: 2,
    difficultyLabel: "Steady Reflection",
    safeSurvivalChance: 0.94,
    mistakeSurvivalChance: 0.34,
    reward: 35,
    image: LOBBY_IMAGE,
    text: [
      "Two platforms rise from the floor.",
      "Gold square. Purple diamond.",
      "One reflection stays still. The other jitters under the lights.",
      "",
      "Step onto the steadier mark."
    ].join("\n"),
    buttons: ["Gold Square", "Purple Diamond"]
  },
  {
    roundIndex: 3,
    difficultyLabel: "Scratch Path",
    safeSurvivalChance: 0.89,
    mistakeSurvivalChance: 0.25,
    reward: 65,
    image: LOBBY_IMAGE,
    text: [
      "The red circle and gold square doors grind open.",
      "Fresh scratches cut across the floor.",
      "They curve away from one symbol like something was dragged back.",
      "",
      "Pick the symbol the scratches avoid."
    ].join("\n"),
    buttons: ["Red Circle", "Gold Square"]
  },
  {
    roundIndex: 4,
    difficultyLabel: "Flicker Test",
    safeSurvivalChance: 0.83,
    mistakeSurvivalChance: 0.18,
    reward: 110,
    image: LOBBY_IMAGE,
    text: [
      "Blue triangle and purple diamond wait under separate spotlights.",
      "One beam holds clean.",
      "The other flickers like it is counting down.",
      "",
      "Choose the symbol under the clean light."
    ].join("\n"),
    buttons: ["Blue Triangle", "Purple Diamond"]
  },
  {
    roundIndex: 5,
    difficultyLabel: "Shadow Read",
    safeSurvivalChance: 0.76,
    mistakeSurvivalChance: 0.13,
    reward: 175,
    image: LOBBY_IMAGE,
    text: [
      "Red circle. Purple diamond.",
      "InSquignito freezes between them.",
      "His shadow stretches toward one door even though the spotlight is overhead.",
      "",
      "Follow the shadow, or ignore it."
    ].join("\n"),
    buttons: ["Red Circle", "Purple Diamond"]
  },
  {
    roundIndex: 6,
    difficultyLabel: "Low Hum",
    safeSurvivalChance: 0.69,
    mistakeSurvivalChance: 0.09,
    reward: 260,
    image: LOBBY_IMAGE,
    text: [
      "Blue triangle and gold square pulse in alternating beats.",
      "One hum is low and steady.",
      "The other climbs higher every second.",
      "",
      "Choose before the pitch peaks."
    ].join("\n"),
    buttons: ["Blue Triangle", "Gold Square"]
  },
  {
    roundIndex: 7,
    difficultyLabel: "Warning Skip",
    safeSurvivalChance: 0.62,
    mistakeSurvivalChance: 0.07,
    reward: 380,
    image: LOBBY_IMAGE,
    text: [
      "Three symbols activate at once.",
      "Red circle. Blue triangle. Gold square.",
      "The warning lamps sweep across the room, but one symbol is skipped.",
      "",
      "Choose the mark the warning refuses to touch."
    ].join("\n"),
    buttons: ["Red Circle", "Blue Triangle", "Gold Square"]
  },
  {
    roundIndex: 8,
    difficultyLabel: "Cracked Tile",
    safeSurvivalChance: 0.55,
    mistakeSurvivalChance: 0.05,
    reward: 540,
    image: LOBBY_IMAGE,
    text: [
      "Red circle, gold square, and purple diamond glow brighter.",
      "Two doors have cracked tiles at their thresholds.",
      "One threshold is clean.",
      "",
      "Choose the clean approach."
    ].join("\n"),
    buttons: ["Red Circle", "Gold Square", "Purple Diamond"]
  },
  {
    roundIndex: 9,
    difficultyLabel: "Dust Line",
    safeSurvivalChance: 0.48,
    mistakeSurvivalChance: 0.04,
    reward: 760,
    image: LOBBY_IMAGE,
    text: [
      "Blue triangle. Gold square. Purple diamond.",
      "Fresh dust rolls across the stage.",
      "It stops at one symbol like an invisible wall is holding it back.",
      "",
      "Step where the dust stops."
    ].join("\n"),
    buttons: ["Blue Triangle", "Gold Square", "Purple Diamond"]
  },
  {
    roundIndex: 10,
    difficultyLabel: "Final Silence",
    safeSurvivalChance: 0.41,
    mistakeSurvivalChance: 0.02,
    reward: 1100,
    image: LOBBY_IMAGE,
    text: [
      "Every symbol comes alive.",
      "Red circle. Blue triangle. Gold square. Purple diamond.",
      "One glow makes the entire arena go silent.",
      "",
      "Choose the final mark."
    ].join("\n"),
    buttons: ["Red Circle", "Blue Triangle", "Gold Square", "Purple Diamond"]
  }
];
