let Pool = null;
try {
  ({ Pool } = require("pg"));
} catch {
  Pool = null;
}

const { normalizeText, normalizeWallet } = require("./validators");

const DATABASE_URL = process.env.DATABASE_URL_LEADERBOARD || "";
const pool = DATABASE_URL && Pool
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false }
    })
  : null;

let dbReadyPromise = null;
const memory = {
  profiles: new Map(),
  scans: [],
  runs: new Map(),
  events: [],
  payouts: new Map(),
  leaderboard: new Map()
};

function isDbEnabled() {
  return Boolean(pool);
}

async function ensureDbReady() {
  if (!pool) return false;
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_profiles (
          client_id TEXT PRIMARY KEY,
          discord_user_id TEXT,
          discord_handle TEXT,
          discord_avatar TEXT,
          discord_global_name TEXT,
          wallet_address TEXT,
          twitter_handle TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ugly_interview_profiles_discord_user_id_idx ON ugly_interview_profiles (discord_user_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_profiles_wallet_address_idx ON ugly_interview_profiles (wallet_address);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_wallet_scans (
          id BIGSERIAL PRIMARY KEY,
          client_id TEXT,
          discord_user_id TEXT,
          wallet_address TEXT NOT NULL,
          squig_count INTEGER NOT NULL DEFAULT 0,
          revive_pill_count INTEGER NOT NULL DEFAULT 0,
          has_revive_pill BOOLEAN NOT NULL DEFAULT false,
          dignity_granted INTEGER NOT NULL DEFAULT 1,
          token_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          revive_pill_token_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          trait_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
          raw_count INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'alchemy',
          fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS ugly_interview_wallet_scans_wallet_address_idx ON ugly_interview_wallet_scans (wallet_address);
        CREATE INDEX IF NOT EXISTS ugly_interview_wallet_scans_fetched_at_idx ON ugly_interview_wallet_scans (fetched_at);
        CREATE INDEX IF NOT EXISTS ugly_interview_wallet_scans_client_id_idx ON ugly_interview_wallet_scans (client_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_wallet_scans_discord_user_id_idx ON ugly_interview_wallet_scans (discord_user_id);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_runs (
          run_id UUID PRIMARY KEY,
          client_id TEXT NOT NULL,
          discord_user_id TEXT,
          discord_handle TEXT,
          discord_avatar TEXT,
          wallet_address TEXT,
          wallet_scan_id BIGINT,
          mode TEXT NOT NULL,
          status TEXT NOT NULL,
          seed_hash TEXT,
          question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          current_index INTEGER NOT NULL DEFAULT 0,
          interview_length INTEGER NOT NULL DEFAULT 15,
          dignity_start INTEGER NOT NULL DEFAULT 1,
          dignity_remaining INTEGER NOT NULL DEFAULT 1,
          squig_count INTEGER NOT NULL DEFAULT 0,
          has_revive_pill BOOLEAN NOT NULL DEFAULT false,
          correct_count INTEGER NOT NULL DEFAULT 0,
          wrong_count INTEGER NOT NULL DEFAULT 0,
          charm_stack INTEGER NOT NULL DEFAULT 0,
          charm_final INTEGER NOT NULL DEFAULT 0,
          completion_bonus INTEGER NOT NULL DEFAULT 0,
          rank_title TEXT,
          result_type TEXT,
          question_started_at TIMESTAMPTZ,
          question_expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          finished_at TIMESTAMPTZ
        );
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_client_id_idx ON ugly_interview_runs (client_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_discord_user_id_idx ON ugly_interview_runs (discord_user_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_wallet_address_idx ON ugly_interview_runs (wallet_address);
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_status_idx ON ugly_interview_runs (status);
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_created_at_idx ON ugly_interview_runs (created_at);
        CREATE INDEX IF NOT EXISTS ugly_interview_runs_mode_idx ON ugly_interview_runs (mode);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_run_events (
          id BIGSERIAL PRIMARY KEY,
          run_id UUID NOT NULL,
          question_index INTEGER NOT NULL,
          question_id TEXT NOT NULL,
          tier INTEGER,
          selected_option_id TEXT,
          correct_option_id TEXT,
          was_correct BOOLEAN NOT NULL DEFAULT false,
          timed_out BOOLEAN NOT NULL DEFAULT false,
          reward_added INTEGER NOT NULL DEFAULT 0,
          dignity_lost INTEGER NOT NULL DEFAULT 0,
          charm_stack_after INTEGER NOT NULL DEFAULT 0,
          dignity_after INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_charm_payouts (
          payout_id UUID PRIMARY KEY,
          run_id UUID NOT NULL,
          client_id TEXT NOT NULL,
          discord_user_id TEXT,
          discord_handle TEXT,
          wallet_address TEXT,
          amount INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          claim_code TEXT NOT NULL,
          admin_note TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          paid_at TIMESTAMPTZ
        );
        CREATE UNIQUE INDEX IF NOT EXISTS ugly_interview_charm_payouts_claim_code_idx ON ugly_interview_charm_payouts (claim_code);
        CREATE INDEX IF NOT EXISTS ugly_interview_charm_payouts_run_id_idx ON ugly_interview_charm_payouts (run_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_charm_payouts_discord_user_id_idx ON ugly_interview_charm_payouts (discord_user_id);
        CREATE INDEX IF NOT EXISTS ugly_interview_charm_payouts_wallet_address_idx ON ugly_interview_charm_payouts (wallet_address);
        CREATE INDEX IF NOT EXISTS ugly_interview_charm_payouts_status_idx ON ugly_interview_charm_payouts (status);
        CREATE INDEX IF NOT EXISTS ugly_interview_charm_payouts_created_at_idx ON ugly_interview_charm_payouts (created_at);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ugly_interview_leaderboard (
          client_id TEXT PRIMARY KEY,
          discord_user_id TEXT,
          discord_handle TEXT,
          discord_avatar TEXT,
          wallet_address TEXT,
          runs_total INTEGER DEFAULT 0,
          reward_runs_total INTEGER DEFAULT 0,
          practice_runs_total INTEGER DEFAULT 0,
          total_charm_earned INTEGER DEFAULT 0,
          best_charm_ever INTEGER DEFAULT 0,
          best_question_reached INTEGER DEFAULT 0,
          best_correct_count INTEGER DEFAULT 0,
          full_clears INTEGER DEFAULT 0,
          perfect_clears INTEGER DEFAULT 0,
          last_rank_title TEXT,
          last_squig_count INTEGER DEFAULT 0,
          last_has_revive_pill BOOLEAN DEFAULT false,
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);
    })().catch((error) => {
      dbReadyPromise = null;
      throw error;
    });
  }
  await dbReadyPromise;
  return true;
}

async function checkDb() {
  if (!pool) return false;
  await ensureDbReady();
  await pool.query("SELECT 1");
  return true;
}

function mapProfile(row) {
  if (!row) return null;
  return {
    clientId: row.client_id,
    discordUserId: row.discord_user_id || "",
    discordHandle: row.discord_handle || "",
    discordAvatar: row.discord_avatar || "",
    discordGlobalName: row.discord_global_name || "",
    walletAddress: row.wallet_address || "",
    twitterHandle: row.twitter_handle || "",
    updatedAt: row.updated_at
  };
}

async function getProfile(clientId) {
  if (!pool) return memory.profiles.get(clientId) || null;
  await ensureDbReady();
  const result = await pool.query("SELECT * FROM ugly_interview_profiles WHERE client_id = $1 LIMIT 1", [clientId]);
  return mapProfile(result.rows[0]);
}

async function upsertProfile(clientId, payload = {}) {
  const current = await getProfile(clientId);
  const profile = {
    clientId,
    discordUserId: payload.discordUserId !== undefined ? normalizeText(payload.discordUserId, 80) : current?.discordUserId || "",
    discordHandle: payload.discordHandle !== undefined ? normalizeText(payload.discordHandle, 120) : current?.discordHandle || "",
    discordAvatar: payload.discordAvatar !== undefined ? normalizeText(payload.discordAvatar, 500) : current?.discordAvatar || "",
    discordGlobalName: payload.discordGlobalName !== undefined ? normalizeText(payload.discordGlobalName, 120) : current?.discordGlobalName || "",
    walletAddress: payload.walletAddress !== undefined ? normalizeWallet(payload.walletAddress) : current?.walletAddress || "",
    twitterHandle: payload.twitterHandle !== undefined ? normalizeText(payload.twitterHandle, 120) : current?.twitterHandle || "",
    updatedAt: new Date().toISOString()
  };

  if (!pool) {
    memory.profiles.set(clientId, profile);
    return profile;
  }

  await ensureDbReady();
  const result = await pool.query(
    `
    INSERT INTO ugly_interview_profiles (
      client_id, discord_user_id, discord_handle, discord_avatar, discord_global_name,
      wallet_address, twitter_handle, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, now())
    ON CONFLICT (client_id) DO UPDATE SET
      discord_user_id = COALESCE(EXCLUDED.discord_user_id, ugly_interview_profiles.discord_user_id),
      discord_handle = COALESCE(EXCLUDED.discord_handle, ugly_interview_profiles.discord_handle),
      discord_avatar = COALESCE(EXCLUDED.discord_avatar, ugly_interview_profiles.discord_avatar),
      discord_global_name = COALESCE(EXCLUDED.discord_global_name, ugly_interview_profiles.discord_global_name),
      wallet_address = COALESCE(EXCLUDED.wallet_address, ugly_interview_profiles.wallet_address),
      twitter_handle = COALESCE(EXCLUDED.twitter_handle, ugly_interview_profiles.twitter_handle),
      updated_at = now()
    RETURNING *
    `,
    [
      clientId,
      profile.discordUserId || null,
      profile.discordHandle || null,
      profile.discordAvatar || null,
      profile.discordGlobalName || null,
      profile.walletAddress || null,
      profile.twitterHandle || null
    ]
  );
  return mapProfile(result.rows[0]);
}

function mapScan(row) {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.client_id,
    discordUserId: row.discord_user_id,
    walletAddress: row.wallet_address,
    squigCount: row.squig_count,
    revivePillCount: row.revive_pill_count,
    hasRevivePill: row.has_revive_pill,
    dignityGranted: row.dignity_granted,
    tokenIds: row.token_ids || [],
    revivePillTokenIds: row.revive_pill_token_ids || [],
    traitSummary: row.trait_summary || {},
    rawCount: row.raw_count,
    source: row.source,
    fetchedAt: row.fetched_at
  };
}

async function saveWalletScan(clientId, discordUserId, scan) {
  if (!pool) {
    const row = {
      ...scan,
      id: memory.scans.length + 1,
      clientId,
      discordUserId: discordUserId || "",
      fetchedAt: scan.fetchedAt || new Date().toISOString()
    };
    memory.scans.push(row);
    return row;
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    INSERT INTO ugly_interview_wallet_scans (
      client_id, discord_user_id, wallet_address, squig_count, revive_pill_count,
      has_revive_pill, dignity_granted, token_ids, revive_pill_token_ids,
      trait_summary, raw_count, source, fetched_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13)
    RETURNING *
    `,
    [
      clientId,
      discordUserId || null,
      scan.walletAddress,
      scan.squigCount,
      scan.revivePillCount,
      scan.hasRevivePill,
      scan.dignityGranted,
      JSON.stringify(scan.tokenIds || []),
      JSON.stringify(scan.revivePillTokenIds || []),
      JSON.stringify(scan.traitSummary || {}),
      scan.rawCount || 0,
      scan.source || "alchemy",
      scan.fetchedAt || new Date().toISOString()
    ]
  );
  return mapScan(result.rows[0]);
}

async function getLatestWalletScan(walletAddress) {
  const normalized = normalizeWallet(walletAddress);
  if (!pool) {
    return [...memory.scans].reverse().find((scan) => scan.walletAddress === normalized) || null;
  }
  await ensureDbReady();
  const result = await pool.query(
    "SELECT * FROM ugly_interview_wallet_scans WHERE wallet_address = $1 ORDER BY fetched_at DESC LIMIT 1",
    [normalized]
  );
  return mapScan(result.rows[0]);
}

function mapRun(row) {
  if (!row) return null;
  return {
    runId: row.run_id,
    clientId: row.client_id,
    discordUserId: row.discord_user_id || "",
    discordHandle: row.discord_handle || "",
    discordAvatar: row.discord_avatar || "",
    walletAddress: row.wallet_address || "",
    walletScanId: row.wallet_scan_id || null,
    mode: row.mode,
    status: row.status,
    seedHash: row.seed_hash || "",
    questionIds: row.question_ids || [],
    currentIndex: row.current_index,
    interviewLength: row.interview_length,
    dignityStart: row.dignity_start,
    dignityRemaining: row.dignity_remaining,
    squigCount: row.squig_count,
    hasRevivePill: row.has_revive_pill,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    charmStack: row.charm_stack,
    charmFinal: row.charm_final,
    completionBonus: row.completion_bonus,
    rankTitle: row.rank_title || "",
    resultType: row.result_type || "",
    questionStartedAt: row.question_started_at ? new Date(row.question_started_at).toISOString() : null,
    questionExpiresAt: row.question_expires_at ? new Date(row.question_expires_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    finishedAt: row.finished_at ? new Date(row.finished_at).toISOString() : null
  };
}

async function createRun(run) {
  if (!pool) {
    const row = { ...run, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    memory.runs.set(run.runId, row);
    return row;
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    INSERT INTO ugly_interview_runs (
      run_id, client_id, discord_user_id, discord_handle, discord_avatar, wallet_address,
      wallet_scan_id, mode, status, seed_hash, question_ids, current_index, interview_length,
      dignity_start, dignity_remaining, squig_count, has_revive_pill, question_started_at, question_expires_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING *
    `,
    [
      run.runId,
      run.clientId,
      run.discordUserId || null,
      run.discordHandle || null,
      run.discordAvatar || null,
      run.walletAddress || null,
      run.walletScanId || null,
      run.mode,
      run.status,
      run.seedHash || null,
      JSON.stringify(run.questionIds || []),
      run.currentIndex,
      run.interviewLength,
      run.dignityStart,
      run.dignityRemaining,
      run.squigCount,
      run.hasRevivePill,
      run.questionStartedAt,
      run.questionExpiresAt
    ]
  );
  return mapRun(result.rows[0]);
}

async function updateRun(runId, patch) {
  const current = await getRun(runId);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  if (!pool) {
    memory.runs.set(runId, next);
    return next;
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    UPDATE ugly_interview_runs SET
      status = $2,
      current_index = $3,
      dignity_remaining = $4,
      correct_count = $5,
      wrong_count = $6,
      charm_stack = $7,
      charm_final = $8,
      completion_bonus = $9,
      rank_title = $10,
      result_type = $11,
      question_started_at = $12,
      question_expires_at = $13,
      finished_at = $14,
      updated_at = now()
    WHERE run_id = $1
    RETURNING *
    `,
    [
      runId,
      next.status,
      next.currentIndex,
      next.dignityRemaining,
      next.correctCount,
      next.wrongCount,
      next.charmStack,
      next.charmFinal,
      next.completionBonus,
      next.rankTitle || null,
      next.resultType || null,
      next.questionStartedAt,
      next.questionExpiresAt,
      next.finishedAt
    ]
  );
  return mapRun(result.rows[0]);
}

async function getRun(runId) {
  if (!pool) return memory.runs.get(runId) || null;
  await ensureDbReady();
  const result = await pool.query("SELECT * FROM ugly_interview_runs WHERE run_id = $1 LIMIT 1", [runId]);
  return mapRun(result.rows[0]);
}

async function getActiveRun(clientId) {
  if (!pool) {
    return [...memory.runs.values()].find((run) => run.clientId === clientId && run.status === "active") || null;
  }
  await ensureDbReady();
  const result = await pool.query(
    "SELECT * FROM ugly_interview_runs WHERE client_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    [clientId]
  );
  return mapRun(result.rows[0]);
}

async function getActiveRewardRun(discordUserId, walletAddress) {
  if (!pool) {
    return [...memory.runs.values()].find((run) =>
      run.mode === "reward" &&
      run.status === "active" &&
      ((discordUserId && run.discordUserId === discordUserId) || (walletAddress && run.walletAddress === walletAddress))
    ) || null;
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    SELECT * FROM ugly_interview_runs
    WHERE mode = 'reward' AND status = 'active'
      AND (($1::text IS NOT NULL AND discord_user_id = $1) OR ($2::text IS NOT NULL AND wallet_address = $2))
    ORDER BY created_at DESC LIMIT 1
    `,
    [discordUserId || null, walletAddress || null]
  );
  return mapRun(result.rows[0]);
}

async function insertRunEvent(event) {
  if (!pool) {
    memory.events.push({ ...event, id: memory.events.length + 1, createdAt: new Date().toISOString() });
    return;
  }
  await ensureDbReady();
  await pool.query(
    `
    INSERT INTO ugly_interview_run_events (
      run_id, question_index, question_id, tier, selected_option_id, correct_option_id,
      was_correct, timed_out, reward_added, dignity_lost, charm_stack_after, dignity_after
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `,
    [
      event.runId,
      event.questionIndex,
      event.questionId,
      event.tier,
      event.selectedOptionId,
      event.correctOptionId,
      event.wasCorrect,
      event.timedOut,
      event.rewardAdded,
      event.dignityLost,
      event.charmStackAfter,
      event.dignityAfter
    ]
  );
}

async function getRewardCooldown(discordUserId, walletAddress, cooldownHours) {
  if (!cooldownHours) return { available: true, nextAvailableAt: null };
  const cutoff = Date.now() - cooldownHours * 60 * 60 * 1000;
  let last = null;
  if (!pool) {
    last = [...memory.runs.values()]
      .filter((run) => run.mode === "reward" && ((discordUserId && run.discordUserId === discordUserId) || (walletAddress && run.walletAddress === walletAddress)))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] || null;
  } else {
    await ensureDbReady();
    const result = await pool.query(
      `
      SELECT * FROM ugly_interview_runs
      WHERE mode = 'reward'
        AND (($1::text IS NOT NULL AND discord_user_id = $1) OR ($2::text IS NOT NULL AND wallet_address = $2))
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [discordUserId || null, walletAddress || null]
    );
    last = mapRun(result.rows[0]);
  }
  if (!last || Date.parse(last.createdAt) <= cutoff) return { available: true, nextAvailableAt: null };
  return {
    available: false,
    nextAvailableAt: new Date(Date.parse(last.createdAt) + cooldownHours * 60 * 60 * 1000).toISOString()
  };
}

async function createPayout(payout) {
  if (!pool) {
    memory.payouts.set(payout.payoutId, { ...payout, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return memory.payouts.get(payout.payoutId);
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    INSERT INTO ugly_interview_charm_payouts (
      payout_id, run_id, client_id, discord_user_id, discord_handle, wallet_address, amount, status, claim_code
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8)
    RETURNING *
    `,
    [payout.payoutId, payout.runId, payout.clientId, payout.discordUserId || null, payout.discordHandle || null, payout.walletAddress || null, payout.amount, payout.claimCode]
  );
  return mapPayout(result.rows[0]);
}

function mapPayout(row) {
  if (!row) return null;
  return {
    payoutId: row.payout_id,
    runId: row.run_id,
    clientId: row.client_id,
    discordUserId: row.discord_user_id || "",
    discordHandle: row.discord_handle || "",
    walletAddress: row.wallet_address || "",
    amount: row.amount,
    status: row.status,
    claimCode: row.claim_code,
    adminNote: row.admin_note || "",
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null
  };
}

async function getPayouts(clientId) {
  if (!pool) return [...memory.payouts.values()].filter((payout) => payout.clientId === clientId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  await ensureDbReady();
  const result = await pool.query("SELECT * FROM ugly_interview_charm_payouts WHERE client_id = $1 ORDER BY created_at DESC", [clientId]);
  return result.rows.map(mapPayout);
}

async function getAdminPayouts(status = "pending") {
  if (!pool) return [...memory.payouts.values()].filter((payout) => payout.status === status);
  await ensureDbReady();
  const result = await pool.query("SELECT * FROM ugly_interview_charm_payouts WHERE status = $1 ORDER BY created_at DESC LIMIT 200", [status]);
  return result.rows.map(mapPayout);
}

async function updatePayoutStatus(payoutId, status, adminNote) {
  if (!pool) {
    const payout = memory.payouts.get(payoutId);
    if (!payout) return null;
    const next = { ...payout, status, adminNote: normalizeText(adminNote, 1000), updatedAt: new Date().toISOString(), paidAt: status === "paid" ? new Date().toISOString() : payout.paidAt || null };
    memory.payouts.set(payoutId, next);
    return next;
  }
  await ensureDbReady();
  const result = await pool.query(
    `
    UPDATE ugly_interview_charm_payouts
    SET status = $2, admin_note = $3, updated_at = now(), paid_at = CASE WHEN $2 = 'paid' THEN now() ELSE paid_at END
    WHERE payout_id = $1
    RETURNING *
    `,
    [payoutId, status, normalizeText(adminNote, 1000) || null]
  );
  return mapPayout(result.rows[0]);
}

async function updateLeaderboard(run) {
  const bestQuestionReached = Math.min(run.interviewLength, run.currentIndex + (run.status === "completed" ? 0 : 1));
  const fullClear = run.status === "completed" ? 1 : 0;
  const perfectClear = run.status === "completed" && run.wrongCount === 0 ? 1 : 0;
  if (!pool) {
    const current = memory.leaderboard.get(run.clientId) || {
      clientId: run.clientId,
      runsTotal: 0,
      rewardRunsTotal: 0,
      practiceRunsTotal: 0,
      totalCharmEarned: 0,
      bestCharmEver: 0,
      bestQuestionReached: 0,
      bestCorrectCount: 0,
      fullClears: 0,
      perfectClears: 0
    };
    const next = {
      ...current,
      discordUserId: run.discordUserId,
      discordHandle: run.discordHandle,
      discordAvatar: run.discordAvatar,
      walletAddress: run.walletAddress,
      runsTotal: current.runsTotal + 1,
      rewardRunsTotal: current.rewardRunsTotal + (run.mode === "reward" ? 1 : 0),
      practiceRunsTotal: current.practiceRunsTotal + (run.mode === "practice" ? 1 : 0),
      totalCharmEarned: current.totalCharmEarned + (run.mode === "reward" ? run.charmFinal : 0),
      bestCharmEver: Math.max(current.bestCharmEver, run.charmFinal || 0),
      bestQuestionReached: Math.max(current.bestQuestionReached, bestQuestionReached),
      bestCorrectCount: Math.max(current.bestCorrectCount, run.correctCount),
      fullClears: current.fullClears + fullClear,
      perfectClears: current.perfectClears + perfectClear,
      lastRankTitle: run.rankTitle,
      lastSquigCount: run.squigCount,
      lastHasRevivePill: run.hasRevivePill,
      updatedAt: new Date().toISOString()
    };
    memory.leaderboard.set(run.clientId, next);
    return;
  }
  await ensureDbReady();
  await pool.query(
    `
    INSERT INTO ugly_interview_leaderboard (
      client_id, discord_user_id, discord_handle, discord_avatar, wallet_address,
      runs_total, reward_runs_total, practice_runs_total, total_charm_earned,
      best_charm_ever, best_question_reached, best_correct_count, full_clears,
      perfect_clears, last_rank_title, last_squig_count, last_has_revive_pill, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,1,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())
    ON CONFLICT (client_id) DO UPDATE SET
      discord_user_id = EXCLUDED.discord_user_id,
      discord_handle = EXCLUDED.discord_handle,
      discord_avatar = EXCLUDED.discord_avatar,
      wallet_address = EXCLUDED.wallet_address,
      runs_total = ugly_interview_leaderboard.runs_total + 1,
      reward_runs_total = ugly_interview_leaderboard.reward_runs_total + EXCLUDED.reward_runs_total,
      practice_runs_total = ugly_interview_leaderboard.practice_runs_total + EXCLUDED.practice_runs_total,
      total_charm_earned = ugly_interview_leaderboard.total_charm_earned + EXCLUDED.total_charm_earned,
      best_charm_ever = GREATEST(ugly_interview_leaderboard.best_charm_ever, EXCLUDED.best_charm_ever),
      best_question_reached = GREATEST(ugly_interview_leaderboard.best_question_reached, EXCLUDED.best_question_reached),
      best_correct_count = GREATEST(ugly_interview_leaderboard.best_correct_count, EXCLUDED.best_correct_count),
      full_clears = ugly_interview_leaderboard.full_clears + EXCLUDED.full_clears,
      perfect_clears = ugly_interview_leaderboard.perfect_clears + EXCLUDED.perfect_clears,
      last_rank_title = EXCLUDED.last_rank_title,
      last_squig_count = EXCLUDED.last_squig_count,
      last_has_revive_pill = EXCLUDED.last_has_revive_pill,
      updated_at = now()
    `,
    [
      run.clientId,
      run.discordUserId || null,
      run.discordHandle || null,
      run.discordAvatar || null,
      run.walletAddress || null,
      run.mode === "reward" ? 1 : 0,
      run.mode === "practice" ? 1 : 0,
      run.mode === "reward" ? run.charmFinal || 0 : 0,
      run.charmFinal || 0,
      bestQuestionReached,
      run.correctCount,
      fullClear,
      perfectClear,
      run.rankTitle || null,
      run.squigCount || 0,
      Boolean(run.hasRevivePill)
    ]
  );
}

function leaderboardDisplayName(row) {
  return row.discord_handle || row.discordHandle || row.discord_user_id || row.discordUserId || row.wallet_address || row.walletAddress || row.client_id || row.clientId;
}

async function getLeaderboard(period = "all-time", limit = 100, clientId = null) {
  const cappedLimit = Math.max(1, Math.min(100, Number(limit) || 100));
  if (!pool) {
    const entries = [...memory.leaderboard.values()]
      .sort((a, b) =>
        b.fullClears - a.fullClears ||
        b.bestCharmEver - a.bestCharmEver ||
        b.bestQuestionReached - a.bestQuestionReached ||
        b.totalCharmEarned - a.totalCharmEarned ||
        Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
      )
      .map((entry, index) => ({ ...entry, placement: index + 1, displayName: leaderboardDisplayName(entry) }))
      .slice(0, cappedLimit);
    const currentPlayer = clientId ? entries.find((entry) => entry.clientId === clientId) || null : null;
    return { entries, currentPlayer };
  }

  await ensureDbReady();
  const fromClause = period === "weekly"
    ? "WHERE updated_at >= now() - interval '7 days'"
    : period === "monthly"
      ? "WHERE updated_at >= now() - interval '30 days'"
      : "";
  const leaderboardWhere = fromClause ? `${fromClause} AND reward_runs_total > 0` : "WHERE reward_runs_total > 0";
  const result = await pool.query(
    `
    WITH ranked AS (
      SELECT *,
        COALESCE(NULLIF(discord_handle, ''), NULLIF(discord_user_id, ''), NULLIF(wallet_address, ''), client_id) AS display_name,
        ROW_NUMBER() OVER (
          ORDER BY full_clears DESC, best_charm_ever DESC, best_question_reached DESC, total_charm_earned DESC, updated_at ASC
        ) AS placement
      FROM ugly_interview_leaderboard
      ${leaderboardWhere}
    )
    SELECT * FROM ranked WHERE placement <= $1 ORDER BY placement ASC
    `,
    [cappedLimit]
  );
  const entries = result.rows.map((row) => ({
    placement: Number(row.placement),
    clientId: row.client_id,
    discordUserId: row.discord_user_id,
    discordHandle: row.discord_handle,
    discordAvatar: row.discord_avatar,
    walletAddress: row.wallet_address,
    displayName: row.display_name,
    runsTotal: row.runs_total,
    rewardRunsTotal: row.reward_runs_total,
    totalCharmEarned: row.total_charm_earned,
    bestCharmEver: row.best_charm_ever,
    bestQuestionReached: row.best_question_reached,
    bestCorrectCount: row.best_correct_count,
    fullClears: row.full_clears,
    perfectClears: row.perfect_clears,
    lastRankTitle: row.last_rank_title,
    lastSquigCount: row.last_squig_count,
    lastHasRevivePill: row.last_has_revive_pill
  }));
  return { entries, currentPlayer: clientId ? entries.find((entry) => entry.clientId === clientId) || null : null };
}

module.exports = {
  checkDb,
  createPayout,
  createRun,
  ensureDbReady,
  getActiveRewardRun,
  getActiveRun,
  getAdminPayouts,
  getLeaderboard,
  getLatestWalletScan,
  getPayouts,
  getProfile,
  getRewardCooldown,
  getRun,
  insertRunEvent,
  isDbEnabled,
  saveWalletScan,
  updateLeaderboard,
  updatePayoutStatus,
  updateRun,
  upsertProfile
};
