const { spawn } = require("child_process");
const { QUESTIONS } = require("../server/interview-questions");

const PORT = String(process.env.SMOKE_PORT || 3199);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CLIENT_ID = `smoke_${Date.now()}`;
const QUESTIONS_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(pathname, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${BASE_URL}${pathname}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    if (!contentType.includes("application/json")) {
      throw new Error(`${pathname} returned non-JSON content-type: ${contentType}`);
    }
    const data = raw ? JSON.parse(raw) : {};
    if (response.status >= 500) {
      throw new Error(`${pathname} returned ${response.status}: ${data.error || raw}`);
    }
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      await fetchJson("/health");
      return;
    } catch {
      await wait(250);
    }
  }
  throw new Error("Server did not become healthy in time");
}

async function main() {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT,
      DATABASE_URL_LEADERBOARD: ""
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    await fetchJson("/api/config");
    await fetchJson(`/api/profile?clientId=${encodeURIComponent(CLIENT_ID)}`);
    const translate = await fetchJson("/api/translate", {
      method: "POST",
      body: JSON.stringify({ language: "fr", texts: ["Begin Interview"] })
    });
    if (!Array.isArray(translate.data.translations) || translate.data.translations.length !== 1) {
      throw new Error("Translate route did not return a translations array");
    }
    const run = await fetchJson("/api/run/start", {
      method: "POST",
      body: JSON.stringify({ clientId: CLIENT_ID, mode: "practice" })
    });
    if (!run.data.run?.question?.options?.length) {
      throw new Error("Practice run did not return a playable question");
    }
    const smokeQuestion = QUESTIONS_BY_ID.get(run.data.run.question.id);
    const wrongOption = run.data.run.question.options.find((option) => option.id !== smokeQuestion.correctOptionId);
    const finishedPractice = await fetchJson("/api/run/choice", {
      method: "POST",
      body: JSON.stringify({
        clientId: CLIENT_ID,
        runId: run.data.run.runId,
        questionId: run.data.run.question.id,
        selectedOptionId: wrongOption.id
      })
    });
    if (!finishedPractice.data.final) {
      throw new Error("Practice run did not finish after dignity was exhausted");
    }
    const leaderboard = await fetchJson(`/api/leaderboard?period=weekly&limit=10&clientId=${encodeURIComponent(CLIENT_ID)}`);
    if (leaderboard.data.currentPlayer || leaderboard.data.entries.some((entry) => entry.clientId === CLIENT_ID)) {
      throw new Error("Practice run was counted on the leaderboard");
    }
    await fetchJson(`/api/payouts?clientId=${encodeURIComponent(CLIENT_ID)}`);
    console.log("Smoke test passed.");
  } finally {
    child.kill();
  }

  if (stderr.trim()) {
    console.warn(stderr.trim());
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
