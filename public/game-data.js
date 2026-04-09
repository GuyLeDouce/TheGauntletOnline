export const APP_COPY = {
  info: [
    "Every player starts with 2 lives.",
    "Clear 10 path-choice rooms in order.",
    "After each cleared room, choose Continue or Go Home Scared.",
    "If you die and still have lives left, the run restarts at Room 1 and your current stack resets to 0.",
    "If you run out of lives, the run ends with whatever you had banked before the fatal room.",
    "Clearing all 10 rooms grants a 500 Pts completion bonus.",
    "After a full clear, open a ticket in the Ugly Labs Discord to claim your prize."
  ]
};

export const TIMINGS = {
  typewriterMsPerCharacter: 56,
  preRevealDelayMs: 1400,
  revealHoldMs: 2200,
  restartDelayMs: 3600
};

export const COMPLETION_BONUS = 500;
export const DEAD_IMAGE = "https://i.imgur.com/dsTrQX1.jpeg";
export const RETRY_IMAGE = "https://i.imgur.com/CYgIz04.jpeg";

export const DECISION_GAUNTLET_RESTART_TEXT = [
  "He chose.",
  "",
  "DEAD.",
  "",
  "But he's not finished.",
  "",
  "InSquignito gets another chance...",
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

export const DECISION_GAUNTLET_HALVED_TEXT = (startingAmount, finalAmount) =>
  [
    "The arena takes its cut.",
    "",
    `Your stacked ${startingAmount} Pts has been halved.`,
    `Final payout: ${finalAmount} Pts.`
  ].join("\n");

export const DECISION_GAUNTLET_WIN_END_TEXT = [
  "ALIVE.",
  "",
  "The correct platform rises.",
  "The spotlight intensifies.",
  "The arena trembles.",
  "",
  "You have completed The Gauntlet.",
  "",
  "550 Pts earned",
  "+500 Completion Bonus",
  "",
  "Total: 1050 Pts",
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
    passChance: 0.95,
    reward: 10,
    image: "https://i.imgur.com/X1ZMmnA.jpeg",
    text: [
      "Two identical doors. No markings. No sound behind them.",
      "One leads forward.",
      "The other ends everything before it even begins.",
      "",
      "Choose a door. InSquignito is waiting."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 2,
    passChance: 0.85,
    reward: 20,
    image: "https://i.imgur.com/4VqCQxL.jpeg",
    text: [
      "The glass bridge hums beneath his feet.",
      "One panel is reinforced.",
      "The other was never meant to hold weight.",
      "",
      "He can't stay in the middle forever.",
      "Choose the next step."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 3,
    passChance: 0.75,
    reward: 30,
    image: "https://i.imgur.com/kYV5AF9.jpeg",
    text: [
      "Cold stone. Iron bars. Two levers.",
      "One unlocks the cell.",
      "The other seals it permanently.",
      "",
      "Pull one. Quickly."
    ].join("\n"),
    buttons: ["A", "B"]
  },
  {
    roundIndex: 4,
    passChance: 0.65,
    reward: 40,
    image: "https://i.imgur.com/Emp2Z0z.jpeg",
    text: [
      "The air burns. The room is filling fast.",
      "Two masks hang on the wall.",
      "One filters the poison.",
      "One feeds it straight in.",
      "",
      "Choose before he collapses."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 5,
    passChance: 0.55,
    reward: 50,
    image: "https://i.imgur.com/lfTtRbB.jpeg",
    text: [
      "A hallway splits in two - perfectly mirrored.",
      "One path leads forward.",
      "The other folds reality inside out.",
      "",
      "Choose a reflection."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 6,
    passChance: 0.45,
    reward: 60,
    image: "https://i.imgur.com/6K0D77j.jpeg",
    text: [
      "Two identical glasses. Clear liquid.",
      "One is water.",
      "One is not.",
      "",
      "He must drink.",
      "Choose wisely."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 7,
    passChance: 0.4,
    reward: 70,
    image: "https://i.imgur.com/y9fAmwP.jpeg",
    text: [
      "A rock island in the center of a massive gorge.",
      "Two ropes stretch across the void.",
      "One will hold.",
      "One will snap.",
      "",
      "There is no third option."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 8,
    passChance: 0.3,
    reward: 80,
    image: "https://i.imgur.com/JhDG1UH.jpeg",
    text: [
      "An ancient tunnel splits into two dark passages.",
      "A faint breeze drifts from one side.",
      "The other smells... wrong.",
      "",
      "Choose the path."
    ].join("\n"),
    buttons: ["Left", "Right"]
  },
  {
    roundIndex: 9,
    passChance: 0.15,
    reward: 90,
    image: "https://i.imgur.com/ng229d4.jpeg",
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
    passChance: 0.09,
    reward: 100,
    image: "https://i.imgur.com/5pI2xSt.jpeg",
    text: [
      "The arena falls silent.",
      "A spotlight locks onto InSquignito.",
      "Two glowing platforms stand before him.",
      "One is the podium.",
      "The other is a coffin dressed in light.",
      "",
      "The countdown begins."
    ].join("\n"),
    buttons: ["Left", "Right"]
  }
];
