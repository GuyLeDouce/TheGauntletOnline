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
  profile: "gauntlet-online-profile",
  audioEnabled: "gauntlet-online-audio-enabled"
};

const els = {
  audioToggle: document.getElementById("audioToggle"),
  audioIcon: document.getElementById("audioIcon"),
  themeAudio: document.getElementById("themeAudio"),
  connectToggle: document.getElementById("connectToggle"),
  connectPanel: document.getElementById("connectPanel"),
  closeConnectPanel: document.getElementById("closeConnectPanel"),
  profileForm: document.getElementById("profileForm"),
  discordAuthButton: document.getElementById("discordAuthButton"),
  discordStatus: document.getElementById("discordStatus"),
  walletAddress: document.getElementById("walletAddress"),
  discordHandle: document.getElementById("discordHandle"),
  twitterHandle: document.getElementById("twitterHandle"),
  clearProfile: document.getElementById("clearProfile"),
  startGameButton: document.getElementById("startGameButton"),
  rulesButton: document.getElementById("rulesButton"),
  leaderboardButton: document.getElementById("leaderboardButton"),
  lobbyScreen: document.getElementById("lobbyScreen"),
  gameScreen: document.getElementById("gameScreen"),
  sceneCard: document.querySelector(".scene-card"),
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
  periodTabs: Array.from(document.querySelectorAll(".period-tab")),
  startPromptDialog: document.getElementById("startPromptDialog"),
  startPromptCopy: document.getElementById("startPromptCopy"),
  startPromptActions: document.getElementById("startPromptActions")
};

const state = {
  clientId: null,
  profile: {
    walletAddress: "",
    discordHandle: "",
    twitterHandle: "",
    discordUserId: "",
    discordAvatar: "",
    discordGlobalName: ""
  },
  leaderboard: [],
  leaderboardPeriod: "monthly",
  currentPlacement: null,
  currentRunId: null,
  revealedHints: {},
  currentTell: "",
  completionBonus: COMPLETION_BONUS,
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
    if (!raw) return emptyProfile();
    return JSON.parse(raw);
  } catch {
    return emptyProfile();
  }
}

function writeLocalProfile(profile) {
  window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

function emptyProfile() {
  return {
    walletAddress: "",
    discordHandle: "",
    twitterHandle: "",
    discordUserId: "",
    discordAvatar: "",
    discordGlobalName: ""
  };
}

function normalizeProfile(profile = {}) {
  return {
    ...emptyProfile(),
    walletAddress: profile.walletAddress || "",
    discordHandle: profile.discordHandle || "",
    twitterHandle: profile.twitterHandle || "",
    discordUserId: profile.discordUserId || "",
    discordAvatar: profile.discordAvatar || "",
    discordGlobalName: profile.discordGlobalName || ""
  };
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

function syncAudioUi(enabled) {
  els.audioToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
  els.audioToggle.classList.toggle("active", enabled);
  els.audioIcon.textContent = enabled ? "♫" : "♪";
  els.audioToggle.title = enabled ? "Turn music off" : "Turn music on";
}

async function setAudioEnabled(enabled) {
  window.localStorage.setItem(STORAGE_KEYS.audioEnabled, enabled ? "true" : "false");
  syncAudioUi(enabled);

  if (!enabled) {
    els.themeAudio.pause();
    return;
  }

  els.themeAudio.volume = 0.42;
  try {
    await els.themeAudio.play();
  } catch {
    syncAudioUi(false);
    window.localStorage.setItem(STORAGE_KEYS.audioEnabled, "false");
    showToast("Tap music again to start audio.");
  }
}

function initAudio() {
  const enabled = window.localStorage.getItem(STORAGE_KEYS.audioEnabled) === "true";
  syncAudioUi(enabled);
  if (enabled) {
    setAudioEnabled(true);
  }
}

function handleDiscordReturnNotice() {
  const url = new URL(window.location.href);
  const discordStatus = url.searchParams.get("discord");
  const reason = url.searchParams.get("reason");
  if (!discordStatus) return;

  if (discordStatus === "connected") {
    showToast("Discord connected.");
  } else {
    showToast(reason ? `Discord auth failed: ${reason}` : "Discord auth failed.");
  }

  url.searchParams.delete("discord");
  url.searchParams.delete("reason");
  window.history.replaceState({}, "", url.toString());
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

function applyRunState(run) {
  if (!run) return;
  state.currentRunId = run.runId || state.currentRunId;
  state.roundIndex = Number(run.roundIndex || 1);
  state.livesRemaining = Number(run.livesRemaining || 0);
  state.stack = Number(run.stack || 0);
  state.roundsCleared = Number(run.roundsCleared || 0);
  state.revealedHints = run.revealedHints || {};
  state.currentTell = run.roomTell || "";
  updateHud();
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
  els.discordStatus.textContent = state.profile.discordUserId
    ? `Discord connected as ${state.profile.discordHandle || state.profile.discordGlobalName}.`
    : "Connect Discord to save leaderboard runs.";
  els.discordAuthButton.textContent = state.profile.discordUserId
    ? "Reconnect Discord"
    : "Connect Discord";
}

function syncLobbySummary() {
  const best = Number(state.currentPlacement?.best_points_ever || 0);
  els.lobbyBest.textContent = `${best} Pts`;
  els.rulesCopy.textContent = APP_COPY.info.join("\n");
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
    if (buttonConfig.title) {
      button.title = buttonConfig.title;
    }
    button.addEventListener("click", buttonConfig.onClick, { once: true });
    els.choiceButtons.appendChild(button);
  });
}

function flashScene(className) {
  els.sceneCard.classList.remove("choice-lock", "death-flash", "survive-pulse");
  void els.sceneCard.offsetWidth;
  els.sceneCard.classList.add(className);
  window.setTimeout(() => els.sceneCard.classList.remove(className), 900);
}

async function presentScene({ title, image, text, buttons = [] }) {
  state.isBusy = true;
  const isElimination = /eliminated|elimination|arena collects/i.test(title) || /ELIMINATED|FINAL ELIMINATION/.test(text);
  const isCleared = /cleared|complete|prize claim/i.test(title) || /\bALIVE\b/.test(text);
  els.sceneCard.classList.toggle("elimination-state", isElimination);
  els.sceneCard.classList.toggle("cleared-state", isCleared && !isElimination);
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
    els.leaderboardCopy.textContent = `No ${periodLabel(state.leaderboardPeriod).toLowerCase()} leaderboard entries yet.`;
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

    const placement = document.createElement("strong");
    placement.textContent = `#${entry.placement}`;

    const main = document.createElement("div");
    main.className = "leaderboard-main";

    const name = document.createElement("span");
    name.className = "leaderboard-name";
    name.textContent = entry.display_name;

    const meta = document.createElement("span");
    meta.className = "leaderboard-meta";
    meta.textContent = `Runs ${entry.user_runs_total} · Total ${entry.total_points_earned} · Wins ${entry.wins}`;

    const points = document.createElement("span");
    points.className = "leaderboard-points";
    points.textContent = `Best ${entry.best_points_ever}`;

    main.append(name, meta);
    item.append(placement, main, points);
    list.appendChild(item);
  });

  els.leaderboardCopy.innerHTML = "";
  wrapper.appendChild(list);
  els.leaderboardCopy.appendChild(wrapper);

  if (currentPlacement) {
    const summary = document.createElement("div");
    summary.className = "leaderboard-summary";
    summary.textContent =
      `${periodLabel(state.leaderboardPeriod)} placement: #${currentPlacement.placement} · ` +
      `${currentPlacement.total_points_earned} Pts · ` +
      `Runs ${currentPlacement.user_runs_total} · ` +
      `Best ${currentPlacement.best_points_ever} · Wins ${currentPlacement.wins}`;
    els.leaderboardCopy.appendChild(summary);
  }
}

async function refreshLeaderboard() {
  try {
    const response = await apiFetch(
      `/api/leaderboard?limit=100&period=${encodeURIComponent(state.leaderboardPeriod)}&clientId=${encodeURIComponent(state.clientId)}`
    );
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
  state.profile = normalizeProfile(readLocalProfile());

  try {
    const response = await apiFetch(`/api/profile?clientId=${encodeURIComponent(state.clientId)}`);
    if (response?.profile) {
      state.profile = normalizeProfile(response.profile);
      writeLocalProfile(state.profile);
    }
  } catch {
    // Keep local fallback.
  }

  syncProfileForm();
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

function periodLabel(period) {
  if (period === "weekly") return "Weekly";
  if (period === "all-time") return "All-Time";
  return "Monthly";
}

function syncLeaderboardTabs() {
  els.periodTabs.forEach((tab) => {
    const isActive = tab.dataset.period === state.leaderboardPeriod;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

async function beginRun() {
  try {
    const response = await apiFetch("/api/run/start", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId })
    });
    state.completionBonus = Number(response.config?.completionBonus || COMPLETION_BONUS);
    applyRunState(response.run);
    setVisibleScreen("game");
    await showRound();
  } catch {
    showToast("Could not start a run. Try again.");
    setVisibleScreen("lobby");
  }
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
    "Connect Discord if you want this run saved to the leaderboard.",
    [
      { label: "Set", variant: "primary-action", onClick: () => {
        setVisibleScreen("lobby");
        toggleConnectPanel(true);
      } },
      { label: "Continue Anyway", variant: "secondary-action", onClick: beginRun }
    ]
  );
}

async function finishRunFromServer(final, finalText, finalImage) {
  const leaderboardSave = final?.leaderboardSave;
  const leaderboardNote = !leaderboardName()
    ? "\n\nNo leaderboard entry was saved because Discord is not connected."
    : leaderboardSave?.saved
      ? ""
      : "\n\nRun complete. Leaderboard sync is unavailable in this environment.";

  await refreshLeaderboard();
  updateHud();

  await presentScene({
    title: "Decision Gauntlet Complete",
    image: finalImage,
    text: [
      finalText,
      "",
      `Final Round: ${final?.finalRound || 0}`,
      `Final Award: ${final?.points || 0} Pts`,
      `Result Type: ${final?.resultType || "Unknown"}`,
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

async function advanceRun(action) {
  const response = await apiFetch("/api/run/advance", {
    method: "POST",
    body: JSON.stringify({
      clientId: state.clientId,
      runId: state.currentRunId,
      action
    })
  });
  applyRunState(response.run);
  return response;
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
        onClick: async () => {
          try {
            const response = await advanceRun("cashout");
            await finishRunFromServer(
              response.final,
              "You turned back and left the arena.",
              round.image
            );
          } catch {
            showToast("Could not finish the run. Try again.");
          }
        }
      },
      {
        label: "Continue",
        variant: "secondary-action",
        onClick: async () => {
          try {
            await advanceRun("continue");
            await showRound();
          } catch {
            showToast("Could not continue the run. Try again.");
          }
        }
      }
    ]
  });
}

async function promptPostRound(round, madeCorrectChoice) {
  await presentScene({
    title: `Round ${round.roundIndex} Cleared`,
    image: round.image,
    text: [
      `InSquignito survived and stacked ${round.reward} Pts.`,
      `Current stack: ${state.stack} Pts`,
      madeCorrectChoice ? "You read the room correctly." : "You chose poorly, but the arena blinked.",
      "",
      "Choose whether to keep pushing or go home scared."
    ].join("\n"),
    buttons: [
      {
        label: "Continue",
        variant: "primary-action",
        onClick: async () => {
          try {
            await advanceRun("continue");
            await showRound();
          } catch {
            showToast("Could not continue the run. Try again.");
          }
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

async function resolveChoice(round, choice) {
  if (state.isBusy) return;
  disableButtons();
  flashScene("choice-lock");
  await wait(TIMINGS.preRevealDelayMs);
  await presentScene({
    title: `Decision Gauntlet - Round ${round.roundIndex}/10`,
    image: round.image,
    text: `You chose ${choice}.\n\nThe arena is deciding what that means.`
  });

  let response;
  try {
    response = await apiFetch("/api/run/choice", {
      method: "POST",
      body: JSON.stringify({
        clientId: state.clientId,
        runId: state.currentRunId,
        choice
      })
    });
  } catch {
    showToast("The arena lost the run state. Start again.");
    setVisibleScreen("lobby");
    return;
  }

  applyRunState(response.run);
  await wait(500);
  flashScene(response.survived ? "survive-pulse" : "death-flash");

  await presentScene({
    title: response.survived
      ? `Decision Gauntlet - Round ${round.roundIndex}/10`
      : response.result === "finished"
        ? "Final Elimination"
        : "Eliminated",
    image: response.survived ? round.image : DEAD_IMAGE,
    text: response.survived
      ? "ALIVE"
      : [
          "ELIMINATED.",
          "",
          response.madeCorrectChoice
            ? "You read the symbol correctly, but the arena still took its chance."
            : "The symbol was wrong, and the arena punished it.",
          "",
          `Lives Remaining: ${state.livesRemaining}`
        ].join("\n")
  });

  await wait(TIMINGS.revealHoldMs);

  if (!response.survived && response.result === "finished") {
    await presentScene({
      title: "The Arena Collects",
      image: DEAD_IMAGE,
      text: DECISION_GAUNTLET_HALVED_TEXT(
        response.stackedBeforeHalving || 0,
        response.final?.points || 0,
        response.deathHint
      )
    });

    await wait(TIMINGS.revealHoldMs);
    await finishRunFromServer(
      response.final,
      DECISION_GAUNTLET_FAIL_END_TEXT(response.final?.points || 0),
      DEAD_IMAGE
    );
    return;
  }

  if (!response.survived) {
    await presentScene({
      title: "Eliminated - Life Lost",
      image: RETRY_IMAGE,
      text: DECISION_GAUNTLET_RESTART_TEXT(response.deathHint),
      buttons: [
        {
          label: "Use Next Life",
          variant: "primary-action",
          onClick: () => showRound()
        },
        {
          label: "Back To Lobby",
          variant: "secondary-action",
          onClick: () => {
            syncProfileForm();
            syncLobbySummary();
            setVisibleScreen("lobby");
          }
        }
      ]
    });
    return;
  }

  if (response.result === "completed") {
    const basePoints = Math.max(0, Number(response.final?.points || 0) - Number(response.completionBonus || 0));
    const winText = DECISION_GAUNTLET_WIN_END_TEXT(
      basePoints,
      Number(response.completionBonus || 0),
      Number(response.final?.points || 0)
    );
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
          onClick: () => finishRunFromServer(response.final, winText, round.image)
        }
      ]
    });
    return;
  }

  await promptPostRound(round, response.madeCorrectChoice);
}

async function showRound() {
  const round = getRound(state.roundIndex);
  if (!round) return;

  const revealedHint = state.revealedHints?.[round.roundIndex];
  const roomLines = [round.text];
  if (state.currentTell) {
    roomLines.push("", `Arena Tell: ${state.currentTell}`);
  }
  if (revealedHint) {
    roomLines.push("", `Marked from a previous death: ${revealedHint}`);
  }
  roomLines.push(
    "",
    `Room Type: ${round.difficultyLabel}`,
    `Reward: ${round.reward} Pts`,
    `Best-choice survival: ${Math.round(round.safeSurvivalChance * 100)}%`,
    `Wrong-choice mercy: ${Math.round(round.mistakeSurvivalChance * 100)}%`
  );

  updateHud();
  await presentScene({
    title: `Decision Gauntlet - Round ${round.roundIndex}/10`,
    image: round.image,
    text: roomLines.join("\n"),
    buttons: round.buttons.map((label) => ({
      label,
      variant: "primary-action",
      title: `Choose ${label}`,
      onClick: () => resolveChoice(round, label)
    }))
  });
}

els.audioToggle.addEventListener("click", () => {
  const shouldEnable = els.audioToggle.getAttribute("aria-pressed") !== "true";
  setAudioEnabled(shouldEnable);
});

els.connectToggle.addEventListener("click", () => toggleConnectPanel());
els.closeConnectPanel.addEventListener("click", () => toggleConnectPanel(false));
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.leaderboardButton.addEventListener("click", async () => {
  syncLeaderboardTabs();
  await refreshLeaderboard();
  els.leaderboardDialog.showModal();
});
els.startGameButton.addEventListener("click", handleStartAttempt);
els.discordAuthButton.addEventListener("click", () => {
  window.location.href = `/api/auth/discord/start?clientId=${encodeURIComponent(state.clientId)}`;
});

els.periodTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    state.leaderboardPeriod = tab.dataset.period || "monthly";
    syncLeaderboardTabs();
    await refreshLeaderboard();
  });
});

els.profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  state.profile = {
    ...state.profile,
    walletAddress: els.walletAddress.value.trim(),
    twitterHandle: els.twitterHandle.value.trim()
  };
  syncProfileForm();
  toggleConnectPanel(false);
  await saveProfile();
});

els.clearProfile.addEventListener("click", async () => {
  state.profile = {
    ...emptyProfile()
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
initAudio();
await loadProfile();
handleDiscordReturnNotice();
await refreshLeaderboard();
syncProfileForm();
syncLobbySummary();
syncLeaderboardTabs();
setVisibleScreen("lobby");
