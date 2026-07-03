const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const db = require("./server/db");
const { handleDiscordCallback, isDiscordConfigured, startDiscordAuth } = require("./server/discord-auth");
const {
  CASHOUT_CHECKPOINTS,
  buildRunPlan,
  calculateDignity,
  getGameConfig,
  getInterviewRank,
  getQuestionWindow,
  getWalletTitle,
  questionMap,
  rewardForProgress,
  sanitizeQuestion
} = require("./server/game-engine");
const { QUESTIONS, validateQuestions } = require("./server/interview-questions");
const { createPendingPayoutForRun } = require("./server/rewards");
const { getCacheMinutes, isAlchemyConfigured, scanWallet } = require("./server/wallet-scan");
const { isValidClientId, isValidEthereumAddress, normalizeText, normalizeWallet } = require("./server/validators");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const QUESTIONS_BY_ID = questionMap(QUESTIONS);
const APP_VERSION = "2026-07-02-language-select";
const BUILD_ID = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.SOURCE_VERSION || process.env.GIT_COMMIT || APP_VERSION;
const SUPPORTED_TRANSLATION_LANGUAGES = new Set(["en", "fr", "es"]);
const translationCache = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

validateQuestions(QUESTIONS);

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
  });
  res.end(body);
}

function sendJson(res, statusCode, value) {
  send(res, statusCode, JSON.stringify(value), "application/json; charset=utf-8");
}

function safePathname(url) {
  const pathname = new URL(url, "http://localhost").pathname;
  const normalized = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  return normalized === path.sep ? "index.html" : normalized.replace(/^[/\\]+/, "") || "index.html";
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function translateOneText(text, language) {
  const cleanText = String(text || "").slice(0, 1000);
  if (!cleanText || language === "en") return cleanText;
  const cacheKey = `${language}:${cleanText}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "en");
    url.searchParams.set("tl", language);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", cleanText);
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Translation failed (${response.status})`);
    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => Array.isArray(part) ? part[0] : "").join("")
      : cleanText;
    translationCache.set(cacheKey, translated || cleanText);
    return translated || cleanText;
  } catch {
    return cleanText;
  } finally {
    clearTimeout(timeout);
  }
}

function publicProfile(profile) {
  return {
    clientId: profile?.clientId || "",
    discordUserId: profile?.discordUserId || "",
    discordHandle: profile?.discordHandle || "",
    discordAvatar: profile?.discordAvatar || "",
    discordGlobalName: profile?.discordGlobalName || "",
    walletAddress: profile?.walletAddress || "",
    twitterHandle: profile?.twitterHandle || ""
  };
}

function publicScan(scan) {
  if (!scan) return null;
  return {
    id: scan.id || null,
    walletAddress: scan.walletAddress,
    squigCount: scan.squigCount,
    tokenIds: scan.tokenIds || [],
    traitSummary: scan.traitSummary || {},
    revivePillCount: scan.revivePillCount,
    hasRevivePill: scan.hasRevivePill,
    revivePillTokenIds: scan.revivePillTokenIds || [],
    dignityGranted: scan.dignityGranted,
    rawCount: scan.rawCount || 0,
    fetchedAt: scan.fetchedAt,
    source: scan.source || "alchemy",
    cached: Boolean(scan.cached),
    walletTitle: getWalletTitle(scan.squigCount, scan.hasRevivePill)
  };
}

function publicRun(run, question = null, extra = {}) {
  if (!run) return null;
  return {
    runId: run.runId,
    mode: run.mode,
    status: run.status,
    currentIndex: run.currentIndex,
    interviewLength: run.interviewLength,
    dignityStart: run.dignityStart,
    dignityRemaining: run.dignityRemaining,
    squigCount: run.squigCount,
    hasRevivePill: run.hasRevivePill,
    walletTitle: getWalletTitle(run.squigCount, run.hasRevivePill),
    correctCount: run.correctCount,
    wrongCount: run.wrongCount,
    charmStack: run.charmStack,
    charmFinal: run.charmFinal,
    completionBonus: run.completionBonus,
    rankTitle: run.rankTitle || getInterviewRank(run.correctCount, run.wrongCount),
    resultType: run.resultType || "",
    question,
    ...extra
  };
}

function getCurrentQuestion(run) {
  const questionId = run.questionIds[run.currentIndex];
  return questionId ? QUESTIONS_BY_ID.get(questionId) : null;
}

function isRunExpired(run) {
  const config = getGameConfig();
  return Date.now() - Date.parse(run.createdAt || new Date().toISOString()) > config.runMaxActiveHours * 60 * 60 * 1000;
}

async function expireIfNeeded(run) {
  if (run && run.status === "active" && isRunExpired(run)) {
    return db.updateRun(run.runId, {
      ...run,
      status: "expired",
      resultType: "Expired",
      rankTitle: getInterviewRank(run.correctCount, run.wrongCount),
      finishedAt: new Date().toISOString()
    });
  }
  return run;
}

async function finishRun(run, patch) {
  const finished = await db.updateRun(run.runId, {
    ...run,
    ...patch,
    rankTitle: patch.rankTitle || getInterviewRank(patch.correctCount ?? run.correctCount, patch.wrongCount ?? run.wrongCount),
    finishedAt: new Date().toISOString(),
    questionStartedAt: null,
    questionExpiresAt: null
  });
  await db.updateLeaderboard(finished);
  const payout = await createPendingPayoutForRun(finished);
  return { run: finished, payout };
}

function startQuestionWindowForRun(run) {
  const question = getCurrentQuestion(run);
  if (!question) return { questionStartedAt: null, questionExpiresAt: null };
  const window = getQuestionWindow(question);
  return {
    questionStartedAt: window.questionStartedAt.toISOString(),
    questionExpiresAt: window.questionExpiresAt ? window.questionExpiresAt.toISOString() : null
  };
}

async function handleHealth(res) {
  let dbOk = false;
  if (db.isDbEnabled()) {
    try {
      dbOk = await db.checkDb();
    } catch {
      dbOk = false;
    }
  }
  sendJson(res, 200, {
    ok: true,
    app: "insquignitos-ugly-interview",
    appVersion: APP_VERSION,
    buildId: BUILD_ID,
    dbEnabled: db.isDbEnabled(),
    dbOk,
    alchemyConfigured: isAlchemyConfigured(),
    discordConfigured: isDiscordConfigured()
  });
}

async function handleStartRun(res, body) {
  const clientId = body.clientId;
  const requestedMode = body.mode === "practice" ? "practice" : "reward";
  const config = getGameConfig();
  if (!isValidClientId(clientId)) {
    sendJson(res, 400, { error: "Invalid clientId" });
    return;
  }

  const profile = await db.getProfile(clientId);
  let scan = profile?.walletAddress ? await db.getLatestWalletScan(profile.walletAddress) : null;
  let mode = requestedMode;

  if (mode === "reward") {
    if (!profile?.discordUserId) {
      sendJson(res, 400, { error: "Discord login is required for reward interviews." });
      return;
    }
    if (!profile.walletAddress || !scan) {
      sendJson(res, 400, { error: "A saved wallet scan is required for reward interviews." });
      return;
    }
    if (!config.allowZeroSquigReward && scan.squigCount <= 0) {
      sendJson(res, 403, {
        error: "You may interview for free, but InSquignito refuses to pay non-holders. Get ugly first.",
        practiceAvailable: true
      });
      return;
    }
    const activeReward = await db.getActiveRewardRun(profile.discordUserId, profile.walletAddress);
    if (activeReward && !isRunExpired(activeReward)) {
      sendJson(res, 409, { error: "You already have an active reward interview.", activeRun: publicRun(activeReward) });
      return;
    }
    const cooldown = await db.getRewardCooldown(profile.discordUserId, profile.walletAddress, config.rewardCooldownHours);
    if (!cooldown.available) {
      sendJson(res, 429, {
        error: "Reward interview is cooling down. Practice mode is still open.",
        nextAvailableAt: cooldown.nextAvailableAt,
        practiceAvailable: true
      });
      return;
    }
  }

  if (mode === "practice" && profile?.walletAddress) {
    scan = scan || await db.getLatestWalletScan(profile.walletAddress);
  }

  const squigCount = scan?.squigCount || 0;
  const hasRevivePill = Boolean(scan?.hasRevivePill);
  const dignity = scan?.dignityGranted || calculateDignity(squigCount, hasRevivePill);
  const questionIds = buildRunPlan(QUESTIONS, config.interviewLength);
  const seedHash = crypto.createHash("sha256").update(`${crypto.randomUUID()}:${Date.now()}`).digest("hex");
  const baseRun = {
    runId: crypto.randomUUID(),
    clientId,
    discordUserId: profile?.discordUserId || "",
    discordHandle: profile?.discordHandle || "",
    discordAvatar: profile?.discordAvatar || "",
    walletAddress: profile?.walletAddress || "",
    walletScanId: scan?.id || null,
    mode,
    status: "active",
    seedHash,
    questionIds,
    currentIndex: 0,
    interviewLength: questionIds.length,
    dignityStart: dignity,
    dignityRemaining: dignity,
    squigCount,
    hasRevivePill,
    correctCount: 0,
    wrongCount: 0,
    charmStack: 0,
    charmFinal: 0,
    completionBonus: 0,
    ...startQuestionWindowForRun({ questionIds, currentIndex: 0 })
  };
  const run = await db.createRun(baseRun);
  const question = sanitizeQuestion(getCurrentQuestion(run), 1, run, config);
  sendJson(res, 200, { run: publicRun(run, question), scan: publicScan(scan) });
}

async function handleChoice(res, body) {
  const { clientId, runId, questionId, selectedOptionId } = body;
  const config = getGameConfig();
  if (!isValidClientId(clientId) || !runId) {
    sendJson(res, 400, { error: "Invalid run request" });
    return;
  }
  let run = await expireIfNeeded(await db.getRun(runId));
  if (!run || run.clientId !== clientId || run.status !== "active") {
    sendJson(res, 404, { error: "Active interview not found" });
    return;
  }
  const question = getCurrentQuestion(run);
  if (!question || question.id !== questionId) {
    sendJson(res, 409, { error: "That is not the current question." });
    return;
  }

  const timedOut = Boolean(run.questionExpiresAt && Date.now() > Date.parse(run.questionExpiresAt));
  const optionExists = question.options.some((option) => option.id === selectedOptionId);
  if (!timedOut && !optionExists) {
    sendJson(res, 400, { error: "Invalid answer option" });
    return;
  }

  const progressNumber = run.currentIndex + 1;
  const wasCorrect = !timedOut && selectedOptionId === question.correctOptionId;
  const rewardAdded = wasCorrect ? rewardForProgress(progressNumber, config) : 0;
  const dignityLost = wasCorrect ? 0 : 1;
  const charmStack = run.charmStack + rewardAdded;
  const dignityRemaining = Math.max(0, run.dignityRemaining - dignityLost);
  const correctCount = run.correctCount + (wasCorrect ? 1 : 0);
  const wrongCount = run.wrongCount + (wasCorrect ? 0 : 1);
  const nextIndex = run.currentIndex + 1;

  await db.insertRunEvent({
    runId: run.runId,
    questionIndex: progressNumber,
    questionId: question.id,
    tier: question.tier,
    selectedOptionId: timedOut ? null : selectedOptionId,
    correctOptionId: question.correctOptionId,
    wasCorrect,
    timedOut,
    rewardAdded,
    dignityLost,
    charmStackAfter: charmStack,
    dignityAfter: dignityRemaining
  });

  const feedback = {
    wasCorrect,
    timedOut,
    roast: timedOut ? "Too slow. That pause had pretty energy." : wasCorrect ? question.correctRoast : question.wrongRoast,
    explanation: question.explanation,
    correctOptionId: question.correctOptionId,
    correctAnswerText: question.options.find((option) => option.id === question.correctOptionId)?.text || "",
    rewardAdded,
    dignityLost
  };

  if (dignityRemaining <= 0) {
    const charmFinal = Math.floor(charmStack * config.outOfDignityMultiplier);
    const result = await finishRun(run, {
      status: "out_of_dignity",
      resultType: "Out Of Dignity",
      currentIndex: nextIndex,
      dignityRemaining,
      correctCount,
      wrongCount,
      charmStack,
      charmFinal,
      completionBonus: 0
    });
    sendJson(res, 200, {
      feedback,
      run: publicRun(result.run, null, { payout: result.payout }),
      final: true,
      endCopy: "Interview terminated. You were not ugly enough under pressure. You leave with half your $CHARM and none of your pride."
    });
    return;
  }

  if (nextIndex >= run.interviewLength) {
    const charmFinal = charmStack + config.fullClearBonus;
    const result = await finishRun(run, {
      status: "completed",
      resultType: "Full Clear",
      currentIndex: nextIndex,
      dignityRemaining,
      correctCount,
      wrongCount,
      charmStack,
      charmFinal,
      completionBonus: config.fullClearBonus
    });
    sendJson(res, 200, {
      feedback,
      run: publicRun(result.run, null, { payout: result.payout }),
      final: true,
      endCopy: "InSquignito hated every second of that. That means you passed. You are now officially too ugly to ignore."
    });
    return;
  }

  run = await db.updateRun(run.runId, {
    ...run,
    currentIndex: nextIndex,
    dignityRemaining,
    correctCount,
    wrongCount,
    charmStack,
    questionStartedAt: null,
    questionExpiresAt: null
  });
  const canCashOut = wasCorrect && CASHOUT_CHECKPOINTS.has(progressNumber);
  sendJson(res, 200, {
    feedback,
    run: publicRun(run),
    nextAction: canCashOut ? "cashout_or_continue" : "continue",
    cashoutAvailable: canCashOut
  });
}

async function handleAdvance(res, body) {
  const { clientId, runId, action } = body;
  const config = getGameConfig();
  if (!isValidClientId(clientId) || !runId) {
    sendJson(res, 400, { error: "Invalid run request" });
    return;
  }
  let run = await expireIfNeeded(await db.getRun(runId));
  if (!run || run.clientId !== clientId || run.status !== "active") {
    sendJson(res, 404, { error: "Active interview not found" });
    return;
  }

  if (action === "cashout") {
    const result = await finishRun(run, {
      status: "cashed_out",
      resultType: "Cashed Out",
      charmFinal: run.charmStack
    });
    sendJson(res, 200, {
      run: publicRun(result.run, null, { payout: result.payout }),
      final: true,
      endCopy: "You left with your ugly little bag before InSquignito could spill soup on it."
    });
    return;
  }

  if (action === "abandon") {
    const result = await finishRun(run, {
      status: "abandoned",
      resultType: "Abandoned",
      charmFinal: 0
    });
    sendJson(res, 200, { run: publicRun(result.run), final: true });
    return;
  }

  const question = getCurrentQuestion(run);
  if (!question) {
    sendJson(res, 409, { error: "No next question available" });
    return;
  }
  const window = startQuestionWindowForRun(run);
  run = await db.updateRun(run.runId, { ...run, ...window });
  sendJson(res, 200, {
    run: publicRun(run, sanitizeQuestion(question, run.currentIndex + 1, run, config))
  });
}

async function handleApi(req, res, requestUrl) {
  if (requestUrl.pathname === "/health") {
    await handleHealth(res);
    return true;
  }

  if (requestUrl.pathname === "/api/config" && req.method === "GET") {
    const config = getGameConfig();
    sendJson(res, 200, {
      appName: "InSquignito's Ugly Interview",
      rewardCooldownHours: config.rewardCooldownHours,
      scanCacheMinutes: getCacheMinutes(),
      allowZeroSquigReward: config.allowZeroSquigReward,
      discordInviteUrl: process.env.DISCORD_INVITE_URL || "https://squigs.io/discord",
      dripProfileUrl: process.env.DRIP_PROFILE_URL || "",
      dripClaimHelpUrl: process.env.DRIP_CLAIM_HELP_URL || "",
      timersEnabled: config.timersEnabled,
      interviewLength: config.interviewLength,
      appVersion: APP_VERSION,
      buildId: BUILD_ID
    });
    return true;
  }

  if (requestUrl.pathname === "/api/translate" && req.method === "POST") {
    const body = await parseRequestBody(req);
    const language = SUPPORTED_TRANSLATION_LANGUAGES.has(body.language) ? body.language : "en";
    const texts = Array.isArray(body.texts) ? body.texts.slice(0, 80).map((text) => String(text || "").slice(0, 1000)) : [];
    if (language === "en") {
      sendJson(res, 200, { language, translations: texts });
      return true;
    }
    const translations = await Promise.all(texts.map((text) => translateOneText(text, language)));
    sendJson(res, 200, { language, translations });
    return true;
  }

  if (requestUrl.pathname === "/api/auth/discord/start" && req.method === "GET") {
    return startDiscordAuth(req, res, requestUrl);
  }

  if (requestUrl.pathname === "/api/auth/discord/callback" && req.method === "GET") {
    return handleDiscordCallback(req, res, requestUrl);
  }

  if (requestUrl.pathname === "/api/profile" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    let profile = null;
    let scan = null;
    let cooldown = { available: false, nextAvailableAt: null };
    let apiWarning = "";
    try {
      profile = await db.getProfile(clientId);
      scan = profile?.walletAddress ? await db.getLatestWalletScan(profile.walletAddress) : null;
      cooldown = profile?.discordUserId && profile.walletAddress
        ? await db.getRewardCooldown(profile.discordUserId, profile.walletAddress, getGameConfig().rewardCooldownHours)
        : cooldown;
    } catch (error) {
      apiWarning = error?.message || "Profile storage unavailable";
      console.warn("Profile API degraded:", apiWarning);
    }
    sendJson(res, 200, {
      profile: publicProfile(profile || { clientId }),
      scan: publicScan(scan),
      cooldown,
      storage: db.isDbEnabled() ? "database" : "memory",
      warning: apiWarning
    });
    return true;
  }

  if (requestUrl.pathname === "/api/profile" && req.method === "POST") {
    const body = await parseRequestBody(req);
    if (!isValidClientId(body.clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    if (body.walletAddress && !isValidEthereumAddress(body.walletAddress)) {
      sendJson(res, 400, { error: "Invalid Ethereum wallet address" });
      return true;
    }
    const profile = await db.upsertProfile(body.clientId, {
      walletAddress: body.walletAddress ? normalizeWallet(body.walletAddress) : undefined,
      twitterHandle: normalizeText(body.twitterHandle || "", 120)
    });
    sendJson(res, 200, { saved: true, profile: publicProfile(profile) });
    return true;
  }

  if (requestUrl.pathname === "/api/wallet/scan" && req.method === "POST") {
    const body = await parseRequestBody(req);
    if (!isValidClientId(body.clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    if (!isValidEthereumAddress(body.walletAddress)) {
      sendJson(res, 400, { error: "Invalid Ethereum wallet address" });
      return true;
    }
    const profile = await db.upsertProfile(body.clientId, { walletAddress: normalizeWallet(body.walletAddress) });
    const scan = await scanWallet({
      walletAddress: body.walletAddress,
      forceRefresh: Boolean(body.forceRefresh),
      clientId: body.clientId
    });
    const savedScan = scan.cached
      ? { ...scan, id: (await db.getLatestWalletScan(scan.walletAddress))?.id || null }
      : await db.saveWalletScan(body.clientId, profile.discordUserId, scan);
    sendJson(res, 200, { scan: publicScan({ ...savedScan, cached: scan.cached }), profile: publicProfile(profile) });
    return true;
  }

  if (requestUrl.pathname === "/api/run/start" && req.method === "POST") {
    await handleStartRun(res, await parseRequestBody(req));
    return true;
  }

  if (requestUrl.pathname === "/api/run/active" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    const run = await expireIfNeeded(await db.getActiveRun(clientId));
    if (!run || run.status !== "active") {
      sendJson(res, 200, { run: null });
      return true;
    }
    const question = getCurrentQuestion(run);
    sendJson(res, 200, {
      run: publicRun(run, question ? sanitizeQuestion(question, run.currentIndex + 1, run, getGameConfig()) : null)
    });
    return true;
  }

  if (requestUrl.pathname === "/api/run/choice" && req.method === "POST") {
    await handleChoice(res, await parseRequestBody(req));
    return true;
  }

  if (requestUrl.pathname === "/api/run/advance" && req.method === "POST") {
    await handleAdvance(res, await parseRequestBody(req));
    return true;
  }

  if (requestUrl.pathname === "/api/payouts" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    try {
      sendJson(res, 200, { payouts: await db.getPayouts(clientId) });
    } catch (error) {
      sendJson(res, 200, { payouts: [], warning: error?.message || "Claims unavailable" });
    }
    return true;
  }

  if (requestUrl.pathname === "/api/leaderboard" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    const period = ["weekly", "monthly", "all-time"].includes(requestUrl.searchParams.get("period"))
      ? requestUrl.searchParams.get("period")
      : "all-time";
    try {
      sendJson(res, 200, await db.getLeaderboard(period, requestUrl.searchParams.get("limit") || 100, isValidClientId(clientId) ? clientId : null));
    } catch (error) {
      sendJson(res, 200, {
        entries: [],
        currentPlayer: null,
        period,
        warning: error?.message || "Leaderboard unavailable"
      });
    }
    return true;
  }

  if (requestUrl.pathname === "/api/admin/payouts" && req.method === "GET") {
    if (!process.env.ADMIN_SECRET || req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }
    sendJson(res, 200, { payouts: await db.getAdminPayouts(requestUrl.searchParams.get("status") || "pending") });
    return true;
  }

  const adminStatusMatch = requestUrl.pathname.match(/^\/api\/admin\/payouts\/([^/]+)\/status$/);
  if (adminStatusMatch && req.method === "POST") {
    if (!process.env.ADMIN_SECRET || req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
      sendJson(res, 401, { error: "Unauthorized" });
      return true;
    }
    const body = await parseRequestBody(req);
    const allowed = new Set(["pending", "approved", "paid", "rejected", "void"]);
    if (!allowed.has(body.status)) {
      sendJson(res, 400, { error: "Invalid payout status" });
      return true;
    }
    const payout = await db.updatePayoutStatus(adminStatusMatch[1], body.status, body.adminNote || "");
    sendJson(res, payout ? 200 : 404, payout ? { payout } : { error: "Payout not found" });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      send(res, 400, "Bad Request");
      return;
    }

    const requestUrl = new URL(req.url, "http://localhost");
    if (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname === "/health") {
      const handled = await handleApi(req, res, requestUrl);
      if (handled) return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method Not Allowed");
      return;
    }

    const relativePath = safePathname(requestUrl.toString());
    let filePath = path.join(PUBLIC_DIR, relativePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      send(res, 403, "Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, "index.html");
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        send(res, 500, "Internal Server Error");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const cacheControl = [".html", ".js", ".css"].includes(ext)
        ? "no-cache, no-store, must-revalidate"
        : "public, max-age=3600";
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": cacheControl
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      res.end(data);
    });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      error: error?.message || "Internal Server Error",
      requestId: crypto.randomUUID()
    });
  }
});

server.requestTimeout = 15000;
server.headersTimeout = 16000;

server.listen(PORT, HOST, () => {
  console.log(`InSquignito's Ugly Interview listening on http://${HOST}:${PORT}`);
});
