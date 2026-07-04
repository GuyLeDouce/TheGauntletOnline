const { readFileSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const glossary = require(join(root, "public", "translation-glossary.js"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadGameData() {
  const source = readFileSync(join(root, "public", "game-data.js"), "utf8");
  const encoded = Buffer.from(source, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

function fakeTranslate(text, language) {
  if (language === "en" || glossary.shouldSkipMachineTranslation(text)) return text;
  const protectedInput = glossary.protectTermsForTranslation(text);
  return glossary.restoreProtectedTerms(`[${language}] ${protectedInput.text}`, protectedInput.replacements);
}

async function main() {
  const { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } = await loadGameData();

  assert(SUPPORTED_LANGUAGES.en === "English", "English language label is wrong");
  assert(SUPPORTED_LANGUAGES.fr === "Français", "French language label must be Français");
  assert(SUPPORTED_LANGUAGES.es === "Español", "Spanish language label must be Español");

  const languages = ["en", "fr", "es"];
  const baseKeys = Object.keys(UI_TRANSLATIONS.en).sort();
  for (const lang of languages) {
    const keys = Object.keys(UI_TRANSLATIONS[lang] || {}).sort();
    assert(JSON.stringify(keys) === JSON.stringify(baseKeys), `${lang} translation keys differ from English`);
  }

  [
    "languageLabel",
    "howItWorks",
    "leaderboard",
    "myClaims",
    "walletScanDetails",
    "connectDiscord",
    "scanWallet",
    "refreshScan",
    "correctAnswer",
    "wrongAnswer",
    "dignityLost",
    "continue",
    "tryAgain"
  ].forEach((key) => assert(baseKeys.includes(key), `Missing required UI translation key: ${key}`));

  const terms = glossary.getProtectedTranslationTerms();
  assert(terms.indexOf("Revive Pill Tokens") < terms.indexOf("Revive Pill"), "Revive Pill Tokens must match before Revive Pill");
  assert(terms.indexOf("Squigs Reloaded") < terms.indexOf("Squigs"), "Squigs Reloaded must match before Squigs");

  [
    "Discord, Revive Pill, and $CHARM.",
    "Scan Squigs Reloaded for Revive Pill Tokens!",
    "InSquignito’s Ugly Interview uses DRIP.",
    "Connect Discord and scan your wallet for Revive Pill Tokens before claiming $CHARM through DRIP.",
    "Your Squigs Reloaded scan found a Revive Pill."
  ].forEach((sample) => {
    const protectedInput = glossary.protectTermsForTranslation(sample);
    const restored = glossary.restoreProtectedTerms(protectedInput.text, protectedInput.replacements);
    assert(restored === sample, `Protect/restore changed text: ${sample}`);
    assert(!restored.includes("__UGLYTERM_"), `Placeholder leaked for: ${sample}`);
  });

  [
    "0x0000000000000000000000000000000000000001",
    "https://squigs.io/discord",
    "UGLY-7H2K9",
    "12345",
    "#42",
    "Discord"
  ].forEach((sample) => {
    assert(glossary.shouldSkipMachineTranslation(sample), `Expected skip for ${sample}`);
  });

  assert(fakeTranslate("Discord", "en") === "Discord", "English helper should return original text");
  const protectedFrench = fakeTranslate("Connect Discord and scan your wallet for Revive Pill Tokens before claiming $CHARM through DRIP.", "fr");
  ["Discord", "wallet", "Revive Pill Tokens", "$CHARM", "DRIP"].forEach((term) => {
    assert(protectedFrench.includes(term), `Protected term missing after fake French translation: ${term}`);
  });
  const protectedSpanish = fakeTranslate("Your Squigs Reloaded scan found a Revive Pill.", "es");
  ["Squigs Reloaded", "Revive Pill"].forEach((term) => {
    assert(protectedSpanish.includes(term), `Protected term missing after fake Spanish translation: ${term}`);
  });

  const gameDataSource = readFileSync(join(root, "public", "game-data.js"), "utf8");
  [
    "Francais",
    "Espanol",
    "Comment ca marche",
    "Como funciona",
    "Clasificacion",
    "Historico"
  ].forEach((badText) => {
    assert(!gameDataSource.includes(badText), `Found unaccented or low-quality static copy: ${badText}`);
  });

  console.log("Translation glossary and dictionary checks passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
