import {
  APP_COPY,
  COMPLETION_BONUS,
  DEAD_IMAGE,
  DECISION_GAUNTLET_CLAIM_TEXT,
  DECISION_GAUNTLET_FAIL_END_TEXT,
  DECISION_GAUNTLET_HALVED_TEXT,
  DECISION_GAUNTLET_RESTART_TEXT,
  DECISION_GAUNTLET_ROUNDS,
  DECISION_GAUNTLET_WIN_END_TEXT,
  RETRY_IMAGE,
  TIMINGS
} from "/game-data.js";

const STORAGE_KEYS = {
  clientId: "gauntlet-online-client-id",
  profile: "gauntlet-online-profile"
};

const els = {
  connectToggle: document.getElementById("connectToggle"),
  connectPanel: document.getElementById("connectPanel"),
  closeConnectPanel: document.getElementById("closeConnectPanel"),
  loginScreen: document.getElementById("loginScreen"),
  connectXButton: document.getElementById("connectXButton"),
  enterLobbyButton: document.getElementById("enterLobbyButton"),
  loginStatus: document.getElementById("loginStatus"),
  xAuthStatus: document.getElementById("xAuthStatus"),
  loginHandle: document.getElementById("loginHandle"),
  profileForm: document.getElementById("profileForm"),
  walletAddress: document.getElementById("walletAddress"),
  discordHandle: document.getElementById("discordHandle"),
  twitterHandle: document.getElementById("twitterHandle"),
  clearProfile: document.getElementById("clearProfile"),
  startGameButton: document.getElementById("startGameButton"),
  rulesButton: document.getElementById("rulesButton"),
  leaderboardButton: document.getElementById("leaderboardButton"),
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
  identityStatus: document.getElementById("identityStatus"),
  rulesDialog: document.getElementById("rulesDialog"),
  rulesCopy: document.getElementById("rulesCopy"),
  leaderboardDialog: document.getElementById("leaderboardDialog"),
  leaderboardCopy: document.getElementById("leaderboardCopy"),
  startPromptDialog: document.getElementById("startPromptDialog"),
  startPromptCopy: document.getElementById("startPromptCopy"),
  startPromptActions: document.getElementById("startPromptActions")
};

const state = {
  clientId: null,
  profile: {
    walletAddress: "",
    discordHandle: "",
    twitterHandle: ""
  },
  leaderboard: [],
  currentPlacement: null,
  xAuthEnabled: false,
  roundIndex: 1,
  livesRemaining: 2,
  stack: 0,
  roundsCleared: 0,
  isBusy: false
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getOrCreateClientId() {
  let clientId = window.localStorage.getItem(STORAGE_KEYS.clientId);
  if (!clientId) {
    clientId = `client_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(STORAGE_KEYS.clientId, clientId);
  }
  return clientId;
}

function readLocalProfile() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return { walletAddress: "", discordHandle: "", twitterHandle: "" };
    return JSON.parse(raw);
  } catch {
    return { walletAddress: "", discordHandle: "", twitterHandle: "" };
  }
}

function writeLocalProfile(profile) {
  window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function leaderboardName(profile = state.profile) {
  return profile.discordHandle || profile.twitterHandle || "";
}

function lifeTierFromProfile(profile) {
  void profile;
  return 2;
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
  els.loginScreen.classList.toggle("visible", screenName === "login");
  els.lobbyScreen.classList.toggle("visible", screenName === "lobby");
  els.gameScreen.classList.toggle("visible", screenName === "game");
}

function getRound(roundIndex) {
  return DECISION_GAUNTLET_ROUNDS.find((round) => round.roundIndex === roundIndex);
}

function updateHud() {
  els.roundHud.textContent = `Round ${state.roundIndex}/10`;
  els.livesHud.textContent = `Lives: ${state.livesRemaining}`;
  els.rewardHud.textContent = `Stack: ${state.stack} Pts`;
}

function syncProfileForm() {
  els.walletAddress.value = state.profile.walletAddress || "";
  els.discordHandle.value = state.profile.discordHandle || "";
  els.twitterHandle.value = state.profile.twitterHandle || "";
  els.lobbyLives.textContent = String(lifeTierFromProfile(state.profile));
  els.identityStatus.textContent = leaderboardName() || "None Set";
  els.loginHandle.textContent = state.profile.twitterHandle || "None";
  els.loginStatus.textContent = state.profile.twitterHandle ? "Connected" : "Not Connected";
}

function syncLobbySummary() {
  const best = Number(state.currentPlacement?.best_points_ever || 0);
  els.lobbyBest.textContent = `${best} Pts`;
  els.rulesCopy.textContent = APP_COPY.info.join("\n");
}

function syncLoginScreen() {
  els.xAuthStatus.textContent = state.xAuthEnabled ? "Ready" : "Not Configured";
  els.enterLobbyButton.classList.toggle("hidden", !state.profile.twitterHandle);
  els.connectXButton.textContent = state.profile.twitterHandle ? "Reconnect X Account" : "Connect X Account";
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

function renderLeaderboard(entries) {
  if (!entries.length) {
    els.leaderboardCopy.textContent = "No leaderboard entries yet.";
    return;
  }

  const currentClientId = state.clientId;
  const currentPlacement = state.currentPlacement;
  const wrapper = document.createElement("div");
  wrapper.className = "leaderboard-wrap";
  const list = document.createElement("ol");
  list.className = "leaderboard-list";

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = `leaderboard-item${entry.client_id === currentClientId ? " leaderboard-item-current" : ""}`;
    item.innerHTML = `
      <strong>#${entry.placement}</strong>
      <div class="leaderboard-main">
        <span class="leaderboard-name">${entry.display_name}</span>
        <span class="leaderboard-meta">Runs ${entry.user_runs_total} · Best ${entry.best_points_ever} · Wins ${entry.wins}</span>
      </div>
      <span class="leaderboard-points">${entry.total_points_earned} Pts</span>
    `;
    list.appendChild(item);
  });

  els.leaderboardCopy.innerHTML = "";
  wrapper.appendChild(list);
  els.leaderboardCopy.appendChild(wrapper);

  if (currentPlacement) {
    const summary = document.createElement("div");
    summary.className = "leaderboard-summary";
    summary.textContent =
      `Your placement: #${currentPlacement.placement} · ` +
      `${currentPlacement.total_points_earned} Pts · ` +
      `Runs ${currentPlacement.user_runs_total} · ` +
      `Best ${currentPlacement.best_points_ever} · Wins ${currentPlacement.wins}`;
    els.leaderboardCopy.appendChild(summary);
  }
}

async function refreshLeaderboard() {
  try {
    const response = await apiFetch(`/api/leaderboard?limit=100&clientId=${encodeURIComponent(state.clientId)}`);
    state.leaderboard = Array.isArray(response.entries) ? response.entries : [];
    state.currentPlacement = response.currentPlayer || null;
    renderLeaderboard(state.leaderboard);
    syncLobbySummary();
  } catch {
    els.leaderboardCopy.textContent = "Leaderboard unavailable right now.";
  }
}

async function loadProfile() {
  state.clientId = getOrCreateClientId();
  state.profile = readLocalProfile();

  try {
    const response = await apiFetch(`/api/profile?clientId=${encodeURIComponent(state.clientId)}`);
    if (response?.profile) {
      state.profile = {
        walletAddress: response.profile.walletAddress || "",
        discordHandle: response.profile.discordHandle || "",
        twitterHandle: response.profile.twitterHandle || ""
      };
      writeLocalProfile(state.profile);
    }
  } catch {
    // Keep local fallback.
  }

  syncProfileForm();
  syncLoginScreen();
}

async function saveProfile() {
  writeLocalProfile(state.profile);
  try {
    await apiFetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({
        clientId: state.clientId,
        ...state.profile
      })
    });
  } catch {
    showToast("Saved in this browser. Database sync failed.");
    return;
  }
  await refreshLeaderboard();
  showToast("Profile details saved.");
  syncLoginScreen();
}

async function saveRunToLeaderboard(points, resultType, finalRound) {
  if (!leaderboardName()) return { saved: false, reason: "missing_identity" };

  try {
    const result = await apiFetch("/api/run", {
      method: "POST",
      body: JSON.stringify({
        clientId: state.clientId,
        points,
        resultType,
        finalRound
      })
    });
    await refreshLeaderboard();
    return result;
  } catch {
    return { saved: false, reason: "request_failed" };
  }
}

function openStartPrompt(copy, actions) {
  els.startPromptCopy.textContent = copy;
  els.startPromptActions.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.variant || "secondary-action";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      els.startPromptDialog.close();
      action.onClick();
    }, { once: true });
    els.startPromptActions.appendChild(button);
  });

  els.startPromptDialog.showModal();
}

function beginRun() {
  state.roundIndex = 1;
  state.livesRemaining = lifeTierFromProfile(state.profile);
  state.stack = 0;
  state.roundsCleared = 0;
  updateHud();
  setVisibleScreen("game");
  showRound();
}

function handleStartAttempt() {
  const name = leaderboardName();

  if (name) {
    openStartPrompt(
      `Welcome to the Decision Gauntlet ${name}.\n\nAre you ready?`,
      [
        { label: "Yes", variant: "primary-action", onClick: beginRun },
        { label: "No", variant: "secondary-action", onClick: () => setVisibleScreen("lobby") }
      ]
    );
    return;
  }

  openStartPrompt(
    "You need a Discord Handle / ID or X Handle saved if you want to climb the leaderboard.",
    [
      { label: "Set", variant: "primary-action", onClick: () => {
        setVisibleScreen("lobby");
        toggleConnectPanel(true);
      } },
      { label: "Continue Anyways", variant: "secondary-action", onClick: beginRun }
    ]
  );
}

async function loadXAuthStatus() {
  try {
    const response = await apiFetch("/api/auth/x/status");
    state.xAuthEnabled = Boolean(response.enabled);
  } catch {
    state.xAuthEnabled = false;
  }
  syncLoginScreen();
}

function startXLogin() {
  if (!state.xAuthEnabled) {
    showToast("X login is not configured on the server.");
    return;
  }
  window.location.href = `/auth/x/start?clientId=${encodeURIComponent(state.clientId)}`;
}

function enterLobby() {
  if (!state.profile.twitterHandle) {
    showToast("Connect your X account first.");
    return;
  }
  setVisibleScreen("lobby");
}

function handleAuthQueryFeedback() {
  const params = new URLSearchParams(window.location.search);
  const authState = params.get("x_auth");
  if (authState === "success") showToast("X account connected.");
  if (authState === "error") showToast("X login failed.");
  if (authState === "disabled") showToast("X login is not configured.");
  if (authState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

async function finishRun({ resultType, finalText, bonus = 0, finalImage, pointsOverride = null }) {
  const points = pointsOverride === null ? state.stack + bonus : Math.max(0, Number(pointsOverride) || 0);
  const finalRound = resultType === "Completion" ? 10 : state.roundsCleared || state.roundIndex;
  const leaderboardSave = await saveRunToLeaderboard(points, resultType, finalRound);
  const leaderboardNote = !leaderboardSave.saved && !leaderboardName()
    ? "\n\nNo leaderboard entry was saved because you do not have a Discord or X identity set."
    : "";

  updateHud();

  await presentScene({
    title: "Decision Gauntlet Complete",
    image: finalImage,
    text: [
      finalText,
      "",
      `Final Round: ${finalRound}`,
      `Final Award: ${points} Pts`,
      `Result Type: ${resultType}`,
      leaderboardNote
    ].join("\n"),
    buttons: [
      {
        label: "Back To Lobby",
        variant: "primary-action",
        onClick: () => {
          syncProfileForm();
          syncLobbySummary();
          setVisibleScreen("lobby");
        }
      },
      {
        label: "Run Again",
        variant: "secondary-action",
        onClick: handleStartAttempt
      }
    ]
  });
}

async function promptGoHomeScared(round) {
  await presentScene({
    title: "Leave The Arena?",
    image: round.image,
    text: [
      "You still have lives remaining.",
      "",
      `Current Stacked Reward: ${state.stack} Pts`,
      "",
      "Are you sure you want to go home scared?"
    ].join("\n"),
    buttons: [
      {
        label: "Confirm Go Home Scared",
        variant: "danger-action",
        onClick: () => finishRun({
          resultType: "Go Home Scared",
          finalText: "You turned back and left the arena.",
          finalImage: round.image
        })
      },
      {
        label: "Continue",
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
      `InSquignito survived and stacked ${round.reward} Pts.`,
      `Current stack: ${state.stack} Pts`,
      "",
      "Choose whether to keep pushing or go home scared."
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
        label: "Go Home Scared",
        variant: "secondary-action",
        onClick: () => promptGoHomeScared(round)
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
    image: survived ? round.image : DEAD_IMAGE,
    text: survived ? "ALIVE" : "DEAD"
  });

  await wait(TIMINGS.revealHoldMs);

  if (!survived) {
    state.livesRemaining -= 1;
    updateHud();

    if (state.livesRemaining <= 0) {
      const stackedBeforeHalving = state.stack;
      const halvedPoints = Math.floor(stackedBeforeHalving / 2);

      await presentScene({
        title: "The Arena Collects",
        image: DEAD_IMAGE,
        text: DECISION_GAUNTLET_HALVED_TEXT(stackedBeforeHalving, halvedPoints)
      });

      await wait(TIMINGS.revealHoldMs);

      await finishRun({
        resultType: "Out of Lives",
        finalText: DECISION_GAUNTLET_FAIL_END_TEXT(halvedPoints),
        finalImage: DEAD_IMAGE,
        pointsOverride: halvedPoints
      });
      return;
    }

    state.roundIndex = 1;
    state.stack = 0;
    state.roundsCleared = 0;
    updateHud();

    await presentScene({
      title: "The Gauntlet Pulls Him Back",
      image: RETRY_IMAGE,
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
    await presentScene({
      title: "Prize Claim",
      image: round.image,
      text: DECISION_GAUNTLET_CLAIM_TEXT,
      buttons: [
        {
          label: "Open Discord",
          variant: "primary-action",
          onClick: () => window.open("https://squigs.io/discord", "_blank", "noopener,noreferrer")
        },
        {
          label: "Finish Run",
          variant: "secondary-action",
          onClick: () => finishRun({
            resultType: "Completion",
            finalText: DECISION_GAUNTLET_WIN_END_TEXT,
            bonus: COMPLETION_BONUS,
            finalImage: round.image
          })
        }
      ]
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
els.connectXButton.addEventListener("click", startXLogin);
els.enterLobbyButton.addEventListener("click", enterLobby);
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.leaderboardButton.addEventListener("click", async () => {
  await refreshLeaderboard();
  els.leaderboardDialog.showModal();
});
els.startGameButton.addEventListener("click", handleStartAttempt);

els.profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.profile = {
    walletAddress: els.walletAddress.value.trim(),
    discordHandle: els.discordHandle.value.trim(),
    twitterHandle: els.twitterHandle.value.trim()
  };
  syncProfileForm();
  toggleConnectPanel(false);
  await saveProfile();
});

els.clearProfile.addEventListener("click", async () => {
  state.profile = {
    walletAddress: "",
    discordHandle: "",
    twitterHandle: ""
  };
  syncProfileForm();
  await saveProfile();
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

state.clientId = getOrCreateClientId();
handleAuthQueryFeedback();
await loadProfile();
await loadXAuthStatus();
await refreshLeaderboard();
syncProfileForm();
syncLobbySummary();
syncLoginScreen();
setVisibleScreen(state.profile.twitterHandle ? "lobby" : "login");
