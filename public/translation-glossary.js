(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.UglyTranslationGlossary = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const PROTECTED_TERMS = [
    "The Gauntlet Online",
    "Revive Pill Tokens",
    "Revive Pill Token",
    "Squigs Reloaded",
    "InSquignito",
    "Ugly Labs",
    "The Gauntlet",
    "Revive Pill",
    "Discord",
    "Squigs",
    "Squig",
    "$CHARM",
    "CHARM",
    "DRIP",
    "Alchemy",
    "Ethereum",
    "NFTs",
    "NFT",
    "OAuth",
    "Postgres",
    "Railway",
    "Imgur",
    "wallet",
    "Wallet"
  ];

  const TERM_LIST = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const PLACEHOLDER_PREFIX = "__UGLYTERM_";

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getProtectedTranslationTerms() {
    return [...TERM_LIST];
  }

  function isWordChar(value) {
    return /[A-Za-z0-9_]/.test(value || "");
  }

  function findTermMatches(text) {
    const matches = [];
    for (const term of TERM_LIST) {
      let index = 0;
      while (index < text.length) {
        const found = text.indexOf(term, index);
        if (found === -1) break;
        const before = text[found - 1] || "";
        const after = text[found + term.length] || "";
        const startsWord = isWordChar(term[0]);
        const endsWord = isWordChar(term[term.length - 1]);
        if ((!startsWord || !isWordChar(before)) && (!endsWord || !isWordChar(after))) {
          matches.push({ start: found, end: found + term.length, value: term });
        }
        index = found + term.length;
      }
    }
    return matches;
  }

  function dynamicProtectedMatches(text) {
    const patterns = [
      /https?:\/\/[^\s<>"']+/g,
      /\b0x[a-fA-F0-9]{40}\b/g,
      /\bUGLY-[A-Z0-9-]{4,}\b/g,
      /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
      /@[A-Za-z0-9_.-]{2,32}\b/g,
      /\b[A-Za-z0-9_.-]{2,32}#[0-9]{4}\b/g
    ];
    return patterns.flatMap((pattern) => {
      const matches = [];
      let match = pattern.exec(text);
      while (match) {
        matches.push({ start: match.index, end: match.index + match[0].length, value: match[0] });
        match = pattern.exec(text);
      }
      return matches;
    });
  }

  function nonOverlappingMatches(text) {
    const matches = [...dynamicProtectedMatches(text), ...findTermMatches(text)]
      .sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const selected = [];
    for (const match of matches) {
      if (!selected.some((item) => match.start < item.end && match.end > item.start)) {
        selected.push(match);
      }
    }
    return selected.sort((a, b) => a.start - b.start);
  }

  function protectTermsForTranslation(value) {
    const text = String(value == null ? "" : value);
    const matches = nonOverlappingMatches(text);
    if (!matches.length) return { text, replacements: [] };
    const replacements = [];
    let cursor = 0;
    let protectedText = "";
    for (const match of matches) {
      const placeholder = `${PLACEHOLDER_PREFIX}${replacements.length}__`;
      protectedText += text.slice(cursor, match.start) + placeholder;
      replacements.push({ placeholder, value: match.value });
      cursor = match.end;
    }
    protectedText += text.slice(cursor);
    return { text: protectedText, replacements };
  }

  function restoreProtectedTerms(value, replacements = []) {
    let restored = String(value == null ? "" : value);
    replacements.forEach((replacement, index) => {
      const exact = new RegExp(escapeRegExp(replacement.placeholder), "g");
      restored = restored.replace(exact, replacement.value);
      const tolerant = new RegExp(`__\\s*UGLYTERM\\s*[_-]?\\s*${index}\\s*__`, "gi");
      restored = restored.replace(tolerant, replacement.value);
    });
    return restored;
  }

  function isOnlyProtectedTerm(text) {
    return TERM_LIST.includes(text);
  }

  function shouldSkipMachineTranslation(value) {
    if (typeof value !== "string") return true;
    const text = value.trim();
    if (!text) return true;
    if (isOnlyProtectedTerm(text)) return true;
    if (/^[$#]?[0-9,.]+%?$/.test(text)) return true;
    if (/^0x[a-fA-F0-9]{40}$/.test(text)) return true;
    if (/^https?:\/\/[^\s<>"']+$/.test(text)) return true;
    if (/^UGLY-[A-Z0-9-]{4,}$/.test(text)) return true;
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(text)) return true;
    if (/^@[A-Za-z0-9_.-]{2,32}$/.test(text)) return true;
    if (/^[A-Za-z0-9_.-]{2,32}#[0-9]{4}$/.test(text)) return true;
    if (/^[A-Z0-9]{4,}-[A-Z0-9-]{4,}$/.test(text)) return true;
    if (/^#[0-9]+$/.test(text)) return true;
    return false;
  }

  return {
    getProtectedTranslationTerms,
    protectTermsForTranslation,
    restoreProtectedTerms,
    shouldSkipMachineTranslation
  };
}));
