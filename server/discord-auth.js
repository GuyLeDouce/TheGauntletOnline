const crypto = require("crypto");
const { upsertProfile } = require("./db");
const { isValidClientId } = require("./validators");

const pendingStates = new Map();

function isDiscordConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_REDIRECT_URI);
}

function getPublicBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const host = req.headers.host || `localhost:${process.env.PORT || 3000}`;
  const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${proto}://${host}`;
}

function startDiscordAuth(req, res, requestUrl) {
  const clientId = requestUrl.searchParams.get("clientId");
  if (!isValidClientId(clientId)) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Invalid clientId");
    return true;
  }
  if (!isDiscordConfigured()) {
    res.writeHead(302, { Location: `/?discord=not_configured` });
    res.end();
    return true;
  }

  const state = crypto.randomBytes(18).toString("hex");
  pendingStates.set(state, { clientId, createdAt: Date.now() });
  const authUrl = new URL("https://discord.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", process.env.DISCORD_REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "identify");
  authUrl.searchParams.set("state", state);
  res.writeHead(302, { Location: authUrl.toString() });
  res.end();
  return true;
}

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams();
  body.set("client_id", process.env.DISCORD_CLIENT_ID);
  body.set("client_secret", process.env.DISCORD_CLIENT_SECRET);
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", process.env.DISCORD_REDIRECT_URI);

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error(`Discord token exchange failed (${response.status})`);
  return response.json();
}

async function fetchDiscordUser(accessToken) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Discord profile fetch failed (${response.status})`);
  return response.json();
}

async function handleDiscordCallback(req, res, requestUrl) {
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const pending = pendingStates.get(state);
  pendingStates.delete(state);

  const redirectBase = getPublicBaseUrl(req);
  if (!code || !pending || Date.now() - pending.createdAt > 10 * 60 * 1000) {
    res.writeHead(302, { Location: `${redirectBase}/?discord=failed` });
    res.end();
    return true;
  }

  try {
    const token = await exchangeCodeForToken(code);
    const user = await fetchDiscordUser(token.access_token);
    const handle = user.discriminator && user.discriminator !== "0"
      ? `${user.username}#${user.discriminator}`
      : user.username;
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : "";
    await upsertProfile(pending.clientId, {
      discordUserId: user.id,
      discordHandle: handle,
      discordAvatar: avatar,
      discordGlobalName: user.global_name || ""
    });
    res.writeHead(302, { Location: `${redirectBase}/?discord=connected` });
    res.end();
  } catch (error) {
    console.error("Discord OAuth failed:", error?.message || error);
    res.writeHead(302, { Location: `${redirectBase}/?discord=failed` });
    res.end();
  }
  return true;
}

module.exports = {
  handleDiscordCallback,
  isDiscordConfigured,
  startDiscordAuth
};
