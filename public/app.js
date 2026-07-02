import {
  APP_COPY,
  CLAIM_STATUS_COPY,
  CLAIM_STATUS_IMAGE_KEYS,
  HOW_IT_WORKS,
  OFFICE_IMAGES,
  PRELOAD_IMAGE_KEYS,
  TIER_IMAGE_KEYS
} from "/game-data.js";

const STORAGE_KEYS = {
  clientId: "insquignito-client-id"
};

const els = {
  menuView: document.getElementById("menuView"),
  gameView: document.getElementById("gameView"),
  finalView: document.getElementById("finalView"),
  sceneFrame: document.getElementById("sceneFrame"),
  sceneImage: document.getElementById("sceneImage"),
  sceneBadge: document.getElementById("sceneBadge"),
  sceneCaption: document.getElementById("sceneCaption"),
  gameSceneFrame: document.getElementById("gameSceneFrame"),
  gameSceneImage: document.getElementById("gameSceneImage"),
  gameSceneBadge: document.getElementById("gameSceneBadge"),
  finalSceneFrame: document.getElementById("finalSceneFrame"),
  finalSceneImage: document.getElementById("finalSceneImage"),
  finalSceneBadge: document.getElementById("finalSceneBadge"),
  howSceneFrame: document.getElementById("howSceneFrame"),
  howSceneImage: document.getElementById("howSceneImage"),
  leaderboardSceneFrame: document.getElementById("leaderboardSceneFrame"),
  leaderboardSceneImage: document.getElementById("leaderboardSceneImage"),
  claimsSceneFrame: document.getElementById("claimsSceneFrame"),
  claimsSceneImage: document.getElementById("claimsSceneImage"),
  scanSceneFrame: document.getElementById("scanSceneFrame"),
  scanSceneImage: document.getElementById("scanSceneImage"),
  beginInterview: document.getElementById("beginInterview"),
  practiceInterview: document.getElementById("practiceInterview"),
  connectDiscord: document.getElementById("connectDiscord"),
  walletForm: document.getElementById("walletForm"),
  walletAddress: document.getElementById("walletAddress"),
  scanWallet: document.getElementById("scanWallet"),
  refreshScan: document.getElementById("refreshScan"),
  discordAvatar: document.getElementById("discordAvatar"),
  discordName: document.getElementById("discordName"),
  discordMeta: document.getElementById("discordMeta"),
  gateSummary: document.getElementById("gateSummary"),
  squigCount: document.getElementById("squigCount"),
  revivePill: document.getElementById("revivePill"),
  dignityGranted: document.getElementById("dignityGranted"),
  modeAvailable: document.getElementById("modeAvailable"),
  walletNote: document.getElementById("walletNote"),
  cooldownStatus: document.getElementById("cooldownStatus"),
  hudQuestion: document.getElementById("hudQuestion"),
  hudTier: document.getElementById("hudTier"),
  hudDignity: document.getElementById("hudDignity"),
  hudCharm: document.getElementById("hudCharm"),
  hudSquigs: document.getElementById("hudSquigs"),
  hudTimer: document.getElementById("hudTimer"),
  questionTierSticker: document.getElementById("questionTierSticker"),
  questionReward: document.getElementById("questionReward"),
  questionCategory: document.getElementById("questionCategory"),
  questionPrompt: document.getElementById("questionPrompt"),
  questionFlavor: document.getElementById("questionFlavor"),
  answerOptions: document.getElementById("answerOptions"),
  feedbackCard: document.getElementById("feedbackCard"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackRoast: document.getElementById("feedbackRoast"),
  feedbackExplanation: document.getElementById("feedbackExplanation"),
  feedbackGain: document.getElementById("feedbackGain"),
  feedbackActions: document.getElementById("feedbackActions"),
  finalResult: document.getElementById("finalResult"),
  finalRank: document.getElementById("finalRank"),
  finalCopy: document.getElementById("finalCopy"),
  finalCharm: document.getElementById("finalCharm"),
  finalClaim: document.getElementById("finalClaim"),
  finalStatus: document.getElementById("finalStatus"),
  dripInstructions: document.getElementById("dripInstructions"),
  copyClaim: document.getElementById("copyClaim"),
  openDiscord: document.getElementById("openDiscord"),
  returnMenu: document.getElementById("returnMenu"),
  retryPractice: document.getElementById("retryPractice"),
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
  config: {},
  profile: {},
  scan: null,
  cooldown: null,
  run: null,
  timerHandle: null,
  lastClaimCode: "",
  sceneKeys: {
    menu: "hero",
    game: "activeInterview",
    final: "hired"
  }
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
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || `Request failed (${response.status})`, data);
  return data;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOfficeImage(key) {
  return OFFICE_IMAGES[key] || OFFICE_IMAGES.hero;
}

function setOfficeStage(stageEl, imgEl, key, label = "") {
  const imageKey = OFFICE_IMAGES[key] ? key : "hero";
  const asset = getOfficeImage(imageKey);
  stageEl.dataset.scene = imageKey;
  stageEl.classList.remove("image-error");
  imgEl.onerror = () => {
    if (imageKey === "hero") {
      stageEl.classList.add("image-error");
      return;
    }
    setOfficeStage(stageEl, imgEl, "hero", "Image failed. Ugly fallback active.");
  };
  imgEl.src = asset.url;
  imgEl.alt = asset.alt;

  if (stageEl === els.sceneFrame) {
    state.sceneKeys.menu = imageKey;
    els.sceneBadge.textContent = label || "Ugly Labs HR";
    els.sceneCaption.textContent = label || "";
  }
  if (stageEl === els.gameSceneFrame) {
    state.sceneKeys.game = imageKey;
    els.gameSceneBadge.textContent = label || "Active Interview";
  }
  if (stageEl === els.finalSceneFrame) {
    state.sceneKeys.final = imageKey;
    els.finalSceneBadge.textContent = label || "Interview Result";
  }
}

function setMenuScene(key, label) {
  setOfficeStage(els.sceneFrame, els.sceneImage, key, label);
}

function setGameScene(key, label) {
  setOfficeStage(els.gameSceneFrame, els.gameSceneImage, key, label);
}

function setFinalScene(key, label) {
  setOfficeStage(els.finalSceneFrame, els.finalSceneImage, key, label);
}

function preloadImages() {
  for (const key of PRELOAD_IMAGE_KEYS) {
    const asset = getOfficeImage(key);
    const img = new Image();
    img.src = asset.url;
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function setView(view) {
  els.menuView.classList.toggle("hidden", view !== "menu");
  els.gameView.classList.toggle("hidden", view !== "game");
  els.finalView.classList.toggle("hidden", view !== "final");
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

function chooseMenuScene() {
  const profile = state.profile || {};
  const scan = state.scan;
  if (state.cooldown?.nextAvailableAt) return ["cooldown", "Reward Cooldown"];
  if (!profile.discordUserId && !profile.walletAddress) return ["gate", "Discord + Wallet Gate"];
  if (!scan && profile.walletAddress) return ["applicantFile", "Applicant File"];
  if (!scan) return ["gate", "Applicant Intake"];
  if (scan.hasRevivePill) return ["revivePillDetected", "Revive Pill Detected"];
  if (scan.squigCount <= 0 && !state.config.allowZeroSquigReward) return ["zeroSquigs", "Practice Only"];
  if (scan.squigCount > 0) return ["walletApproved", "Wallet Approved"];
  return ["walletScan", "Wallet Scan"];
}

function syncApplicantFile() {
  const profile = state.profile || {};
  const scan = state.scan;
  els.walletNote.textContent = APP_COPY.walletNote;
  els.walletAddress.value = profile.walletAddress || els.walletAddress.value || "";

  if (profile.discordHandle || profile.discordUserId) {
    els.discordName.textContent = profile.discordGlobalName || profile.discordHandle || profile.discordUserId;
    els.discordMeta.textContent = profile.discordHandle ? `@${profile.discordHandle}` : "Discord connected";
    if (profile.discordAvatar) {
      els.discordAvatar.style.backgroundImage = `url("${profile.discordAvatar}")`;
      els.discordAvatar.textContent = "";
    } else {
      els.discordAvatar.style.backgroundImage = "";
      els.discordAvatar.textContent = "D";
    }
  } else {
    els.discordName.textContent = "Discord not connected";
    els.discordMeta.textContent = "Required for reward runs";
    els.discordAvatar.style.backgroundImage = "";
    els.discordAvatar.textContent = "?";
  }

  els.squigCount.textContent = String(scan?.squigCount || 0);
  els.revivePill.textContent = scan?.hasRevivePill ? `Yes (${scan.revivePillCount})` : "No";
  els.dignityGranted.textContent = String(scan?.dignityGranted || 1);
  const rewardReady = Boolean(profile.discordUserId && scan && (scan.squigCount > 0 || state.config.allowZeroSquigReward));
  els.modeAvailable.textContent = rewardReady ? "Reward" : "Practice";
  els.gateSummary.textContent = scan
    ? `Wallet scanned. ${scan.squigCount} Squigs found. ${scan.walletTitle || "Stay Ugly"}.`
    : "Connect Discord, paste a wallet, and let the scanner insult it.";
  els.cooldownStatus.textContent = cooldownText(state.cooldown);
  const [scene, label] = chooseMenuScene();
  setMenuScene(scene, label);
}

function renderHow() {
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

async function loadConfig() {
  state.config = await apiFetch("/api/config");
  els.openDiscord.href = state.config.discordInviteUrl || "https://squigs.io/discord";
}

async function loadProfile() {
  const data = await apiFetch(`/api/profile?clientId=${encodeURIComponent(state.clientId)}`);
  state.profile = data.profile || {};
  state.scan = data.scan || null;
  state.cooldown = data.cooldown || null;
  syncApplicantFile();
}

async function saveWallet() {
  const walletAddress = els.walletAddress.value.trim();
  const data = await apiFetch("/api/profile", {
    method: "POST",
    body: JSON.stringify({ clientId: state.clientId, walletAddress })
  });
  state.profile = data.profile || state.profile;
  syncApplicantFile();
  setMenuScene("applicantFile", "Applicant File Saved");
  showToast("Wallet saved. It smells wrong already.");
}

async function scanWallet(forceRefresh = false) {
  const walletAddress = els.walletAddress.value.trim();
  setMenuScene("loading", "InSquignito is processing ugly...");
  els.scanWallet.disabled = true;
  els.refreshScan.disabled = true;
  try {
    const data = await apiFetch("/api/wallet/scan", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, walletAddress, forceRefresh })
    });
    state.profile = data.profile || state.profile;
    state.scan = data.scan;
    syncApplicantFile();
    renderScanDetails();
    if (data.scan.hasRevivePill) {
      setMenuScene("revivePillDetected", "Revive Pill Detected");
    } else if (data.scan.squigCount <= 0 && !state.config.allowZeroSquigReward) {
      setMenuScene("zeroSquigs", "Practice Only");
    } else {
      setMenuScene("walletApproved", "Wallet Approved");
    }
    showToast(data.scan.cached ? "Fresh enough scan reused." : "Wallet scanned. It smells wrong. Approved.");
  } finally {
    els.scanWallet.disabled = false;
    els.refreshScan.disabled = false;
  }
}

function syncHud(run) {
  if (!run) return;
  const q = run.question;
  els.hudQuestion.textContent = q ? `${q.progressNumber}/${q.interviewLength}` : `${Math.min(run.currentIndex + 1, run.interviewLength)}/${run.interviewLength}`;
  els.hudTier.textContent = q?.tierLabel || "Interview";
  els.hudDignity.textContent = String(run.dignityRemaining);
  els.hudCharm.textContent = String(run.charmStack);
  els.hudSquigs.textContent = String(run.squigCount);
}

function startTimer(question) {
  clearInterval(state.timerHandle);
  els.hudTimer.classList.remove("timer-low");
  if (!question?.expiresAt || !question.timerSeconds) {
    els.hudTimer.textContent = "--";
    return;
  }
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((Date.parse(question.expiresAt) - Date.now()) / 1000));
    els.hudTimer.textContent = `${remaining}s`;
    els.hudTimer.classList.toggle("timer-low", remaining <= 5);
    if (remaining <= 0) clearInterval(state.timerHandle);
  };
  tick();
  state.timerHandle = setInterval(tick, 250);
}

function renderQuestion(run) {
  state.run = run;
  const question = run.question;
  if (!question) return;
  setView("game");
  els.feedbackCard.classList.add("hidden");
  els.answerOptions.innerHTML = "";
  syncHud(run);
  startTimer(question);
  const tierKey = TIER_IMAGE_KEYS[question.tier] || "activeInterview";
  setGameScene(tierKey, question.tierLabel || "Active Interview");
  els.questionTierSticker.textContent = question.tierLabel || "Interview";
  els.questionReward.textContent = `+${question.reward} $CHARM`;
  els.questionCategory.textContent = question.category;
  els.questionPrompt.textContent = question.prompt;
  els.questionFlavor.textContent = question.flavorText || "InSquignito taps the clipboard. It leaves a stain.";

  for (const option of question.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.innerHTML = `<span>${escapeHtml(option.id)}</span>${escapeHtml(option.text)}`;
    button.addEventListener("click", () => submitChoice(option.id));
    els.answerOptions.appendChild(button);
  }
}

async function startRun(mode) {
  setView("game");
  setGameScene(mode === "practice" ? "practice" : "loading", mode === "practice" ? "Practice Interview" : "InSquignito is processing ugly...");
  els.feedbackCard.classList.add("hidden");
  els.answerOptions.innerHTML = "";
  els.questionPrompt.textContent = mode === "practice" ? "Practice file opened. No payout drawer." : "InSquignito is pulling your reward file.";
  els.questionFlavor.textContent = "Please keep your ugliness inside the marked area.";
  try {
    const data = await apiFetch("/api/run/start", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, mode })
    });
    renderQuestion(data.run);
  } catch (error) {
    if (error.data?.nextAvailableAt) {
      setView("menu");
      setMenuScene("cooldown", "Reward Cooldown");
    } else if (error.data?.practiceAvailable || error.message.includes("non-holders")) {
      setView("menu");
      setMenuScene("zeroSquigs", "Practice Only");
    } else {
      setView("menu");
      syncApplicantFile();
    }
    showToast(error.message);
  }
}

async function submitChoice(selectedOptionId) {
  if (!state.run?.question) return;
  Array.from(els.answerOptions.children).forEach((button) => {
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
    clearInterval(state.timerHandle);
    state.run = data.run;
    syncHud(data.run);
    renderFeedback(data);
  } catch (error) {
    showToast(error.message);
    Array.from(els.answerOptions.children).forEach((button) => {
      button.disabled = false;
    });
  }
}

function renderFeedback(data) {
  const feedback = data.feedback;
  els.feedbackCard.classList.remove("hidden");
  const imageKey = data.cashoutAvailable
    ? "cashout"
    : feedback.wasCorrect
      ? "correct"
      : data.final
        ? "dignityLost"
        : "wrong";
  setGameScene(imageKey, data.cashoutAvailable ? "Cash Out Checkpoint" : feedback.wasCorrect ? "Ugly Verified" : "Pretty Energy Detected");
  els.feedbackTitle.textContent = feedback.wasCorrect ? "Correct" : feedback.timedOut ? "Too Slow" : "Wrong";
  els.feedbackRoast.textContent = feedback.roast;
  els.feedbackExplanation.textContent = `${feedback.explanation} Correct answer: ${feedback.correctAnswerText}`;
  els.feedbackGain.textContent = feedback.wasCorrect
    ? `+$CHARM ${feedback.rewardAdded}. Disgusting answer. Continue.`
    : `Dignity Lost: ${feedback.dignityLost}. You weren't using it well anyway.`;
  els.feedbackActions.innerHTML = "";

  if (data.final) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-action";
    button.textContent = "View Stamped File";
    button.addEventListener("click", () => renderFinal(data));
    els.feedbackActions.appendChild(button);
    return;
  }

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "primary-action";
  continueButton.textContent = "Continue And Risk Your Remaining Dignity";
  continueButton.addEventListener("click", () => advanceRun("continue"));
  els.feedbackActions.appendChild(continueButton);

  if (data.cashoutAvailable) {
    const cashoutButton = document.createElement("button");
    cashoutButton.type = "button";
    cashoutButton.className = "secondary-action";
    cashoutButton.textContent = "Leave With Your Ugly Little Bag";
    cashoutButton.addEventListener("click", () => advanceRun("cashout"));
    els.feedbackActions.appendChild(cashoutButton);
  }
}

async function advanceRun(action) {
  if (action === "cashout") {
    setGameScene("cashout", "Cashing Out");
  } else {
    setGameScene("loading", "InSquignito is processing ugly...");
  }
  try {
    const data = await apiFetch("/api/run/advance", {
      method: "POST",
      body: JSON.stringify({ clientId: state.clientId, runId: state.run.runId, action })
    });
    if (data.final) {
      renderFinal(data);
      return;
    }
    renderQuestion(data.run);
  } catch (error) {
    showToast(error.message);
  }
}

function finalImageKey(run) {
  if (run.mode === "practice" && run.status !== "completed") return "practice";
  if (run.status === "out_of_dignity") return "gameOver";
  if (run.status === "cashed_out") return "cashout";
  if (run.status === "completed" && run.correctCount >= 15 && run.wrongCount === 0) return "fullClear";
  if (run.status === "completed") return "hired";
  return run.mode === "practice" ? "practice" : "hired";
}

function renderFinal(data) {
  const run = data.run;
  const payout = run.payout;
  state.lastClaimCode = payout?.claimCode || "";
  setView("final");
  setFinalScene(finalImageKey(run), run.status === "completed" ? "Hired By InSquignito" : run.resultType || "Interview Result");
  els.finalResult.textContent = run.status === "completed" ? "HIRED BY INSQUIGNITO" : run.resultType || "Interview Complete";
  els.finalRank.textContent = run.rankTitle;
  els.finalCopy.textContent = data.endCopy || "InSquignito is disappointed, but not surprised. Stay Ugly.";
  els.finalCharm.textContent = String(run.charmFinal || 0);
  els.finalClaim.textContent = payout?.claimCode || (run.mode === "practice" ? "Practice run" : "No claim");
  els.finalStatus.textContent = payout ? "pending" : "No payout";
  els.dripInstructions.textContent = payout ? APP_COPY.drip : "Practice runs and zero-value results do not create $CHARM payouts.";
  els.copyClaim.disabled = !payout?.claimCode;
}

async function renderLeaderboard(period = "weekly") {
  setOfficeStage(els.leaderboardSceneFrame, els.leaderboardSceneImage, "loading", "InSquignito is processing ugly...");
  els.leaderboardRows.innerHTML = `<div class="empty-state">InSquignito is processing ugly...</div>`;
  try {
    const data = await apiFetch(`/api/leaderboard?period=${period}&limit=100&clientId=${encodeURIComponent(state.clientId)}`);
    setOfficeStage(els.leaderboardSceneFrame, els.leaderboardSceneImage, "leaderboard", "Leaderboard");
    const entries = data.entries || [];
    if (!entries.length) {
      els.leaderboardRows.textContent = "No ugly applicants have survived this period yet. Be the first mistake.";
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
    els.leaderboardRows.textContent = error.message;
  }
}

async function renderClaims() {
  setOfficeStage(els.claimsSceneFrame, els.claimsSceneImage, "loading", "InSquignito is processing ugly...");
  els.claimRows.innerHTML = `<div class="empty-state">InSquignito is processing ugly...</div>`;
  try {
    const data = await apiFetch(`/api/payouts?clientId=${encodeURIComponent(state.clientId)}`);
    const payouts = data.payouts || [];
    const firstStatus = payouts[0]?.status || "claims";
    setOfficeStage(els.claimsSceneFrame, els.claimsSceneImage, CLAIM_STATUS_IMAGE_KEYS[firstStatus] || "claims", "My $CHARM Claims");
    if (!payouts.length) {
      els.claimRows.textContent = "No $CHARM claims yet. InSquignito's drawer remains damp and empty.";
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
    els.claimRows.textContent = error.message;
  }
}

function renderScanDetails() {
  const scan = state.scan;
  const scanScene = scan?.hasRevivePill ? "revivePillDetected" : scan?.squigCount > 0 ? "walletScan" : "zeroSquigs";
  setOfficeStage(els.scanSceneFrame, els.scanSceneImage, scan ? scanScene : "gate", "Wallet Scan Details");
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

function openModal(name) {
  if (name === "how") {
    setOfficeStage(els.howSceneFrame, els.howSceneImage, "howItWorks", "How It Works");
    renderHow();
    els.howDialog.showModal();
  }
  if (name === "leaderboard") {
    renderLeaderboard("weekly");
    els.leaderboardDialog.showModal();
  }
  if (name === "claims") {
    renderClaims();
    els.claimsDialog.showModal();
  }
  if (name === "scan") {
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
}

function wireEvents() {
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.open));
  });
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
  document.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-period]").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderLeaderboard(button.dataset.period);
    });
  });

  els.walletForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveWallet();
    } catch (error) {
      showToast(error.message);
    }
  });
  els.connectDiscord.addEventListener("click", () => {
    setMenuScene("loading", "Discord Redirect");
    window.location.href = `/api/auth/discord/start?clientId=${encodeURIComponent(state.clientId)}`;
  });
  els.scanWallet.addEventListener("click", () => scanWallet(false).catch((error) => {
    syncApplicantFile();
    showToast(error.message);
  }));
  els.refreshScan.addEventListener("click", () => scanWallet(true).catch((error) => {
    syncApplicantFile();
    showToast(error.message);
  }));
  els.beginInterview.addEventListener("click", () => startRun("reward"));
  els.practiceInterview.addEventListener("click", () => startRun("practice"));
  els.returnMenu.addEventListener("click", async () => {
    await loadProfile().catch(() => {});
    setView("menu");
  });
  els.retryPractice.addEventListener("click", () => startRun("practice"));
  els.copyClaim.addEventListener("click", async () => {
    if (!state.lastClaimCode) return;
    await navigator.clipboard.writeText(state.lastClaimCode);
    showToast("Claim code copied. Guard the ugly paperwork.");
  });
  els.claimRows.addEventListener("click", async (event) => {
    const button = event.target.closest(".copy-claim");
    if (!button) return;
    await navigator.clipboard.writeText(button.dataset.code);
    showToast("Claim code copied.");
  });
  els.gateSummary.addEventListener("click", () => openModal("scan"));
}

async function init() {
  state.clientId = getOrCreateClientId();
  wireEvents();
  preloadImages();
  renderHow();
  setMenuScene("hero", "Main Menu");
  setGameScene("activeInterview", "Active Interview");
  setFinalScene("hired", "Interview Result");
  setMenuScene("loading", "InSquignito is processing ugly...");
  await loadConfig().catch((error) => showToast(error.message));
  await loadProfile().catch((error) => showToast(error.message));
  const params = new URLSearchParams(window.location.search);
  if (params.get("discord") === "connected") {
    showToast("Discord connected. InSquignito is unimpressed.");
    history.replaceState({}, "", "/");
    await loadProfile().catch(() => {});
  } else if (params.get("discord")) {
    showToast("Discord login did not finish. The paperwork hissed.");
    history.replaceState({}, "", "/");
  }
}

init();
