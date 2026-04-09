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

  return { saved: true, displayName };
}

async function getLeaderboard(limit = 25) {
  if (!pool) return [];
  await ensureDbReady();
  const result = await pool.query(
    `
    SELECT
      display_name,
      SUM(points)::int AS total_points,
      MAX(points)::int AS best_run,
      COUNT(*)::int AS runs
    FROM gauntlet_online_runs
    GROUP BY display_name
    ORDER BY total_points DESC, best_run DESC, display_name ASC
    LIMIT $1
    `,
    [Math.max(1, Math.min(100, Number(limit) || 25))]
  );
  return result.rows;
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
    const entries = await getLeaderboard(Number(requestUrl.searchParams.get("limit") || 25));
    sendJson(res, 200, { entries, storage: pool ? "database" : "local-only" });
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
