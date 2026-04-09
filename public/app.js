import {
  APP_COPY,
  COMPLETION_BONUS,
  DECISION_GAUNTLET_FAIL_END_TEXT,
  DECISION_GAUNTLET_RESTART_TEXT,
  DECISION_GAUNTLET_ROUNDS,
  DECISION_GAUNTLET_WIN_END_TEXT,
  TIMINGS
} from "/game-data.js";

const STORAGE_KEYS = {
  profile: "gauntlet-online-profile",
  stats: "gauntlet-online-stats"
};

const els = {
  connectToggle: document.getElementById("connectToggle"),
  connectPanel: document.getElementById("connectPanel"),
  closeConnectPanel: document.getElementById("closeConnectPanel"),
  profileForm: document.getElementById("profileForm"),
  walletAddress: document.getElementById("walletAddress"),
  discordHandle: document.getElementById("discordHandle"),
  dripUserId: document.getElementById("dripUserId"),
  clearProfile: document.getElementById("clearProfile"),
  startGameButton: document.getElementById("startGameButton"),
  rulesButton: document.getElementById("rulesButton"),
  lobbyScreen: document.getElementById("lobbyScreen"),
  gameScreen: document.getElementById("gameScreen"),
  sceneImage: document.getElementById("sceneImage"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneText: document.getElementById("sceneText"),
  choiceButtons: document.getElementById("choiceButtons"),
  roundHud: document.getElementById("roundHud"),
  livesHud: document.getElementById("livesHud"),
  rewardHud: document.getElementById("rewardHud"),
  lobbyLives: document.getElementById("lobbyLives"),
  lobbyBest: document.getElementById("lobbyBest"),
  lobbyRuns: document.getElementById("lobbyRuns"),
  rulesDialog: document.getElementById("rulesDialog"),
  rulesCopy: document.getElementById("rulesCopy")
};

const state = {
  runId: null,
  roundIndex: 1,
  livesRemaining: 1,
  stack: 0,
  roundsCleared: 0,
  isBusy: false
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getProfile() {
  return loadJson(STORAGE_KEYS.profile, {
    walletAddress: "",
    discordHandle: "",
    dripUserId: ""
  });
}

function getStats() {
  return loadJson(STORAGE_KEYS.stats, {
    runs: []
  });
}

function saveRunRecord(record) {
  const stats = getStats();
  stats.runs.push({
    ...record,
    completedAt: new Date().toISOString()
  });
  saveJson(STORAGE_KEYS.stats, stats);
}

function currentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthStats() {
  const month = currentMonthKey();
  const runs = getStats().runs.filter((entry) => entry.month === month);
  const best = runs.reduce((max, entry) => Math.max(max, Number(entry.payout || 0)), 0);
  return { month, runs: runs.length, best };
}

function lifeTierFromProfile(profile) {
  if (profile.walletAddress && profile.discordHandle && profile.dripUserId) return 3;
  if ((profile.walletAddress && profile.discordHandle) || (profile.walletAddress && profile.dripUserId) || (profile.discordHandle && profile.dripUserId)) return 2;
  return 1;
}

function syncProfileForm() {
  const profile = getProfile();
  els.walletAddress.value = profile.walletAddress || "";
  els.discordHandle.value = profile.discordHandle || "";
  els.dripUserId.value = profile.dripUserId || "";
  els.lobbyLives.textContent = String(lifeTierFromProfile(profile));
}

function syncLobbyStats() {
  const summary = monthStats();
  els.lobbyBest.textContent = `${summary.best} $CHARM`;
  els.lobbyRuns.textContent = String(summary.runs);
  els.rulesCopy.textContent = APP_COPY.info.join("\n");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}

function toggleConnectPanel(forceOpen) {
  const willOpen = typeof forceOpen === "boolean"
    ? forceOpen
    : els.connectPanel.classList.contains("hidden");
  els.connectPanel.classList.toggle("hidden", !willOpen);
  els.connectToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function setVisibleScreen(screenName) {
  els.lobbyScreen.classList.toggle("visible", screenName === "lobby");
  els.gameScreen.classList.toggle("visible", screenName === "game");
}

function getRound(roundIndex) {
  return DECISION_GAUNTLET_ROUNDS.find((round) => round.roundIndex === roundIndex);
}

function updateHud() {
  els.roundHud.textContent = `Round ${state.roundIndex}/10`;
  els.livesHud.textContent = `Lives: ${state.livesRemaining}`;
  els.rewardHud.textContent = `Stack: ${state.stack} $CHARM`;
}

function disableButtons() {
  Array.from(els.choiceButtons.querySelectorAll("button")).forEach((button) => {
    button.disabled = true;
  });
}

async function typeText(text) {
  els.sceneText.textContent = "";
  for (let index = 0; index < text.length; index += 1) {
    els.sceneText.textContent += text[index];
    await wait(text[index] === "\n" ? TIMINGS.typewriterMsPerCharacter * 4 : TIMINGS.typewriterMsPerCharacter);
  }
}

function renderButtons(buttons) {
  els.choiceButtons.innerHTML = "";
  buttons.forEach((buttonConfig) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = buttonConfig.variant || "primary-action";
    button.textContent = buttonConfig.label;
    button.addEventListener("click", buttonConfig.onClick, { once: true });
    els.choiceButtons.appendChild(button);
  });
}

async function presentScene({ title, image, text, buttons = [] }) {
  state.isBusy = true;
  els.sceneTitle.textContent = title;
  els.sceneImage.src = image;
  els.sceneImage.alt = title;
  els.choiceButtons.innerHTML = "";
  await typeText(text);
  renderButtons(buttons);
  state.isBusy = false;
}

function startNewRun() {
  const profile = getProfile();
  state.runId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  state.roundIndex = 1;
  state.livesRemaining = lifeTierFromProfile(profile);
  state.stack = 0;
  state.roundsCleared = 0;
  updateHud();
  setVisibleScreen("game");
  showRound();
}

async function finishRun({ resultType, finalText, bonus = 0, finalImage }) {
  const payout = state.stack + bonus;
  saveRunRecord({
    month: currentMonthKey(),
    payout,
    finalRound: resultType === "Completion" ? 10 : state.roundsCleared || state.roundIndex,
    resultType
  });

  updateHud();

  await presentScene({
    title: "Decision Gauntlet Complete",
    image: finalImage,
    text: [
      finalText,
      "",
      `Final Round: ${resultType === "Completion" ? 10 : state.roundsCleared || state.roundIndex}`,
      `Final Award: ${payout} $CHARM`,
      `Result Type: ${resultType}`
    ].join("\n"),
    buttons: [
      {
        label: "Back To Lobby",
        variant: "primary-action",
        onClick: () => {
          syncLobbyStats();
          syncProfileForm();
          setVisibleScreen("lobby");
        }
      },
      {
        label: "Run Again",
        variant: "secondary-action",
        onClick: startNewRun
      }
    ]
  });

  syncLobbyStats();
}

async function promptCashOutConfirm(round) {
  await presentScene({
    title: "End This Run?",
    image: round.image,
    text: [
      "You still have lives remaining. Are you sure you want to cash out and end this run?",
      "",
      `Current Stacked Reward: ${state.stack} $CHARM`
    ].join("\n"),
    buttons: [
      {
        label: "Confirm Cash Out",
        variant: "danger-action",
        onClick: () => finishRun({
          resultType: "Cash Out",
          finalText: "You cashed out and ended the run.",
          finalImage: round.image
        })
      },
      {
        label: "Continue Playing",
        variant: "secondary-action",
        onClick: () => {
          state.roundIndex += 1;
          updateHud();
          showRound();
        }
      }
    ]
  });
}

async function promptPostRound(round) {
  await presentScene({
    title: `Round ${round.roundIndex} Cleared`,
    image: round.image,
    text: [
      `InSquignito survived and stacked ${round.reward} $CHARM.`,
      `Current stack: ${state.stack} $CHARM`,
      "",
      "Choose whether to keep pushing or end the run now."
    ].join("\n"),
    buttons: [
      {
        label: "Continue",
        variant: "primary-action",
        onClick: () => {
          state.roundIndex += 1;
          updateHud();
          showRound();
        }
      },
      {
        label: "Cash Out",
        variant: "secondary-action",
        onClick: () => promptCashOutConfirm(round)
      }
    ]
  });
}

async function resolveChoice(round) {
  if (state.isBusy) return;
  disableButtons();
  await wait(TIMINGS.preRevealDelayMs);
  await presentScene({
    title: `Decision Gauntlet - Round ${round.roundIndex}/10`,
    image: round.image,
    text: "You chose. Now InSquignito is..."
  });

  await wait(800);

  const survived = Math.random() <= round.passChance;
  await presentScene({
    title: `Decision Gauntlet - Round ${round.roundIndex}/10`,
    image: round.image,
    text: survived ? "ALIVE" : "DEAD"
  });

  await wait(TIMINGS.revealHoldMs);

  if (!survived) {
    state.livesRemaining -= 1;
    updateHud();

    if (state.livesRemaining <= 0) {
      await finishRun({
        resultType: "Out of Lives",
        finalText: DECISION_GAUNTLET_FAIL_END_TEXT(state.stack),
        finalImage: round.image
      });
      return;
    }

    state.roundIndex = 1;
    state.stack = 0;
    state.roundsCleared = 0;
    updateHud();

    await presentScene({
      title: "The Gauntlet Pulls Him Back",
      image: round.image,
      text: DECISION_GAUNTLET_RESTART_TEXT
    });

    await wait(TIMINGS.restartDelayMs);
    showRound();
    return;
  }

  state.stack += round.reward;
  state.roundsCleared = round.roundIndex;
  updateHud();

  if (round.roundIndex === DECISION_GAUNTLET_ROUNDS.length) {
    await finishRun({
      resultType: "Completion",
      finalText: DECISION_GAUNTLET_WIN_END_TEXT,
      bonus: COMPLETION_BONUS,
      finalImage: round.image
    });
    return;
  }

  await promptPostRound(round);
}

async function showRound() {
  const round = getRound(state.roundIndex);
  if (!round) return;

  updateHud();
  await presentScene({
    title: `Decision Gauntlet - Round ${round.roundIndex}/10`,
    image: round.image,
    text: `${round.text}\n\nRoom Difficulty: ${Math.round(round.passChance * 100)}% survival rate`,
    buttons: round.buttons.map((label) => ({
      label,
      variant: "primary-action",
      onClick: () => resolveChoice(round)
    }))
  });
}

els.connectToggle.addEventListener("click", () => toggleConnectPanel());
els.closeConnectPanel.addEventListener("click", () => toggleConnectPanel(false));
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.startGameButton.addEventListener("click", startNewRun);

els.profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextProfile = {
    walletAddress: els.walletAddress.value.trim(),
    discordHandle: els.discordHandle.value.trim(),
    dripUserId: els.dripUserId.value.trim()
  };
  saveJson(STORAGE_KEYS.profile, nextProfile);
  syncProfileForm();
  toggleConnectPanel(false);
  showToast("Profile details saved in this browser.");
});

els.clearProfile.addEventListener("click", () => {
  saveJson(STORAGE_KEYS.profile, {
    walletAddress: "",
    discordHandle: "",
    dripUserId: ""
  });
  syncProfileForm();
  showToast("Profile details cleared.");
});

window.addEventListener("click", (event) => {
  if (
    !els.connectPanel.classList.contains("hidden") &&
    !els.connectPanel.contains(event.target) &&
    !els.connectToggle.contains(event.target)
  ) {
    toggleConnectPanel(false);
  }
});

syncProfileForm();
syncLobbyStats();
