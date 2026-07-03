const { calculateDignity } = require("./game-engine");
const { isValidEthereumAddress, normalizeWallet, toNumber } = require("./validators");

const scanCache = new Map();
const forceRefreshLimit = new Map();

function getCacheMinutes() {
  return toNumber(process.env.WALLET_SCAN_CACHE_MINUTES, 15, { min: 1, max: 30 });
}

function isAlchemyConfigured() {
  return Boolean(process.env.ALCHEMY_API_KEY && process.env.SQUIGS_CONTRACT_ADDRESS);
}

function normalizeString(value) {
  return String(value || "").toLowerCase();
}

function getTokenId(nft) {
  return String(
    nft?.tokenId ||
    nft?.token_id ||
    nft?.id?.tokenId ||
    nft?.contract?.tokenId ||
    nft?.raw?.metadata?.tokenId ||
    ""
  );
}

function collectAttributes(nft) {
  const locations = [
    nft?.raw?.metadata?.attributes,
    nft?.metadata?.attributes,
    nft?.rawMetadata?.attributes,
    nft?.raw?.rawMetadata?.attributes
  ];
  return locations.flatMap((attrs) => Array.isArray(attrs) ? attrs : []);
}

function extractTraitSummary(nfts) {
  const summary = {};
  for (const nft of nfts) {
    for (const attr of collectAttributes(nft)) {
      const key = String(attr?.trait_type || attr?.traitType || attr?.type || "Unknown").trim() || "Unknown";
      const value = String(attr?.value || "").trim() || "Unknown";
      summary[key] ||= {};
      summary[key][value] = (summary[key][value] || 0) + 1;
    }
  }
  return summary;
}

function hasRevivePillTrait(nft) {
  const searchable = [
    nft?.name,
    nft?.description,
    nft?.title,
    nft?.raw?.metadata?.name,
    nft?.raw?.metadata?.description,
    nft?.metadata?.name,
    nft?.metadata?.description,
    nft?.rawMetadata?.name,
    nft?.rawMetadata?.description
  ];

  for (const attr of collectAttributes(nft)) {
    searchable.push(attr?.trait_type, attr?.traitType, attr?.type, attr?.value);
  }

  return searchable.some((value) => normalizeString(value).includes("revive pill"));
}

function makeScanSummary(walletAddress, nfts, fetchedAt = new Date()) {
  const tokenIds = nfts.map(getTokenId).filter(Boolean);
  const revivePillTokenIds = nfts.filter(hasRevivePillTrait).map(getTokenId).filter(Boolean);
  const squigCount = tokenIds.length;
  const revivePillCount = revivePillTokenIds.length;
  const hasRevivePill = revivePillCount > 0;
  return {
    walletAddress: normalizeWallet(walletAddress),
    squigCount,
    tokenIds,
    traitSummary: extractTraitSummary(nfts),
    revivePillCount,
    hasRevivePill,
    revivePillTokenIds,
    dignityGranted: calculateDignity(squigCount, hasRevivePill),
    rawCount: nfts.length,
    fetchedAt: fetchedAt.toISOString(),
    source: "alchemy"
  };
}

async function fetchAlchemyNfts(walletAddress) {
  if (!isAlchemyConfigured()) {
    throw new Error("Alchemy wallet scanning is not configured");
  }

  const endpoint = `https://eth-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner`;
  let pageKey = null;
  let pageCount = 0;
  const ownedNfts = [];

  do {
    const url = new URL(endpoint);
    url.searchParams.set("owner", walletAddress);
    url.searchParams.append("contractAddresses[]", process.env.SQUIGS_CONTRACT_ADDRESS);
    url.searchParams.set("withMetadata", "true");
    if (pageKey) url.searchParams.set("pageKey", pageKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Alchemy scan timed out");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Alchemy scan failed (${response.status}) ${detail.slice(0, 180)}`);
    }

    const data = await response.json();
    ownedNfts.push(...(Array.isArray(data.ownedNfts) ? data.ownedNfts : []));
    pageKey = data.pageKey || null;
    pageCount += 1;
  } while (pageKey && pageCount < 20);

  return ownedNfts;
}

function getCachedScan(walletAddress) {
  const cached = scanCache.get(normalizeWallet(walletAddress));
  if (!cached) return null;
  const maxAgeMs = getCacheMinutes() * 60 * 1000;
  if (Date.now() - Date.parse(cached.fetchedAt) > maxAgeMs) return null;
  return cached;
}

function canForceRefresh(walletAddress, clientId) {
  const key = `${normalizeWallet(walletAddress)}:${clientId || "anon"}`;
  const last = forceRefreshLimit.get(key) || 0;
  const elapsedMs = Date.now() - last;
  if (elapsedMs < 60_000) {
    return { allowed: false, retryAfterSeconds: Math.ceil((60_000 - elapsedMs) / 1000) };
  }
  forceRefreshLimit.set(key, Date.now());
  return { allowed: true, retryAfterSeconds: 0 };
}

async function scanWallet({ walletAddress, forceRefresh = false, clientId }) {
  if (!isValidEthereumAddress(walletAddress)) {
    const error = new Error("Invalid Ethereum wallet address");
    error.statusCode = 400;
    throw error;
  }

  const normalizedWallet = normalizeWallet(walletAddress);
  if (forceRefresh) {
    const limit = canForceRefresh(normalizedWallet, clientId);
    if (!limit.allowed) {
      const error = new Error(`Refresh is cooling down. Try again in ${limit.retryAfterSeconds}s.`);
      error.statusCode = 429;
      throw error;
    }
  } else {
    const cached = getCachedScan(normalizedWallet);
    if (cached) return { ...cached, cached: true };
  }

  const nfts = await fetchAlchemyNfts(normalizedWallet);
  const summary = makeScanSummary(normalizedWallet, nfts);
  scanCache.set(normalizedWallet, summary);
  return { ...summary, cached: false };
}

module.exports = {
  getCachedScan,
  getCacheMinutes,
  isAlchemyConfigured,
  makeScanSummary,
  scanWallet
};
