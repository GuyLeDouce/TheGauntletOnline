import {
  APP_COPY,
  CLAIM_STATUS_COPY,
  CLAIM_STATUS_IMAGE_KEYS,
  HOW_IT_WORKS,
  OFFICE_IMAGES,
  PRELOAD_IMAGE_KEYS,
  TIER_IMAGE_KEYS
} from "/game-data.js";

window.__uglyAppModuleLoaded = true;

const STORAGE_KEYS = {
  clientId: "insquignito-client-id"
};

const API_TIMEOUT_MS = 8000;
const DEFAULT_CONFIG = {
  appName: "InSquignito's Ugly Interview",
  rewardCooldownHours: 24,
  scanCacheMinutes: 15,
  allowZeroSquigReward: false,
  discordInviteUrl: "https://squigs.io/discord",
  dripProfileUrl: "",
  dripClaimHelpUrl: "",
  timersEnabled: true,
  interviewLength: 15,
  appVersion: "frontend-local",
  buildId: "frontend-local"
};

const els = {
  interviewStage: document.getElementById("interviewStage"),
  sceneImage: document.getElementById("sceneImage"),
  sceneBadge: document.getElementById("sceneBadge"),
  stageHud: document.getElementById("stageHud"),
  stageDeskConsole: document.getElementById("stageDeskConsole"),
  toastStack: document.getElementById("toastStack"),
  howDialog: document.getElementById("howDialog"),
  howCopy: document.getElementById("howCopy"),
  leaderboardDialog: document.getElementById("leaderboardDialog"),
  leaderboardRows: document.getElementById("leaderboardRows"),
  claimsDialog: document.getElementById("claimsDialog"),
  claimRows: document.getElementById("claimRows"),
  scanDialog: document.getElementById("scanDialog"),
  scanDetails: document.getElementById("scanDetails")
};

const state = {
  clientId: "",
  config: { ...DEFAULT_CONFIG },
  profile: {},
  scan: null,
  cooldown: null,
  run: null,
  timerHandle: null,
  currentSceneKey: "",
  currentMode: "menu",
  modeBeforeModal: "menu",
  lastClaimCode: "",
  pendingFinalData: null,
  eventsWired: false,
  bootError: ""
};

class ApiError extends Error {
  constructor(message, data = {}) {
    super(message);
    this.name = "ApiError";
    this.data = data;
  }
}

function getOrCreateClientId() {
  let clientId = localStorage.getItem(STORAGE_KEYS.clientId);
  if (!clientId) {
    const random = window.crypto?.randomUUID?.() || `${Date.now()}${Math.random().toString(36).slice(2)}`;
    clientId = `client_${random.replace(/-/g, "")}`;
    localStorage.setItem(STORAGE_KEYS.clientId, clientId);
  }
  return clientId;
}

async function apiFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs || API_TIMEOUT_MS);
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    const raw = await response.text().catch(() => "");
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw.slice(0, 220), nonJson: true };
      }
    }
    if (!response.ok) {
      throw new ApiError(data.error || `Request failed (${response.status})`, { ...data, status: response.status });
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Request timed out. InSquignito dropped the clipboard.", { timeout: true });
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error?.message || "Network request failed. The office wires are ugly today.", { originalError: true });
  } finally {
    window.clearTimeout(timeout);
  }
}

function safeClipboardWrite(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  return Promise.resolve();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ensureElements() {
  const missing = Object.entries(els).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Frontend boot is missing required elements: ${missing.join(", ")}`);
  }
}

function getOfficeImage(key) {
  return OFFICE_IMAGES[key] || OFFICE_IMAGES.hero;
}

function setStageMode(mode) {
  state.currentMode = mode;
  els.interviewStage.dataset.view = mode;
  document.body.dataset.view = mode;
}

function setStageScene(key, options = {}) {
  const nextKey = OFFICE_IMAGES[key] ? key : "hero";
  const asset = getOfficeImage(nextKey);
  els.sceneBadge.textContent = options.badge || asset.badge || "Ugly Labs HR";
  els.interviewStage.dataset.scene = nextKey;

  if (state.currentSceneKey === nextKey && els.sceneImage.src === asset.url) {
    return;
  }

  state.currentSceneKey = nextKey;
  els.sceneImage.classList.add("is-fading");
  const clearFade = window.setTimeout(() => els.sceneImage.classList.remove("is-fading"), 450);
  els.sceneImage.onload = () => {
    window.clearTimeout(clearFade);
    els.sceneImage.classList.remove("is-fading");
  };
  els.sceneImage.onerror = () => {
    const fallback = getOfficeImage("hero");
    window.clearTimeout(clearFade);
    state.currentSceneKey = "hero";
    els.interviewStage.dataset.scene = "hero";
    els.sceneImage.src = fallback.url;
    els.sceneImage.alt = fallback.alt;
    els.sceneImage.classList.remove("is-fading");
  };
  els.sceneImage.src = asset.url;
  els.sceneImage.alt = asset.alt || "InSquignito's Ugly Interview scene";
}

function preloadImages() {
  for (const key of PRELOAD_IMAGE_KEYS) {
    const asset = getOfficeImage(key);
    const img = new Image();
    img.src = asset.url;
  }
}

function showToast(message) {
  if (!els.toastStack) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderFallbackMenu(message, action = "retry-connection") {
  setStageMode("menu");
  setStageScene("hero", { badge: "Offline Ugly Mode" });
  renderStatusHud();
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--menu ugly-paper">
      <p class="sticker">Ugly Labs Connection Notice</p>
      <h1>InSquignito's Ugly Interview</h1>
      <p class="subtitle">Get Hired. Get Roasted. Stay Ugly.</p>
      <p class="cooldown">${escapeHtml(message || "The office connection failed. Practice mode still works.")}</p>
      <div class="action-row">
        <button type="button" class="primary-action" data-action="practice">Practice Interview</button>
        <button type="button" class="secondary-action" data-action="begin-reward">Start Interview</button>
        <button type="button" class="secondary-action" data-open="how">How It Works</button>
        <button type="button" class="secondary-action" data-action="${escapeHtml(action)}">Retry Connection</button>
      </div>
    </section>
  `;
}

function showVisibleError(message, action = "retry-connection") {
  const text = message || "The office connection failed. Practice mode still works.";
  state.bootError = text;
  showToast(text);
  renderFallbackMenu(text, action);
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function formatShortWallet(wallet) {
  if (!wallet) return "No wallet";
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function cooldownText(cooldown) {
  if (!cooldown?.nextAvailableAt) return "";
  return `Reward run available ${formatDate(cooldown.nextAvailableAt)}. Practice mode is open.`;
}

function isRewardReady() {
  const profile = state.profile || {};
  const scan = state.scan;
  return Boolean(
    profile.discordUserId &&
    scan &&
    (scan.squigCount > 0 || state.config.allowZeroSquigReward) &&
    !state.cooldown?.nextAvailableAt
  );
}

function statusChips() {
  const profile = state.profile || {};
  const scan = state.scan;
  const rewardReady = isRewardReady();
  return [
    ["Discord", profile.discordUserId ? "Connected" : "Needed"],
    ["Wallet", profile.walletAddress ? formatShortWallet(profile.walletAddress) : "Missing"],
    ["Squigs", String(scan?.squigCount || 0)],
    ["Dignity", String(scan?.dignityGranted || 1)],
    ["Mode", rewardReady ? "Reward" : "Practice"]
  ];
}

function renderStatusHud() {
  clearInterval(state.timerHandle);
  els.stageHud.innerHTML = statusChips().map(([label, value]) => `
    <div class="hud-chip"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
  `).join("");
}

function renderRunHud(run) {
  const question = run.question;
  els.stageHud.innerHTML = `
    <div class="hud-chip"><span>Question</span><strong>${question ? `${question.progressNumber}/${question.interviewLength}` : `${Math.min(run.currentIndex + 1, run.interviewLength)}/${run.interviewLength}`}</strong></div>
    <div class="hud-chip hud-chip--wide"><span>Tier</span><strong>${escapeHtml(question?.tierLabel || "Interview")}</strong></div>
    <div class="hud-chip"><span>Dignity</span><strong>${run.dignityRemaining}</strong></div>
    <div class="hud-chip"><span>$CHARM</span><strong>${run.charmStack}</strong></div>
    <div class="hud-chip"><span>Squigs</span><strong>${run.squigCount}</strong></div>
    <div class="hud-chip"><span>Timer</span><strong id="hudTimer">--</strong></div>
  `;
}

function startTimer(question) {
  clearInterval(state.timerHandle);
  const timerEl = document.getElementById("hudTimer");
  if (!timerEl) return;
  timerEl.classList.remove("timer-low");
  if (!question?.expiresAt || !question.timerSeconds) {
    timerEl.textContent = "--";
    return;
  }
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((Date.parse(question.expiresAt) - Date.now()) / 1000));
    timerEl.textContent = `${remaining}s`;
    timerEl.classList.toggle("timer-low", remaining <= 5);
    if (remaining <= 0) clearInterval(state.timerHandle);
  };
  tick();
  state.timerHandle = setInterval(tick, 250);
}

function chooseApplicantScene() {
  const profile = state.profile || {};
  const scan = state.scan;
  if (state.cooldown?.nextAvailableAt) return "cooldown";
  if (!profile.discordUserId && !profile.walletAddress) return "gate";
  if (!scan && profile.walletAddress) return "applicantFile";
  if (!scan) return "gate";
  if (scan.hasRevivePill) return "revivePillDetected";
  if (scan.squigCount <= 0 && !state.config.allowZeroSquigReward) return "zeroSquigs";
  if (scan.squigCount > 0) return "walletApproved";
  return "walletScan";
}

function applicantSummary() {
  const profile = state.profile || {};
  const scan = state.scan;
  const rewardReady = isRewardReady();
  return {
    discordName: profile.discordGlobalName || profile.discordHandle || profile.discordUserId || "Discord not connected",
    discordMeta: profile.discordUserId ? "Connected for reward files" : "Required for reward runs",
    discordAvatar: profile.discordAvatar || "",
    walletAddress: profile.walletAddress || "",
    squigCount: scan?.squigCount || 0,
    revivePill: scan?.hasRevivePill ? `Yes (${scan.revivePillCount})` : "No",
    dignity: scan?.dignityGranted || 1,
    mode: rewardReady ? "Reward" : "Practice",
    gateSummary: scan
      ? `Wallet scanned. ${scan.squigCount} Squigs found. ${scan.walletTitle || "Stay Ugly"}.`
      : "Connect Discord, paste a wallet, and let the scanner insult it."
  };
}

function applicantNextActionsHtml(summary) {
  const hasWallet = Boolean(summary.walletAddress);
  const needsScan = hasWallet && !state.scan;
  const primaryAction = summary.mode === "Reward"
    ? "begin-reward"
    : needsScan
      ? "scan-wallet"
      : "begin-reward";
  const rewardCopy = summary.mode === "Reward"
    ? "Play Reward Interview"
    : needsScan
      ? "Scan Wallet Now"
      : "Finish Reward Setup";
  return `
    <div class="next-actions">
      <button type="button" class="primary-action" data-action="${escapeHtml(primaryAction)}">${escapeHtml(rewardCopy)}</button>
      <button type="button" class="secondary-action" data-action="practice">Play Practice Now</button>
      <button type="button" class="secondary-action" data-open="how">How It Works</button>
    </div>
  `;
}

function applicantFormHtml(summary, context = "applicant") {
  return `
    <form class="intake-form" id="walletForm">
      <div class="identity-row">
        <div class="avatar-fallback"${summary.discordAvatar ? ` style="background-image:url('${escapeHtml(summary.discordAvatar)}')"` : ""}>${summary.discordAvatar ? "" : "?"}</div>
        <div>
          <strong>${escapeHtml(summary.discordName)}</strong>
          <span>${escapeHtml(summary.discordMeta)}</span>
        </div>
      </div>

      <label for="walletAddress">Wallet address</label>
      <div class="input-row">
        <input id="walletAddress" name="walletAddress" type="text" placeholder="0x..." value="${escapeHtml(summary.walletAddress)}" autocomplete="off">
        <button type="submit" class="secondary-action">Save Wallet</button>
      </div>

      <div class="file-actions">
        <button type="button" class="secondary-action" data-action="connect-discord">Connect Discord</button>
        <button type="button" class="primary-action" data-action="scan-wallet">Scan Wallet</button>
        <button type="button" class="secondary-action" data-action="refresh-scan">Refresh Scan</button>
      </div>

      <div class="stat-grid">
        <div><span>Squigs Detected</span><strong>${summary.squigCount}</strong></div>
        <div><span>Revive Pill</span><strong>${escapeHtml(summary.revivePill)}</strong></div>
        <div><span>Dignity Granted</span><strong>${summary.dignity}</strong></div>
        <div><span>Mode Available</span><strong>${escapeHtml(summary.mode)}</strong></div>
      </div>

      <p class="fine-print">${escapeHtml(APP_COPY.walletNote)}</p>
      ${state.cooldown?.nextAvailableAt ? `<p class="cooldown">${escapeHtml(cooldownText(state.cooldown))}</p>` : ""}
      ${context === "reward-blocked" ? `<p class="cooldown">${escapeHtml(APP_COPY.zeroSquig)}</p>` : ""}
      ${applicantNextActionsHtml(summary)}
    </form>
  `;
}

function renderMenuScene() {
  setStageMode("menu");
  setStageScene("hero", { badge: "Main Menu" });
  renderStatusHud();
  const summary = applicantSummary();
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--menu ugly-paper">
      <p class="sticker">A Squigs Reloaded Survival Interview</p>
      <h1>InSquignito's Ugly Interview</h1>
      <p class="subtitle">Get Hired. Get Roasted. Stay Ugly.</p>
      <p class="tagline">Discord in. Wallet scanned. Dignity calculated.</p>
      <div class="action-row">
        <button type="button" class="primary-action" data-action="begin-reward">Begin Interview</button>
        ${state.profile?.discordUserId ? "" : `<button type="button" class="secondary-action" data-action="connect-discord">Connect Discord</button>`}
        <button type="button" class="secondary-action" data-action="show-applicant">Applicant File</button>
        <button type="button" class="secondary-action" data-action="practice">Practice Without Pay</button>
        <button type="button" class="secondary-action" data-open="how">How It Works</button>
      </div>
      <button type="button" class="status-strip" data-action="show-applicant">
        <span>Applicant Status</span>
        <strong>${escapeHtml(summary.mode)} Mode</strong>
        <small>${escapeHtml(summary.gateSummary)}</small>
      </button>
      <p class="build-marker">Build ${escapeHtml(state.config.buildId || state.config.appVersion || "local")}</p>
    </section>
  `;
}

function renderApplicantScene({ sceneKey = chooseApplicantScene(), context = "applicant" } = {}) {
  setStageMode(context === "scanning" ? "scanning" : "applicant");
  setStageScene(sceneKey, {
    badge: sceneKey === "loading" ? "Processing Ugly" : "Ugly Applicant File"
  });
  renderStatusHud();
  const summary = applicantSummary();
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--applicant ugly-paper">
      <div class="console-heading">
        <p class="file-tab">Ugly Applicant File</p>
        <p class="category">${escapeHtml(summary.mode)} Mode</p>
      </div>
      <h2>${context === "scanning" ? "InSquignito is processing ugly..." : "Applicant Intake"}</h2>
      <p class="microcopy">${escapeHtml(summary.gateSummary)}</p>
      ${context === "scanning" ? `<div class="loading-strip">Scanner warm. Clipboard damp. Please wait.</div>` : applicantFormHtml(summary, context)}
    </section>
  `;
}

function renderScanningScene() {
  renderApplicantScene({ sceneKey: "loading", context: "scanning" });
}

function renderQuestionScene(run) {
  state.run = run;
  const question = run.question;
  if (!question) return;
  setStageMode("question");
  const tierKey = TIER_IMAGE_KEYS[question.tier] || question.imageKey || "activeInterview";
  setStageScene(tierKey, { badge: question.tierLabel || "Active Interview" });
  renderRunHud(run);
  startTimer(question);
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--question ugly-paper">
      <div class="console-heading">
        <p class="tier-sticker">${escapeHtml(question.tierLabel || "Interview")}</p>
        <p class="category">${escapeHtml(question.category)}</p>
        <p class="reward-chip">+${question.reward} $CHARM</p>
      </div>
      <h2>${escapeHtml(question.prompt)}</h2>
      <p class="flavor">${escapeHtml(question.flavorText || "InSquignito taps the clipboard. It leaves a stain.")}</p>
      <div class="answers">
        ${question.options.map((option) => `
          <button type="button" class="answer-button" data-action="answer" data-option-id="${escapeHtml(option.id)}">
            <span>${escapeHtml(option.id)}</span>
            ${escapeHtml(option.text)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderFeedbackScene(data) {
  const feedback = data.feedback;
  const imageKey = data.cashoutAvailable
    ? "cashout"
    : feedback.wasCorrect
      ? "correct"
      : feedback.dignityLost > 0
        ? "dignityLost"
        : "wrong";
  setStageMode("feedback");
  setStageScene(imageKey, {
    badge: data.cashoutAvailable ? "Cash Out Checkpoint" : feedback.wasCorrect ? "Ugly Verified" : "Pretty Energy Detected"
  });
  renderRunHud(data.run);
  clearInterval(state.timerHandle);
  const resultLabel = feedback.wasCorrect ? "Correct" : feedback.timedOut ? "Too Slow" : "Wrong";
  state.pendingFinalData = data.final ? data : null;
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--feedback ugly-paper">
      <p class="stamp-label ${feedback.wasCorrect ? "stamp-label--good" : "stamp-label--bad"}">${escapeHtml(resultLabel)}</p>
      <h2>${escapeHtml(feedback.roast)}</h2>
      <p class="microcopy">${escapeHtml(feedback.explanation)}</p>
      <p class="correct-answer"><span>Correct answer:</span> ${escapeHtml(feedback.correctAnswerText)}</p>
      <div class="delta-row">
        ${feedback.rewardAdded ? `<strong>+$CHARM ${feedback.rewardAdded}</strong>` : ""}
        ${feedback.dignityLost ? `<strong>-${feedback.dignityLost} Dignity</strong>` : ""}
      </div>
      <div class="action-row">
        ${data.final
          ? `<button type="button" class="primary-action" data-action="view-final">View Stamped File</button>`
          : `<button type="button" class="primary-action" data-action="continue">Continue</button>`}
        ${data.cashoutAvailable ? `<button type="button" class="secondary-action" data-action="cashout">Leave With Your Ugly Little Bag</button>` : ""}
      </div>
    </section>
  `;
}

function finalImageKey(run) {
  if (run.status === "out_of_dignity") return "gameOver";
  if (run.status === "cashed_out") return "cashout";
  if (run.mode === "practice") return "practice";
  if (run.status === "completed" && run.correctCount >= 15 && run.wrongCount === 0) return "fullClear";
  if (run.status === "completed") return "hired";
  return "hired";
}

function renderFinalScene(data) {
  const run = data.run;
  const payout = run.payout;
  state.lastClaimCode = payout?.claimCode || "";
  setStageMode("final");
  setStageScene(finalImageKey(run), {
    badge: run.status === "completed" ? "Hired By InSquignito" : run.resultType || "Interview Result"
  });
  clearInterval(state.timerHandle);
  els.stageHud.innerHTML = "";
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--final ugly-paper">
      <p class="stamp-label ${run.status === "completed" ? "stamp-label--good" : "stamp-label--bad"}">${escapeHtml(run.status === "completed" ? "HIRED BY INSQUIGNITO" : run.resultType || "Interview Complete")}</p>
      <h2>${escapeHtml(run.rankTitle)}</h2>
      <p class="microcopy">${escapeHtml(data.endCopy || "InSquignito is disappointed, but not surprised. Stay Ugly.")}</p>
      <div class="final-stats">
        <div><span>Final $CHARM</span><strong>${run.charmFinal || 0}</strong></div>
        <div><span>Claim Code</span><strong>${escapeHtml(payout?.claimCode || (run.mode === "practice" ? "Practice run" : "No claim"))}</strong></div>
        <div><span>Payout Status</span><strong>${payout ? "pending" : "No payout"}</strong></div>
      </div>
      <p class="fine-print">${escapeHtml(payout ? APP_COPY.drip : "Practice runs and zero-value results do not create $CHARM payouts.")}</p>
      <div class="action-row">
        <button type="button" class="primary-action" data-action="copy-claim" ${payout?.claimCode ? "" : "disabled"}>Copy Claim Code</button>
        <a class="secondary-action link-action" href="${escapeHtml(state.config.discordInviteUrl || "https://squigs.io/discord")}" target="_blank" rel="noreferrer">Open Discord</a>
        <button type="button" class="secondary-action" data-action="return-menu">Return To Menu</button>
        <button type="button" class="secondary-action" data-action="practice">Practice Again</button>
      </div>
    </section>
  `;
}

async function loadConfig() {
  const config = await apiFetch("/api/config");
  state.config = { ...DEFAULT_CONFIG, ...config };
  if (state.config.appVersion || state.config.buildId) {
    console.info(`[Ugly Interview] ${state.config.appVersion} ${state.config.buildId}`);
  }
}

async function loadProfile() {
  const data = await apiFetch(`/api/profile?clientId=${encodeURIComponent(state.clientId)}`);
  state.profile = data.profile || {};
  state.scan = data.scan || null;
  state.cooldown = data.cooldown || null;
}

async function saveWallet(form) {
  const formData = new FormData(form);
  const walletAddress = String(formData.get("walletAddress") || "").trim();
  const data = await apiFetch("/api/profile", {
    method: "POST",
    body: JSON.stringify({ clientId: state.clientId, walletAddress })
  });
  state.profile = data.profile || state.profile;
  renderApplicantScene({ sceneKey: "applicantFile" });
  showToast("Wallet saved. It smells wrong already.");
}

async function scanWallet(forceRefresh = false) {
  const input = document.getElementById("walletAddress");
  const walletAddress = String(input?.value || state.profile.walletAddress || "").trim();
  renderScanningScene();
  try {
    const data = await apiFetch("/api/wallet/scan", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, walletAddress, forceRefresh })
    });
    state.profile = data.profile || state.profile;
    state.scan = data.scan;
    await loadProfile().catch(() => {});
    const sceneKey = data.scan.hasRevivePill
      ? "revivePillDetected"
      : data.scan.squigCount <= 0 && !state.config.allowZeroSquigReward
        ? "zeroSquigs"
        : "walletApproved";
    renderApplicantScene({ sceneKey });
    showToast(data.scan.cached ? "Fresh enough scan reused." : "Wallet scanned. It smells wrong. Approved.");
  } catch (error) {
    renderApplicantScene();
    throw error;
  }
}

async function startRun(mode) {
  setStageMode("question");
  setStageScene(mode === "practice" ? "practice" : "loading", {
    badge: mode === "practice" ? "Practice Interview" : "Processing Ugly"
  });
  els.stageHud.innerHTML = "";
  els.stageDeskConsole.innerHTML = `
    <section class="desk-card desk-card--feedback ugly-paper">
      <p class="stamp-label">Processing</p>
      <h2>${mode === "practice" ? "Practice file opened. No payout drawer." : "InSquignito is pulling your reward file."}</h2>
      <p class="microcopy">Please keep your ugliness inside the marked area.</p>
    </section>
  `;
  try {
    const data = await apiFetch("/api/run/start", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, mode })
    });
    renderQuestionScene(data.run);
  } catch (error) {
    if (error.data?.nextAvailableAt) {
      state.cooldown = { nextAvailableAt: error.data.nextAvailableAt };
      renderApplicantScene({ sceneKey: "cooldown" });
    } else if (error.data?.practiceAvailable || error.message.includes("non-holders")) {
      renderApplicantScene({ sceneKey: "zeroSquigs", context: "reward-blocked" });
    } else if (mode === "practice") {
      renderFallbackMenu(`Practice could not start: ${error.message}`);
    } else {
      renderApplicantScene();
    }
    showToast(error.message);
  }
}

async function submitChoice(selectedOptionId) {
  if (!state.run?.question) return;
  Array.from(els.stageDeskConsole.querySelectorAll(".answer-button")).forEach((button) => {
    button.disabled = true;
  });
  try {
    const data = await apiFetch("/api/run/choice", {
      method: "POST",
      body: JSON.stringify({
        clientId: state.clientId,
        runId: state.run.runId,
        questionId: state.run.question.id,
        selectedOptionId
      })
    });
    state.run = data.run;
    renderFeedbackScene(data);
  } catch (error) {
    showToast(error.message);
    Array.from(els.stageDeskConsole.querySelectorAll(".answer-button")).forEach((button) => {
      button.disabled = false;
    });
  }
}

async function advanceRun(action) {
  setStageScene(action === "cashout" ? "cashout" : "loading", {
    badge: action === "cashout" ? "Cashing Out" : "Processing Ugly"
  });
  try {
    const data = await apiFetch("/api/run/advance", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, runId: state.run.runId, action })
    });
    if (data.final) {
      renderFinalScene(data);
      return;
    }
    renderQuestionScene(data.run);
  } catch (error) {
    showToast(error.message);
  }
}

function renderHowModal() {
  els.howCopy.innerHTML = HOW_IT_WORKS.map((item) => `
    <article class="step-card">
      <span>${escapeHtml(item.step)}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.copy)}</p>
      </div>
    </article>
  `).join("");
}

async function renderLeaderboardModal(period = "weekly") {
  els.leaderboardRows.innerHTML = `<div class="empty-state">InSquignito is processing ugly...</div>`;
  try {
    const data = await apiFetch(`/api/leaderboard?period=${period}&limit=100&clientId=${encodeURIComponent(state.clientId)}`);
    const entries = data.entries || [];
    if (!entries.length) {
      els.leaderboardRows.innerHTML = `<div class="empty-state">No ugly applicants have survived this period yet. Be the first mistake.</div>`;
      return;
    }
    const current = data.currentPlayer;
    els.leaderboardRows.innerHTML = entries.map((entry) => `
      <div class="leaderboard-row">
        <strong class="placement">#${entry.placement}</strong>
        <div class="mini-avatar"${entry.discordAvatar ? ` style="background-image:url('${escapeHtml(entry.discordAvatar)}')"` : ""}></div>
        <div>
          <b>${escapeHtml(entry.displayName || "Ugly Applicant")}</b>
          <span>${escapeHtml(entry.lastRankTitle || "Applicant")} · ${entry.lastSquigCount || 0} Squigs ${entry.lastHasRevivePill ? "· Revive Pill" : ""}</span>
          ${entry.placement <= 3 ? `<em>UGLIEST ${entry.placement}</em>` : ""}
        </div>
        <div><b>${entry.bestCharmEver || 0}</b><span>Best $CHARM</span></div>
        <div><b>${entry.totalCharmEarned || 0}</b><span>Total</span></div>
        <div><b>${entry.fullClears || 0}</b><span>Full Clears</span></div>
        <div><b>${entry.bestQuestionReached || 0}</b><span>Best Q</span></div>
      </div>
    `).join("") + (current ? `
      <div class="current-player-row">
        Your placement: #${current.placement} · Best ${current.bestCharmEver || 0} $CHARM · ${current.fullClears || 0} full clears · Best question ${current.bestQuestionReached || 0}
      </div>
    ` : "");
  } catch (error) {
    els.leaderboardRows.innerHTML = `
      <div class="empty-state">
        Leaderboard paperwork failed to load. ${escapeHtml(error.message)}
        <button type="button" class="secondary-action" data-retry="leaderboard" data-period="${escapeHtml(period)}">Retry Leaderboard</button>
      </div>
    `;
  }
}

async function renderClaimsModal() {
  els.claimRows.innerHTML = `<div class="empty-state">InSquignito is processing ugly...</div>`;
  try {
    const data = await apiFetch(`/api/payouts?clientId=${encodeURIComponent(state.clientId)}`);
    const payouts = data.payouts || [];
    const firstStatus = payouts[0]?.status || "claims";
    setStageScene(CLAIM_STATUS_IMAGE_KEYS[firstStatus] || "claims", { badge: "My $CHARM Claims" });
    if (!payouts.length) {
      els.claimRows.innerHTML = `<div class="empty-state">No $CHARM claims yet. InSquignito's drawer remains damp and empty.</div>`;
      return;
    }
    els.claimRows.innerHTML = payouts.map((payout) => `
      <div class="claim-row" data-status="${escapeHtml(payout.status)}">
        <div>
          <b>${escapeHtml(payout.claimCode)}</b>
          <span>${escapeHtml(CLAIM_STATUS_COPY[payout.status] || payout.status)}</span>
        </div>
        <div><b>${payout.amount}</b><span>$CHARM</span></div>
        <div><b>${escapeHtml(payout.status)}</b><span>${formatDate(payout.createdAt)}</span></div>
        <div><b>${formatShortWallet(payout.walletAddress)}</b><span>${escapeHtml(payout.runId)}</span></div>
        <button type="button" class="secondary-action copy-claim" data-code="${escapeHtml(payout.claimCode)}">Copy</button>
      </div>
    `).join("");
  } catch (error) {
    els.claimRows.innerHTML = `
      <div class="empty-state">
        Claim drawer failed to open. ${escapeHtml(error.message)}
        <button type="button" class="secondary-action" data-retry="claims">Retry Claims</button>
      </div>
    `;
  }
}

function renderScanDetails() {
  const scan = state.scan;
  if (!scan) {
    els.scanDetails.textContent = "No scan yet.";
    return;
  }
  const traitRows = Object.entries(scan.traitSummary || {}).slice(0, 24).map(([trait, values]) => {
    const summary = Object.entries(values).slice(0, 6).map(([value, count]) => `${escapeHtml(value)} (${count})`).join(", ");
    return `<dt>${escapeHtml(trait)}</dt><dd>${summary}</dd>`;
  }).join("");
  els.scanDetails.innerHTML = `
    <div class="stat-grid">
      <div><span>Wallet</span><strong>${formatShortWallet(scan.walletAddress)}</strong></div>
      <div><span>Squigs</span><strong>${scan.squigCount}</strong></div>
      <div><span>Revive Pill Tokens</span><strong>${escapeHtml((scan.revivePillTokenIds || []).join(", ") || "None")}</strong></div>
      <div><span>Fetched</span><strong>${formatDate(scan.fetchedAt)}</strong></div>
    </div>
    <h3>Trait Summary</h3>
    <dl>${traitRows || "<dt>None</dt><dd>No traits reported.</dd>"}</dl>
  `;
}

function restoreSceneAfterModal() {
  if (state.currentMode === "question" && state.run?.question) {
    setStageScene(TIER_IMAGE_KEYS[state.run.question.tier] || "activeInterview", { badge: state.run.question.tierLabel || "Active Interview" });
    return;
  }
  if (state.currentMode === "applicant" || state.currentMode === "scanning") {
    setStageScene(chooseApplicantScene(), { badge: "Ugly Applicant File" });
    return;
  }
  if (state.currentMode === "final") return;
  setStageScene("hero", { badge: "Main Menu" });
}

function openModal(name) {
  state.modeBeforeModal = state.currentMode;
  setStageMode("modal");
  if (name === "how") {
    setStageScene("howItWorks", { badge: "How It Works" });
    renderHowModal();
    els.howDialog.showModal();
  }
  if (name === "leaderboard") {
    setStageScene("leaderboard", { badge: "Leaderboard" });
    renderLeaderboardModal("weekly");
    els.leaderboardDialog.showModal();
  }
  if (name === "claims") {
    setStageScene("claims", { badge: "My $CHARM Claims" });
    renderClaimsModal();
    els.claimsDialog.showModal();
  }
  if (name === "scan") {
    setStageScene(state.scan?.hasRevivePill ? "revivePillDetected" : state.scan?.squigCount > 0 ? "walletScan" : "gate", { badge: "Wallet Scan Details" });
    renderScanDetails();
    els.scanDialog.showModal();
  }
}

function closeModal(name) {
  const dialog = {
    how: els.howDialog,
    leaderboard: els.leaderboardDialog,
    claims: els.claimsDialog,
    scan: els.scanDialog
  }[name];
  dialog?.close();
  setStageMode(state.modeBeforeModal || "menu");
  restoreSceneAfterModal();
}

async function retryConnection() {
  setStageScene("loading", { badge: "Retrying Connection" });
  try {
    await loadConfig();
    await loadProfile();
    state.bootError = "";
    renderMenuScene();
    showToast("Connection refreshed. InSquignito remains suspicious.");
  } catch (error) {
    showVisibleError(error.message);
  }
}

function wireEvents() {
  if (state.eventsWired) return;
  state.eventsWired = true;
  window.__uglyAppReady = true;
  document.addEventListener("click", async (event) => {
    const openButton = event.target.closest("[data-open]");
    if (openButton) {
      openModal(openButton.dataset.open);
      return;
    }

    const closeButton = event.target.closest("[data-close]");
    if (closeButton) {
      closeModal(closeButton.dataset.close);
      return;
    }

    const periodButton = event.target.closest("[data-period]");
    if (periodButton) {
      document.querySelectorAll("[data-period]").forEach((tab) => tab.classList.toggle("active", tab === periodButton));
      renderLeaderboardModal(periodButton.dataset.period);
      return;
    }

    const retryButton = event.target.closest("[data-retry]");
    if (retryButton) {
      const target = retryButton.dataset.retry;
      if (target === "leaderboard") await renderLeaderboardModal(retryButton.dataset.period || "weekly");
      if (target === "claims") await renderClaimsModal();
      if (target === "profile") await retryConnection();
      return;
    }

    const copyClaimButton = event.target.closest(".copy-claim");
    if (copyClaimButton) {
      await safeClipboardWrite(copyClaimButton.dataset.code);
      showToast("Claim code copied.");
      return;
    }

    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    try {
      if (action === "begin-reward") {
        if (!isRewardReady()) {
          renderApplicantScene({ sceneKey: chooseApplicantScene(), context: state.scan?.squigCount === 0 ? "reward-blocked" : "applicant" });
          return;
        }
        await startRun("reward");
      }
      if (action === "practice") await startRun("practice");
      if (action === "show-applicant") renderApplicantScene();
      if (action === "retry-connection") await retryConnection();
      if (action === "connect-discord") {
        setStageScene("loading", { badge: "Discord Redirect" });
        window.location.href = `/api/auth/discord/start?clientId=${encodeURIComponent(state.clientId)}`;
      }
      if (action === "scan-wallet") await scanWallet(false);
      if (action === "refresh-scan") await scanWallet(true);
      if (action === "answer") await submitChoice(actionEl.dataset.optionId);
      if (action === "continue") await advanceRun("continue");
      if (action === "cashout") await advanceRun("cashout");
      if (action === "view-final" && state.pendingFinalData) renderFinalScene(state.pendingFinalData);
      if (action === "copy-claim" && state.lastClaimCode) {
        await safeClipboardWrite(state.lastClaimCode);
        showToast("Claim code copied. Guard the ugly paperwork.");
      }
      if (action === "return-menu") {
        await loadProfile().catch(() => {});
        renderMenuScene();
      }
    } catch (error) {
      showToast(error.message);
      if (["begin-reward", "retry-connection"].includes(action)) {
        renderFallbackMenu(error.message);
      }
    }
  });

  els.stageDeskConsole.addEventListener("submit", async (event) => {
    if (event.target.id !== "walletForm") return;
    event.preventDefault();
    try {
      await saveWallet(event.target);
    } catch (error) {
      showToast(error.message);
    }
  });

  [els.howDialog, els.leaderboardDialog, els.claimsDialog, els.scanDialog].forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (document.body.dataset.view === "modal") {
        setStageMode(state.modeBeforeModal || "menu");
        restoreSceneAfterModal();
      }
    });
  });
}

async function init() {
  try {
    ensureElements();
    state.clientId = getOrCreateClientId();
    wireEvents();
    preloadImages();
    renderMenuScene();

    const params = new URLSearchParams(window.location.search);
    const discordConnected = params.get("discord") === "connected";
    const discordFailed = params.get("discord") && !discordConnected;

    try {
      await loadConfig();
    } catch (error) {
      state.config = { ...DEFAULT_CONFIG };
      showToast(error.message);
    }

    try {
      await loadProfile();
    } catch (error) {
      state.profile = { clientId: state.clientId };
      state.scan = null;
      state.cooldown = null;
      showToast(error.message);
    }

    if (discordConnected) {
      showToast("Discord connected. InSquignito is unimpressed.");
      history.replaceState({}, "", "/");
      renderApplicantScene({ sceneKey: "applicantFile" });
      return;
    }
    if (discordFailed) {
      showToast("Discord login did not finish. The paperwork hissed.");
      history.replaceState({}, "", "/");
    }

    renderMenuScene();
  } catch (error) {
    console.error("[Ugly Interview] boot failed", error);
    try {
      state.clientId ||= "client_fallback";
      wireEvents();
      renderFallbackMenu(error.message || "Frontend boot failed. Practice mode may still work.");
    } catch {
      document.body.innerHTML = `
        <main class="app-shell">
          <section class="ugly-paper desk-card">
            <h1>InSquignito's Ugly Interview</h1>
            <p class="cooldown">The office failed to boot. Refresh and try again.</p>
          </section>
        </main>
      `;
    }
  }
}

init();
