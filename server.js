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
const X_CLIENT_ID = process.env.X_CLIENT_ID || "";
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || "";
const X_REDIRECT_URI = process.env.X_REDIRECT_URI || "";
const X_OAUTH_COOKIE = "gauntlet_x_oauth";

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

function redirect(res, location, cookies = []) {
  const headers = {
    Location: location,
    "Cache-Control": "no-cache"
  };
  if (cookies.length) {
    headers["Set-Cookie"] = cookies;
  }
  res.writeHead(302, headers);
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

function isXAuthEnabled() {
  return Boolean(pool && X_CLIENT_ID && X_REDIRECT_URI);
}

function getXAuthIssues() {
  const issues = [];
  if (!DATABASE_URL) issues.push("DATABASE_URL_LEADERBOARD is missing");
  if (!X_CLIENT_ID) issues.push("X_CLIENT_ID is missing");
  if (!X_REDIRECT_URI) issues.push("X_REDIRECT_URI is missing");
  return issues;
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sha256Base64Url(input) {
  return crypto
    .createHash("sha256")
    .update(input)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || "/"}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        const key = index === -1 ? part : part.slice(0, index);
        const value = index === -1 ? "" : part.slice(index + 1);
        return [key, decodeURIComponent(value)];
      })
  );
}

function displayNameFromProfile(profile) {
  const discordHandle = normalizeText(profile.discordHandle, 120);
  const twitterHandle = normalizeText(profile.twitterHandle, 120);
  return discordHandle || twitterHandle || null;
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
  if (!pool) return null;
  await ensureDbReady();
  const result = await pool.query(
    `
    SELECT client_id, wallet_address, discord_handle, twitter_handle, updated_at
    FROM gauntlet_online_profiles
    WHERE client_id = $1
    LIMIT 1
    `,
    [clientId]
  );
  return result.rows[0] || null;
}

async function upsertProfile(clientId, payload) {
  if (!pool) return null;
  await ensureDbReady();
  const walletAddress = normalizeText(payload.walletAddress, 200);
  const discordHandle = normalizeText(payload.discordHandle, 120);
  const twitterHandle = normalizeText(payload.twitterHandle, 120);
  const result = await pool.query(
    `
    INSERT INTO gauntlet_online_profiles (
      client_id,
      wallet_address,
      discord_handle,
      twitter_handle,
      updated_at
    )
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
      twitter_handle = EXCLUDED.twitter_handle,
      updated_at = now()
    RETURNING client_id, wallet_address, discord_handle, twitter_handle, updated_at
    `,
    [clientId, walletAddress || null, discordHandle || null, twitterHandle || null]
  );

  await pool.query(
    `
    INSERT INTO gauntlet_online_leaderboard (
      client_id,
      wallet_address,
      discord_handle,
      twitter_handle,
      updated_at
    )
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
      twitter_handle = EXCLUDED.twitter_handle,
      updated_at = now()
    `,
    [clientId, walletAddress || null, discordHandle || null, twitterHandle || null]
  );

  return result.rows[0] || null;
}

async function updateTwitterHandle(clientId, twitterHandle) {
  const current = (await getProfile(clientId)) || {
    wallet_address: "",
    discord_handle: ""
  };
  return upsertProfile(clientId, {
    walletAddress: current.wallet_address || "",
    discordHandle: current.discord_handle || "",
    twitterHandle
  });
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
      1,
      $5,
      $5,
      $6,
      now()
    )
    ON CONFLICT (client_id)
    DO UPDATE SET
      wallet_address = EXCLUDED.wallet_address,
      discord_handle = EXCLUDED.discord_handle,
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
      profile?.twitter_handle || null,
      points,
      didWin
    ]
  );

  return { saved: true, displayName };
}

async function getLeaderboard(limit = 100, clientId = null) {
  if (!pool) return { entries: [], currentPlayer: null };
  await ensureDbReady();
  const cappedLimit = Math.max(1, Math.min(100, Number(limit) || 100));
  const result = await pool.query(
    `
    WITH ranked AS (
      SELECT
        client_id,
        discord_handle,
        twitter_handle,
        wallet_address,
        user_runs_total,
        total_points_earned,
        best_points_ever,
        wins,
        COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, ''), wallet_address, client_id) AS display_name,
        ROW_NUMBER() OVER (
          ORDER BY total_points_earned DESC, best_points_ever DESC, wins DESC, updated_at ASC, client_id ASC
        ) AS placement
      FROM gauntlet_online_leaderboard
      WHERE COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, '')) IS NOT NULL
    )
    SELECT
      client_id,
      discord_handle,
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
          twitter_handle,
          wallet_address,
          user_runs_total,
          total_points_earned,
          best_points_ever,
          wins,
          COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, ''), wallet_address, client_id) AS display_name,
          ROW_NUMBER() OVER (
            ORDER BY total_points_earned DESC, best_points_ever DESC, wins DESC, updated_at ASC, client_id ASC
          ) AS placement
        FROM gauntlet_online_leaderboard
        WHERE COALESCE(NULLIF(discord_handle, ''), NULLIF(twitter_handle, '')) IS NOT NULL
      )
      SELECT
        client_id,
        discord_handle,
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

  return { entries: result.rows, currentPlayer };
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

  if (requestUrl.pathname === "/api/profile" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    if (!pool) {
      sendJson(res, 200, {
        profile: {
          clientId,
          walletAddress: "",
          discordHandle: "",
          twitterHandle: ""
        },
        storage: "local-only"
      });
      return true;
    }

    const profile = await getProfile(clientId);
    sendJson(res, 200, {
      profile: {
        clientId,
        walletAddress: profile?.wallet_address || "",
        discordHandle: profile?.discord_handle || "",
        twitterHandle: profile?.twitter_handle || ""
      },
      storage: "database"
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

    if (!pool) {
      sendJson(res, 200, { saved: false, storage: "local-only" });
      return true;
    }

    const profile = await upsertProfile(clientId, body);
    sendJson(res, 200, {
      saved: true,
      storage: "database",
      profile: {
        clientId,
        walletAddress: profile?.wallet_address || "",
        discordHandle: profile?.discord_handle || "",
        twitterHandle: profile?.twitter_handle || ""
      }
    });
    return true;
  }

  if (requestUrl.pathname === "/api/run" && req.method === "POST") {
    const body = await parseRequestBody(req);
    const clientId = body.clientId;
    if (!isValidClientId(clientId)) {
      sendJson(res, 400, { error: "Invalid clientId" });
      return true;
    }
    if (!pool) {
      sendJson(res, 200, { saved: false, storage: "local-only" });
      return true;
    }
    const result = await insertRun(clientId, body);
    sendJson(res, 200, result);
    return true;
  }

  if (requestUrl.pathname === "/api/leaderboard" && req.method === "GET") {
    const clientId = requestUrl.searchParams.get("clientId");
    const leaderboard = await getLeaderboard(
      Number(requestUrl.searchParams.get("limit") || 100),
      isValidClientId(clientId) ? clientId : null
    );
    sendJson(res, 200, {
      entries: leaderboard.entries,
      currentPlayer: leaderboard.currentPlayer,
      storage: pool ? "database" : "local-only"
    });
    return true;
  }

  if (requestUrl.pathname === "/api/auth/x/status" && req.method === "GET") {
    sendJson(res, 200, {
      enabled: isXAuthEnabled(),
      issues: getXAuthIssues()
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

    if (requestUrl.pathname === "/auth/x/start" && req.method === "GET") {
      if (!isXAuthEnabled()) {
        redirect(res, "/?x_auth=disabled");
        return;
      }

      const clientId = requestUrl.searchParams.get("clientId");
      if (!isValidClientId(clientId)) {
        redirect(res, "/?x_auth=error");
        return;
      }

      const state = base64Url(crypto.randomBytes(24));
      const codeVerifier = base64Url(crypto.randomBytes(48));
      const codeChallenge = sha256Base64Url(codeVerifier);
      const cookiePayload = JSON.stringify({
        state,
        codeVerifier,
        clientId
      });
      const authorizeUrl = new URL("https://x.com/i/oauth2/authorize");
      authorizeUrl.searchParams.set("response_type", "code");
      authorizeUrl.searchParams.set("client_id", X_CLIENT_ID);
      authorizeUrl.searchParams.set("redirect_uri", X_REDIRECT_URI);
      authorizeUrl.searchParams.set("scope", "users.read");
      authorizeUrl.searchParams.set("state", state);
      authorizeUrl.searchParams.set("code_challenge", codeChallenge);
      authorizeUrl.searchParams.set("code_challenge_method", "S256");

      redirect(res, authorizeUrl.toString(), [
        serializeCookie(X_OAUTH_COOKIE, cookiePayload, {
          httpOnly: true,
          secure: requestUrl.protocol === "https:",
          sameSite: "Lax",
          maxAge: 600,
          path: "/"
        })
      ]);
      return;
    }

    if (requestUrl.pathname === "/auth/x/callback" && req.method === "GET") {
      const cookies = parseCookies(req);
      const rawCookie = cookies[X_OAUTH_COOKIE];
      const code = requestUrl.searchParams.get("code");
      const returnedState = requestUrl.searchParams.get("state");

      if (!rawCookie || !code || !returnedState) {
        redirect(res, "/?x_auth=error", [
          serializeCookie(X_OAUTH_COOKIE, "", {
            httpOnly: true,
            secure: requestUrl.protocol === "https:",
            sameSite: "Lax",
            maxAge: 0,
            path: "/"
          })
        ]);
        return;
      }

      let oauthState = null;
      try {
        oauthState = JSON.parse(rawCookie);
      } catch {
        oauthState = null;
      }

      if (!oauthState || oauthState.state !== returnedState || !isValidClientId(oauthState.clientId)) {
        redirect(res, "/?x_auth=error", [
          serializeCookie(X_OAUTH_COOKIE, "", {
            httpOnly: true,
            secure: requestUrl.protocol === "https:",
            sameSite: "Lax",
            maxAge: 0,
            path: "/"
          })
        ]);
        return;
      }

      try {
        const tokenBody = new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: X_REDIRECT_URI,
          code_verifier: oauthState.codeVerifier
        });

        if (!X_CLIENT_SECRET) {
          tokenBody.set("client_id", X_CLIENT_ID);
        }

        const tokenHeaders = {
          "Content-Type": "application/x-www-form-urlencoded"
        };

        if (X_CLIENT_SECRET) {
          tokenHeaders.Authorization = `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString("base64")}`;
        }

        const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
          method: "POST",
          headers: tokenHeaders,
          body: tokenBody.toString()
        });
        const tokenJson = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenJson.access_token) {
          throw new Error("X token exchange failed");
        }

        const meResponse = await fetch("https://api.x.com/2/users/me?user.fields=username,name", {
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`
          }
        });
        const meJson = await meResponse.json();
        const username = meJson?.data?.username ? `@${meJson.data.username}` : "";

        if (!meResponse.ok || !username) {
          throw new Error("X user lookup failed");
        }

        await updateTwitterHandle(oauthState.clientId, username);

        redirect(res, "/?x_auth=success", [
          serializeCookie(X_OAUTH_COOKIE, "", {
            httpOnly: true,
            secure: requestUrl.protocol === "https:",
            sameSite: "Lax",
            maxAge: 0,
            path: "/"
          })
        ]);
        return;
      } catch {
        redirect(res, "/?x_auth=error", [
          serializeCookie(X_OAUTH_COOKIE, "", {
            httpOnly: true,
            secure: requestUrl.protocol === "https:",
            sameSite: "Lax",
            maxAge: 0,
            path: "/"
          })
        ]);
        return;
      }
    }

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
