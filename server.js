const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let Pool = null;
try {
  ({ Pool } = require("pg"));
} catch {
  Pool = null;
}

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATABASE_URL = process.env.DATABASE_URL_LEADERBOARD || "";

const RUN_CONFIG = {
  lives: 2,
  completionBonus: 1000,
  maxActiveAgeMs: 1000 * 60 * 60 * 4,
  rounds: [
    { roundIndex: 1, reward: 15, choices: ["Red Circle", "Blue Triangle"], safeSurvivalChance: 0.98, mistakeSurvivalChance: 0.45 },
    { roundIndex: 2, reward: 35, choices: ["Gold Square", "Purple Diamond"], safeSurvivalChance: 0.94, mistakeSurvivalChance: 0.34 },
    { roundIndex: 3, reward: 65, choices: ["Red Circle", "Gold Square"], safeSurvivalChance: 0.89, mistakeSurvivalChance: 0.25 },
    { roundIndex: 4, reward: 110, choices: ["Blue Triangle", "Purple Diamond"], safeSurvivalChance: 0.83, mistakeSurvivalChance: 0.18 },
    { roundIndex: 5, reward: 175, choices: ["Red Circle", "Purple Diamond"], safeSurvivalChance: 0.76, mistakeSurvivalChance: 0.13 },
    { roundIndex: 6, reward: 260, choices: ["Blue Triangle", "Gold Square"], safeSurvivalChance: 0.69, mistakeSurvivalChance: 0.09 },
    { roundIndex: 7, reward: 380, choices: ["Red Circle", "Blue Triangle", "Gold Square"], safeSurvivalChance: 0.62, mistakeSurvivalChance: 0.07 },
    { roundIndex: 8, reward: 540, choices: ["Red Circle", "Gold Square", "Purple Diamond"], safeSurvivalChance: 0.55, mistakeSurvivalChance: 0.05 },
    { roundIndex: 9, reward: 760, choices: ["Blue Triangle", "Gold Square", "Purple Diamond"], safeSurvivalChance: 0.48, mistakeSurvivalChance: 0.04 },
    { roundIndex: 10, reward: 1100, choices: ["Red Circle", "Blue Triangle", "Gold Square", "Purple Diamond"], safeSurvivalChance: 0.41, mistakeSurvivalChance: 0.02 }
  ]
};

const activeRuns = new Map();
const activeOauthStates = new Map();
const localProfiles = new Map();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "";

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
  ".webp": "image/webp",
  ".mp3": "audio/mpeg"
};

const pool = DATABASE_URL && Pool
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false }
    })
  : null;

let dbReadyPromise = null;

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache"
  });
  res.end(body);
}

function sendJson(res, statusCode, value) {
  send(res, statusCode, JSON.stringify(value), "application/json; charset=utf-8");
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
    "Cache-Control": "no-cache"
  });
  res.end();
}

function safePathname(url) {
  const pathname = new URL(url, "http://localhost").pathname;
  const normalized = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  return normalized === path.sep ? "index.html" : normalized.replace(/^[/\\]+/, "") || "index.html";
}

function isValidClientId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{10,120}$/.test(value);
}

function normalizeText(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength);
}

function hashInt(...parts) {
  const hash = crypto.createHash("sha256").update(parts.join(":")).digest();
  return hash.readUInt32BE(0);
}

function hashFloat(...parts) {
  return hashInt(...parts) / 0xffffffff;
}

function getRoundConfig(roundIndex) {
  return RUN_CONFIG.rounds.find((round) => round.roundIndex === roundIndex);
}

function safeChoiceForRound(run, round) {
  return round.choices[hashInt(run.seed, round.roundIndex, "safe-choice") % round.choices.length];
}

function roomTellForRound(run) {
  const round = getRoundConfig(run.roundIndex);
  if (!round || run.phase === "finished") return "";
  const safeChoice = safeChoiceForRound(run, round);
  const tells = {
    1: `The ${safeChoice} door light blinks once before the others wake up.`,
    2: `The ${safeChoice} platform casts the only steady reflection.`,
    3: `The floor scratches bend away from ${safeChoice}.`,
    4: `A clean spotlight holds on ${safeChoice} while the other mark flickers.`,
    5: `InSquignito's shadow points toward ${safeChoice}.`,
    6: `The hum under ${safeChoice} stays low and even.`,
    7: `The warning lamps skip over ${safeChoice}.`,
    8: `${safeChoice} is the only mark without a cracked tile in front of it.`,
    9: `Fresh dust stops at the edge of ${safeChoice}.`,
    10: `The arena goes silent when ${safeChoice} glows.`
  };
  return tells[round.roundIndex] || "";
}

function cleanupActiveRuns() {
  const cutoff = Date.now() - RUN_CONFIG.maxActiveAgeMs;
  for (const [runId, run] of activeRuns.entries()) {
    if (run.createdAt < cutoff || (run.finishedAt && run.finishedAt < cutoff)) {
      activeRuns.delete(runId);
    }
  }

  for (const [state, entry] of activeOauthStates.entries()) {
    if (entry.createdAt < cutoff) {
      activeOauthStates.delete(state);
    }
  }
}

function createRun(clientId) {
  cleanupActiveRuns();
  const run = {
    runId: crypto.randomUUID(),
    seed: crypto.randomBytes(24).toString("hex"),
    clientId,
    createdAt: Date.now(),
    finishedAt: 0,
    phase: "awaiting_choice",
    roundIndex: 1,
    livesRemaining: RUN_CONFIG.lives,
    stack: 0,
    roundsCleared: 0,
    revealedHints: {},
    final: null
  };
  activeRuns.set(run.runId, run);
  return run;
}

function publicRunState(run) {
  return {
    runId: run.runId,
    phase: run.phase,
    roundIndex: run.roundIndex,
    livesRemaining: run.livesRemaining,
    stack: run.stack,
    roundsCleared: run.roundsCleared,
    revealedHints: run.revealedHints,
    roomTell: roomTellForRound(run),
    final: run.final
  };
}

function getActiveRun(clientId, runId) {
  cleanupActiveRuns();
  const run = activeRuns.get(runId);
  if (!run || run.clientId !== clientId) return null;
  return run;
}

function displayNameFromProfile(profile) {
  const discordHandle = normalizeText(profile.discordHandle, 120);
  const twitterHandle = normalizeText(profile.twitterHandle, 120);
  return discordHandle || twitterHandle || null;
}

function getDiscordRedirectUri(req) {
  if (DISCORD_REDIRECT_URI) return DISCORD_REDIRECT_URI;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  const baseUrl = PUBLIC_BASE_URL || `${proto}://${host}`;
  return `${baseUrl.replace(/\/$/, "")}/api/auth/discord/callback`;
}

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "";
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;
}

function discordHandleFromUser(user) {
  if (!user) return "";
  if (user.discriminator && user.discriminator !== "0") {
    return `${user.username}#${user.discriminator}`;
  }
  return user.global_name || user.username || "";
}

function profileFromRow(row, clientId) {
  return {
    clientId,
    walletAddress: row?.wallet_address || "",
    discordHandle: row?.discord_handle || "",
    twitterHandle: row?.twitter_handle || "",
    discordUserId: row?.discord_user_id || "",
    discordAvatar: row?.discord_avatar || "",
    discordGlobalName: row?.discord_global_name || ""
  };
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

async function ensureDbReady() {
  if (!pool) return false;
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gauntlet_online_profiles (
          client_id TEXT PRIMARY KEY,
          wallet_address TEXT,
          discord_handle TEXT,
          discord_user_id TEXT,
          discord_avatar TEXT,
          discord_global_name TEXT,
          twitter_handle TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS wallet_address TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS discord_handle TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS discord_avatar TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS discord_global_name TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_profiles
        ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gauntlet_online_runs (
          id BIGSERIAL PRIMARY KEY,
          client_id TEXT NOT NULL,
          display_name TEXT NOT NULL,
          points INTEGER NOT NULL DEFAULT 0,
          result_type TEXT NOT NULL,
          final_round INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS gauntlet_online_runs_display_name_idx
        ON gauntlet_online_runs (display_name);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gauntlet_online_leaderboard (
          client_id TEXT PRIMARY KEY,
          wallet_address TEXT,
          discord_handle TEXT,
          discord_user_id TEXT,
          discord_avatar TEXT,
          discord_global_name TEXT,
          twitter_handle TEXT,
          user_runs_total INTEGER NOT NULL DEFAULT 0,
          total_points_earned INTEGER NOT NULL DEFAULT 0,
          best_points_ever INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS wallet_address TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS discord_handle TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS discord_avatar TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS discord_global_name TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS user_runs_total INTEGER NOT NULL DEFAULT 0;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS total_points_earned INTEGER NOT NULL DEFAULT 0;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS best_points_ever INTEGER NOT NULL DEFAULT 0;
      `);
      await pool.query(`
        ALTER TABLE gauntlet_online_leaderboard
        ADD COLUMN IF NOT EXISTS wins INTEGER NOT NULL DEFAULT 0;
      `);
    })().catch((error) => {
      dbReadyPromise = null;
      throw error;
    });
  }
  await dbReadyPromise;
  return true;
}

async function getProfile(clientId) {
  if (!pool) return localProfiles.get(clientId) || null;
  await ensureDbReady();
  const result = await pool.query(
    `
    SELECT
      client_id,
      wallet_address,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      updated_at
    FROM gauntlet_online_profiles
    WHERE client_id = $1
    LIMIT 1
    `,
    [clientId]
  );
  return result.rows[0] || null;
}

async function upsertProfile(clientId, payload) {
  const walletAddress = normalizeText(payload.walletAddress, 200);
  const discordHandle = normalizeText(payload.discordHandle, 120);
  const discordUserId = normalizeText(payload.discordUserId, 120);
  const discordAvatar = normalizeText(payload.discordAvatar, 300);
  const discordGlobalName = normalizeText(payload.discordGlobalName, 120);
  const twitterHandle = normalizeText(payload.twitterHandle, 120);

  if (!pool) {
    const profile = {
      client_id: clientId,
      wallet_address: walletAddress || null,
      discord_handle: discordHandle || null,
      discord_user_id: discordUserId || null,
      discord_avatar: discordAvatar || null,
      discord_global_name: discordGlobalName || null,
      twitter_handle: twitterHandle || null,
      updated_at: new Date().toISOString()
    };
    localProfiles.set(clientId, profile);
    return profile;
  }

  await ensureDbReady();
  const result = await pool.query(
    `
    INSERT INTO gauntlet_online_profiles (
      client_id,
      wallet_address,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, now())
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
      discord_user_id = EXCLUDED.discord_user_id,
      discord_avatar = EXCLUDED.discord_avatar,
      discord_global_name = EXCLUDED.discord_global_name,
      twitter_handle = EXCLUDED.twitter_handle,
      updated_at = now()
    RETURNING
      client_id,
      wallet_address,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      updated_at
    `,
    [
      clientId,
      walletAddress || null,
      discordHandle || null,
      discordUserId || null,
      discordAvatar || null,
      discordGlobalName || null,
      twitterHandle || null
    ]
  );

  await pool.query(
    `
    INSERT INTO gauntlet_online_leaderboard (
      client_id,
      wallet_address,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, now())
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
      discord_user_id = EXCLUDED.discord_user_id,
      discord_avatar = EXCLUDED.discord_avatar,
      discord_global_name = EXCLUDED.discord_global_name,
      twitter_handle = EXCLUDED.twitter_handle,
      updated_at = now()
    `,
    [
      clientId,
      walletAddress || null,
      discordHandle || null,
      discordUserId || null,
      discordAvatar || null,
      discordGlobalName || null,
      twitterHandle || null
    ]
  );

  return result.rows[0] || null;
}

async function insertRun(clientId, payload) {
  if (!pool) return null;
  await ensureDbReady();
  const profile = await getProfile(clientId);
  const displayName = displayNameFromProfile({
    discordHandle: profile?.discord_handle,
    twitterHandle: profile?.twitter_handle
  });
  if (!displayName) return { saved: false, reason: "missing_identity" };

  const points = Math.max(0, Number(payload.points || 0) || 0);
  const finalRound = Math.max(0, Number(payload.finalRound || 0) || 0);
  const resultType = normalizeText(payload.resultType, 80) || "Unknown";
  const didWin = resultType === "Completion" ? 1 : 0;

  await pool.query(
    `
    INSERT INTO gauntlet_online_runs (
      client_id,
      display_name,
      points,
      result_type,
      final_round
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [clientId, displayName, points, resultType, finalRound]
  );

  await pool.query(
    `
    INSERT INTO gauntlet_online_leaderboard (
      client_id,
      wallet_address,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      user_runs_total,
      total_points_earned,
      best_points_ever,
      wins,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      1,
      $8,
      $8,
      $9,
      now()
    )
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
      discord_user_id = EXCLUDED.discord_user_id,
      discord_avatar = EXCLUDED.discord_avatar,
      discord_global_name = EXCLUDED.discord_global_name,
      twitter_handle = EXCLUDED.twitter_handle,
      user_runs_total = gauntlet_online_leaderboard.user_runs_total + 1,
      total_points_earned = gauntlet_online_leaderboard.total_points_earned + EXCLUDED.total_points_earned,
      best_points_ever = GREATEST(gauntlet_online_leaderboard.best_points_ever, EXCLUDED.best_points_ever),
      wins = gauntlet_online_leaderboard.wins + EXCLUDED.wins,
      updated_at = now()
    `,
    [
      clientId,
      profile?.wallet_address || null,
      profile?.discord_handle || null,
      profile?.discord_user_id || null,
      profile?.discord_avatar || null,
      profile?.discord_global_name || null,
      profile?.twitter_handle || null,
      points,
      didWin
    ]
  );

  return { saved: true, displayName };
}

async function finishActiveRun(run, resultType, points, finalRound) {
  run.phase = "finished";
  run.finishedAt = Date.now();
  run.final = {
    points,
    resultType,
    finalRound,
    leaderboardSave: await insertRun(run.clientId, {
      points,
      resultType,
      finalRound
    })
  };
  return run.final;
}

async function handleRunStart(req, res) {
  const body = await parseRequestBody(req);
  const clientId = body.clientId;
  if (!isValidClientId(clientId)) {
    sendJson(res, 400, { error: "Invalid clientId" });
    return true;
  }

  const run = createRun(clientId);
  sendJson(res, 200, {
    run: publicRunState(run),
    config: {
      lives: RUN_CONFIG.lives,
      completionBonus: RUN_CONFIG.completionBonus
    }
  });
  return true;
}

async function handleRunChoice(req, res) {
  const body = await parseRequestBody(req);
  const clientId = body.clientId;
  const runId = normalizeText(body.runId, 80);
  const choice = normalizeText(body.choice, 40);

  if (!isValidClientId(clientId)) {
    sendJson(res, 400, { error: "Invalid clientId" });
    return true;
  }

  const run = getActiveRun(clientId, runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return true;
  }

  if (run.phase !== "awaiting_choice") {
    sendJson(res, 409, { error: "Run is not awaiting a choice", run: publicRunState(run) });
    return true;
  }

  const round = getRoundConfig(run.roundIndex);
  if (!round || !round.choices.includes(choice)) {
    sendJson(res, 400, { error: "Invalid choice" });
    return true;
  }

  const safeChoice = safeChoiceForRound(run, round);
  const madeCorrectChoice = choice === safeChoice;
  const survivalChance = madeCorrectChoice ? round.safeSurvivalChance : round.mistakeSurvivalChance;
  const survived = hashFloat(run.seed, run.roundIndex, choice, "survival-roll") <= survivalChance;

  if (survived) {
    run.stack += round.reward;
    run.roundsCleared = round.roundIndex;

    if (round.roundIndex === RUN_CONFIG.rounds.length) {
      const final = await finishActiveRun(
        run,
        "Completion",
        run.stack + RUN_CONFIG.completionBonus,
        round.roundIndex
      );
      sendJson(res, 200, {
        survived: true,
        madeCorrectChoice,
        survivalChance,
        reward: round.reward,
        completionBonus: RUN_CONFIG.completionBonus,
        result: "completed",
        final,
        run: publicRunState(run)
      });
      return true;
    }

    run.phase = "post_round";
    sendJson(res, 200, {
      survived: true,
      madeCorrectChoice,
      survivalChance,
      reward: round.reward,
      result: "cleared",
      run: publicRunState(run)
    });
    return true;
  }

  run.livesRemaining -= 1;
  run.revealedHints[round.roundIndex] = `${safeChoice} was the best-read symbol in this room.`;

  if (run.livesRemaining <= 0) {
    const stackedBeforeHalving = run.stack;
    const finalPoints = Math.floor(stackedBeforeHalving / 2);
    const final = await finishActiveRun(run, "Out of Lives", finalPoints, run.roundsCleared || run.roundIndex);
    sendJson(res, 200, {
      survived: false,
      madeCorrectChoice,
      survivalChance,
      result: "finished",
      stackedBeforeHalving,
      final,
      deathHint: run.revealedHints[round.roundIndex],
      run: publicRunState(run)
    });
    return true;
  }

  run.roundIndex = 1;
  run.stack = 0;
  run.roundsCleared = 0;
  run.phase = "awaiting_choice";

  sendJson(res, 200, {
    survived: false,
    madeCorrectChoice,
    survivalChance,
    result: "retry",
    deathHint: run.revealedHints[round.roundIndex],
    run: publicRunState(run)
  });
  return true;
}

async function handleRunAdvance(req, res) {
  const body = await parseRequestBody(req);
  const clientId = body.clientId;
  const runId = normalizeText(body.runId, 80);
  const action = normalizeText(body.action, 40);

  if (!isValidClientId(clientId)) {
    sendJson(res, 400, { error: "Invalid clientId" });
    return true;
  }

  const run = getActiveRun(clientId, runId);
  if (!run) {
    sendJson(res, 404, { error: "Run not found" });
    return true;
  }

  if (run.phase !== "post_round") {
    sendJson(res, 409, { error: "Run is not between rounds", run: publicRunState(run) });
    return true;
  }

  if (action === "cashout") {
    const final = await finishActiveRun(run, "Go Home Scared", run.stack, run.roundsCleared);
    sendJson(res, 200, {
      result: "finished",
      final,
      run: publicRunState(run)
    });
    return true;
  }

  if (action === "continue") {
    run.roundIndex += 1;
    run.phase = "awaiting_choice";
    sendJson(res, 200, {
      result: "advanced",
      run: publicRunState(run)
    });
    return true;
  }

  sendJson(res, 400, { error: "Invalid action" });
  return true;
}

async function handleDiscordAuthStart(req, res, requestUrl) {
  const clientId = requestUrl.searchParams.get("clientId");
  if (!isValidClientId(clientId)) {
    sendJson(res, 400, { error: "Invalid clientId" });
    return true;
  }

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    sendJson(res, 503, {
      error: "Discord auth is not configured",
      requiredEnv: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_REDIRECT_URI"]
    });
    return true;
  }

  cleanupActiveRuns();
  const state = crypto.randomBytes(24).toString("hex");
  activeOauthStates.set(state, {
    clientId,
    createdAt: Date.now(),
    redirectUri: getDiscordRedirectUri(req)
  });

  const authUrl = new URL("https://discord.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", getDiscordRedirectUri(req));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "identify");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "consent");

  redirect(res, authUrl.toString());
  return true;
}

async function handleDiscordAuthCallback(req, res, requestUrl) {
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    redirect(res, `/?discord=error&reason=${encodeURIComponent(error)}`);
    return true;
  }

  const oauthState = activeOauthStates.get(state);
  activeOauthStates.delete(state);

  if (!code || !oauthState) {
    redirect(res, "/?discord=error&reason=invalid_state");
    return true;
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: oauthState.redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Discord token exchange failed: ${tokenResponse.status}`);
    }

    const token = await tokenResponse.json();
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Discord profile fetch failed: ${userResponse.status}`);
    }

    const user = await userResponse.json();
    const existingProfile = await getProfile(oauthState.clientId);
    await upsertProfile(oauthState.clientId, {
      walletAddress: existingProfile?.wallet_address || "",
      twitterHandle: existingProfile?.twitter_handle || "",
      discordHandle: discordHandleFromUser(user),
      discordUserId: user.id || "",
      discordAvatar: discordAvatarUrl(user),
      discordGlobalName: user.global_name || ""
    });

    redirect(res, "/?discord=connected");
    return true;
  } catch (error) {
    redirect(res, `/?discord=error&reason=${encodeURIComponent(error?.message || "oauth_failed")}`);
    return true;
  }
}

function normalizeLeaderboardPeriod(value) {
  return ["weekly", "monthly", "all-time"].includes(value) ? value : "monthly";
}

function periodWhereClause(period) {
  if (period === "weekly") return "WHERE created_at >= date_trunc('week', now())";
  if (period === "monthly") return "WHERE created_at >= date_trunc('month', now())";
  return "";
}

async function getLeaderboard(limit = 100, clientId = null, period = "monthly") {
  if (!pool) return { entries: [], currentPlayer: null };
  await ensureDbReady();
  const cappedLimit = Math.max(1, Math.min(100, Number(limit) || 100));
  const normalizedPeriod = normalizeLeaderboardPeriod(period);

  if (normalizedPeriod !== "all-time") {
    const periodWhere = periodWhereClause(normalizedPeriod);
    const rankedQuery = `
      WITH period_runs AS (
        SELECT *
        FROM gauntlet_online_runs
        ${periodWhere}
      ),
      grouped AS (
        SELECT
          r.client_id,
          MAX(p.discord_handle) AS discord_handle,
          MAX(p.discord_user_id) AS discord_user_id,
          MAX(p.discord_avatar) AS discord_avatar,
          MAX(p.discord_global_name) AS discord_global_name,
          MAX(p.twitter_handle) AS twitter_handle,
          MAX(p.wallet_address) AS wallet_address,
          COUNT(*)::integer AS user_runs_total,
          COALESCE(SUM(r.points), 0)::integer AS total_points_earned,
          COALESCE(MAX(r.points), 0)::integer AS best_points_ever,
          COALESCE(SUM(CASE WHEN r.result_type = 'Completion' THEN 1 ELSE 0 END), 0)::integer AS wins,
          MAX(r.created_at) AS updated_at
        FROM period_runs r
        LEFT JOIN gauntlet_online_profiles p ON p.client_id = r.client_id
        GROUP BY r.client_id
      ),
      ranked AS (
        SELECT
          *,
          COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, ''), wallet_address, client_id) AS display_name,
          ROW_NUMBER() OVER (
            ORDER BY best_points_ever DESC, wins DESC, total_points_earned DESC, updated_at ASC, client_id ASC
          ) AS placement
        FROM grouped
        WHERE COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, '')) IS NOT NULL
      )
      SELECT
        client_id,
        discord_handle,
        discord_user_id,
        discord_avatar,
        discord_global_name,
        twitter_handle,
        wallet_address,
        user_runs_total,
        total_points_earned,
        best_points_ever,
        wins,
        display_name,
        placement
      FROM ranked
    `;

    const result = await pool.query(
      `
      ${rankedQuery}
      WHERE placement <= $1
      ORDER BY placement ASC
      `,
      [cappedLimit]
    );

    let currentPlayer = null;
    if (clientId) {
      const currentResult = await pool.query(
        `
        ${rankedQuery}
        WHERE client_id = $1
        LIMIT 1
        `,
        [clientId]
      );
      currentPlayer = currentResult.rows[0] || null;
    }

    return { entries: result.rows, currentPlayer, period: normalizedPeriod };
  }

  const result = await pool.query(
    `
    WITH ranked AS (
      SELECT
        client_id,
        discord_handle,
        discord_user_id,
        discord_avatar,
        discord_global_name,
        twitter_handle,
        wallet_address,
        user_runs_total,
        total_points_earned,
        best_points_ever,
        wins,
        COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, ''), wallet_address, client_id) AS display_name,
        ROW_NUMBER() OVER (
          ORDER BY best_points_ever DESC, wins DESC, total_points_earned DESC, updated_at ASC, client_id ASC
        ) AS placement
      FROM gauntlet_online_leaderboard
      WHERE COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, '')) IS NOT NULL
    )
    SELECT
      client_id,
      discord_handle,
      discord_user_id,
      discord_avatar,
      discord_global_name,
      twitter_handle,
      wallet_address,
      user_runs_total,
      total_points_earned,
      best_points_ever,
      wins,
      display_name,
      placement
    FROM ranked
    WHERE placement <= $1
    ORDER BY placement ASC
    `,
    [cappedLimit]
  );

  let currentPlayer = null;
  if (clientId) {
    const currentResult = await pool.query(
      `
      WITH ranked AS (
        SELECT
          client_id,
          discord_handle,
          discord_user_id,
          discord_avatar,
          discord_global_name,
          twitter_handle,
          wallet_address,
          user_runs_total,
          total_points_earned,
          best_points_ever,
          wins,
          COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, ''), wallet_address, client_id) AS display_name,
          ROW_NUMBER() OVER (
            ORDER BY best_points_ever DESC, wins DESC, total_points_earned DESC, updated_at ASC, client_id ASC
          ) AS placement
        FROM gauntlet_online_leaderboard
        WHERE COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, '')) IS NOT NULL
      )
      SELECT
        client_id,
        discord_handle,
        discord_user_id,
        discord_avatar,
        discord_global_name,
        twitter_handle,
        wallet_address,
        user_runs_total,
        total_points_earned,
        best_points_ever,
        wins,
        display_name,
        placement
      FROM ranked
      WHERE client_id = $1
      LIMIT 1
      `,
      [clientId]
    );
    currentPlayer = currentResult.rows[0] || null;
  }

  return { entries: result.rows, currentPlayer, period: normalizedPeriod };
}

async function handleApi(req, res, requestUrl) {
  if (requestUrl.pathname === "/health") {
    const dbEnabled = Boolean(pool);
    let dbOk = false;
    if (dbEnabled) {
      try {
        await ensureDbReady();
        dbOk = true;
      } catch {
        dbOk = false;
      }
    }
    sendJson(res, 200, { ok: true, dbEnabled, dbOk });
    return true;
  }

  if (requestUrl.pathname === "/api/auth/discord/start" && req.method === "GET") {
    return handleDiscordAuthStart(req, res, requestUrl);
  }

  if (requestUrl.pathname === "/api/auth/discord/callback" && req.method === "GET") {
    return handleDiscordAuthCallback(req, res, requestUrl);
  }

  if (requestUrl.pathname === "/api/profile" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }

    const profile = await getProfile(clientId);
    sendJson(res, 200, {
      profile: profileFromRow(profile, clientId),
      storage: pool ? "database" : "local-only"
    });
    return true;
  }

  if (requestUrl.pathname === "/api/profile" && req.method === "POST") {
    const body = await parseRequestBody(req);
    const clientId = body.clientId;
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }

    const profile = await upsertProfile(clientId, body);
    sendJson(res, 200, {
      saved: true,
      storage: pool ? "database" : "local-only",
      profile: profileFromRow(profile, clientId)
    });
    return true;
  }

  if (requestUrl.pathname === "/api/run/start" && req.method === "POST") {
    return handleRunStart(req, res);
  }

  if (requestUrl.pathname === "/api/run/choice" && req.method === "POST") {
    return handleRunChoice(req, res);
  }

  if (requestUrl.pathname === "/api/run/advance" && req.method === "POST") {
    return handleRunAdvance(req, res);
  }

  if (requestUrl.pathname === "/api/run" && req.method === "POST") {
    sendJson(res, 410, {
      error: "Direct run submission is disabled. Start a run with /api/run/start."
    });
    return true;
  }

  if (requestUrl.pathname === "/api/leaderboard" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    const period = normalizeLeaderboardPeriod(requestUrl.searchParams.get("period") || "monthly");
    const leaderboard = await getLeaderboard(
      Number(requestUrl.searchParams.get("limit") || 100),
      isValidClientId(clientId) ? clientId : null,
      period
    );
    sendJson(res, 200, {
      entries: leaderboard.entries,
      currentPlayer: leaderboard.currentPlayer,
      period: leaderboard.period || period,
      storage: pool ? "database" : "local-only"
    });
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      send(res, 400, "Bad Request", "text/plain; charset=utf-8");
      return;
    }

    const requestUrl = new URL(req.url, "http://localhost");

    if (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname === "/health") {
      const handled = await handleApi(req, res, requestUrl);
      if (handled) return;
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method Not Allowed", "text/plain; charset=utf-8");
      return;
    }

    const relativePath = safePathname(requestUrl.toString());
    let filePath = path.join(PUBLIC_DIR, relativePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, "index.html");
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        send(res, 500, "Internal Server Error", "text/plain; charset=utf-8");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
      });

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      res.end(data);
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error?.message || "Internal Server Error",
      requestId: crypto.randomUUID()
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`The Gauntlet Online listening on http://${HOST}:${PORT}`);
});
