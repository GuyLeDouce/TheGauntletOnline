export const APP_COPY = {
  info: [
    "Every player starts with 2 lives.",
    "Each run is seeded by the arena. The server validates every choice and payout.",
    "Each room has a readable clue. Pick the safer option, but nothing is guaranteed.",
    "If you die and still have lives left, the run restarts at Room 1 and your current stack resets to 0.",
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
  typewriterMsPerCharacter: 28,
  preRevealDelayMs: 900,
  revealHoldMs: 1400,
  restartDelayMs: 2200
};

export const COMPLETION_BONUS = 1000;
export const LOBBY_IMAGE = "/assets/squigs-gauntlet-lobby.png";
export const DEAD_IMAGE = "/assets/squigs-gauntlet-failure.png";
export const RETRY_IMAGE = "/assets/squigs-gauntlet-retry.png";

export const DECISION_GAUNTLET_RESTART_TEXT = (deathHint) =>
  [
    "He chose wrong.",
    "",
    "DEAD.",
    "",
    deathHint ? `The arena leaves a mark: ${deathHint}` : "The room remembers what happened.",
    "",
    "InSquignito gets another chance.",
    "Returning to Room 1."
  ].join("\n");

export const DECISION_GAUNTLET_FAIL_END_TEXT = (amount) =>
  [
    "DEAD.",
    "",
    "No more chances.",
    "No more doors.",
    "",
    "InSquignito falls back into the void.",
    "",
    `You walk away with ${amount} Pts.`,
    "",
    "Tomorrow, perhaps."
  ].join("\n");

export const DECISION_GAUNTLET_HALVED_TEXT = (startingAmount, finalAmount, deathHint) =>
  [
    "The arena takes its cut.",
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
    "The correct platform rises.",
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
    difficultyLabel: "Training room",
    safeSurvivalChance: 0.98,
    mistakeSurvivalChance: 0.45,
    reward: 15,
    image: LOBBY_IMAGE,
    text: [
      "Two identical doors. No markings. No sound behind them.",
      "One door has a colder handle.",
      "The arena likes the obvious mistake.",
      "",
      "Choose a door. InSquignito is waiting."
    ].join("\n"),
    buttons: ["Sweating Glass", "Still Glass"]
  },
  {
    roundIndex: 2,
    difficultyLabel: "Glass read",
    safeSurvivalChance: 0.94,
    mistakeSurvivalChance: 0.34,
    reward: 35,
    image: LOBBY_IMAGE,
    text: [
      "The glass bridge hums beneath his feet.",
      "One panel carries a faint vibration.",
      "The other is silent in a way glass should not be.",
      "",
      "Choose the next step."
    ].join("\n"),
    buttons: ["Singing Rope", "Quiet Rope"]
  },
  {
    roundIndex: 3,
    difficultyLabel: "Symbol memory",
    safeSurvivalChance: 0.89,
    mistakeSurvivalChance: 0.25,
    reward: 65,
    image: LOBBY_IMAGE,
    text: [
      "Cold stone. Iron bars. Two levers.",
      "A scratched arrow points toward the lever the last survivor avoided.",
      "The arena is honest only when it is cruel.",
      "",
      "Pull one. Quickly."
    ].join("\n"),
    buttons: ["A", "B"]
  },
  {
    roundIndex: 4,
    difficultyLabel: "Timed breath",
    safeSurvivalChance: 0.83,
    mistakeSurvivalChance: 0.18,
    reward: 110,
    image: LOBBY_IMAGE,
    text: [
      "The air burns. The room is filling fast.",
      "Two masks hang on the wall.",
      "One mask fogs from the inside before anyone touches it.",
      "One stays clean.",
      "",
      "Choose before he collapses."
    ].join("\n"),
    buttons: ["Breeze", "Stale Air", "Scratch Marks"]
  },
  {
    roundIndex: 5,
    difficultyLabel: "Mirror split",
    safeSurvivalChance: 0.76,
    mistakeSurvivalChance: 0.13,
    reward: 175,
    image: LOBBY_IMAGE,
    text: [
      "A hallway splits in two - perfectly mirrored.",
      "In one reflection, InSquignito blinks late.",
      "In the other, he does not blink at all.",
      "",
      "Choose a reflection."
    ].join("\n"),
    buttons: ["Creaking Door", "Silent Door"]
  },
  {
    roundIndex: 6,
    difficultyLabel: "Poison bargain",
    safeSurvivalChance: 0.69,
    mistakeSurvivalChance: 0.09,
    reward: 260,
    image: LOBBY_IMAGE,
    text: [
      "Two identical glasses. Clear liquid.",
      "One glass sweats. One glass refuses to.",
      "The safe drink is never eager.",
      "",
      "He must drink."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 7,
    difficultyLabel: "Rope tension",
    safeSurvivalChance: 0.62,
    mistakeSurvivalChance: 0.07,
    reward: 380,
    image: LOBBY_IMAGE,
    text: [
      "A rock island in the center of a massive gorge.",
      "Two ropes stretch across the void.",
      "One rope sings under tension.",
      "One hangs quiet and loose.",
      "",
      "There is no third option."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 8,
    difficultyLabel: "Ancient tunnel",
    safeSurvivalChance: 0.55,
    mistakeSurvivalChance: 0.05,
    reward: 540,
    image: LOBBY_IMAGE,
    text: [
      "An ancient tunnel splits into two dark passages.",
      "A faint breeze drifts from one side.",
      "The other smells wrong.",
      "",
      "The breeze may be an exit. Or bait.",
      "Choose the path."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 9,
    difficultyLabel: "Elevator tell",
    safeSurvivalChance: 0.48,
    mistakeSurvivalChance: 0.04,
    reward: 760,
    image: LOBBY_IMAGE,
    text: [
      "Two rusted elevator doors.",
      "One creaks open just slightly.",
      "The other stands still and silent.",
      "",
      "One rises.",
      "One falls.",
      "",
      "Step inside."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 10,
    difficultyLabel: "Final platform",
    safeSurvivalChance: 0.41,
    mistakeSurvivalChance: 0.02,
    reward: 1100,
    image: LOBBY_IMAGE,
    text: [
      "The arena falls silent.",
      "A spotlight locks onto InSquignito.",
      "Two glowing platforms stand before him.",
      "One light warms his shadow.",
      "The other erases it.",
      "",
      "The countdown begins."
    ].join("\n"),
    buttons: ["Warm Shadow", "Erased Shadow"]
  }
];
