const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const CLIENT_ID_RE = /^[a-zA-Z0-9_-]{10,120}$/;

function isValidClientId(value) {
  return typeof value === "string" && CLIENT_ID_RE.test(value);
}

function isValidEthereumAddress(value) {
  return typeof value === "string" && ETH_ADDRESS_RE.test(value.trim());
}

function normalizeWallet(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength);
}

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function toNumber(value, defaultValue, { min = -Infinity, max = Infinity } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.min(max, Math.max(min, parsed));
}

module.exports = {
  ETH_ADDRESS_RE,
  isValidClientId,
  isValidEthereumAddress,
  normalizeText,
  normalizeWallet,
  toBoolean,
  toNumber
};
