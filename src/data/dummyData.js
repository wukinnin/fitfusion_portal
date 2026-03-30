// ============================================================
// Shared dummy data for FitFusion Portal & App
// All values are consistent across both projects.
// ============================================================

// --- Players ---
export const PLAYERS = [
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000001', username: 'Vex_Machina',    email: 'vex.machina@pixelgate.net',      verified: true,  created: '2025-11-15' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000002', username: 'Lunar_Squire',   email: 'squire.lunar@astralmail.com',     verified: true,  created: '2025-11-20' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000003', username: 'Grog_Nasty',     email: 'grognasty@dungeon-mail.org',      verified: true,  created: '2025-12-01' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000004', username: 'Neon_Ronin',     email: 'ronin_99@cyber-runner.io',        verified: true,  created: '2025-12-10' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000005', username: 'Fia_Fireheart',  email: 'fia.fire@ember-realm.com',        verified: true,  created: '2025-12-18' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000006', username: 'Zero_Kelvin',    email: 'kelvin.zero@frost-bit.net',       verified: true,  created: '2026-01-02' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000007', username: 'Blinker_Fluid',  email: 'blinker.fluid@respawn-tech.com',  verified: true,  created: '2026-01-08' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000008', username: 'Shadow_Step',    email: 's.step@void-walker.com',          verified: true,  created: '2026-01-14' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000009', username: 'Mana_Miser',     email: 'manamiser@arcane-isp.net',        verified: true,  created: '2026-01-20' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000010', username: 'Tactical_Taco',  email: 'taco.ops@burrito-force.com',      verified: false, created: '2026-02-01' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000011', username: 'Cinder_Sage',    email: 'c.sage@phoenix-ash.io',           verified: true,  created: '2026-02-10' },
  { id: 'b7a1e2f3-1001-4aaa-8001-000000000012', username: 'Loot_Goblin',    email: 'shiny.things@hoard-mail.com',     verified: true,  created: '2026-02-18' },
]

// --- Admins ---
export const ADMINS = [
  { id: 'ad01e2f3-2001-4bbb-9001-000000000001', email: 'glitch.hunter@error-log.io', role: 'superadmin', verified: true, created: '2025-10-01' },
  { id: 'ad01e2f3-2001-4bbb-9001-000000000002', email: 'final.boss@overworld.net',   role: 'admin',      verified: true, created: '2025-11-01' },
]

// --- Per-player stats (keyed by player index 0-11) ---
// Session stats: per workout type
// Lifetime stats: aggregated
export const PLAYER_STATS = {
  // Vex_Machina — hardcore grinder, best at squats
  'Vex_Machina': {
    squats:   { fastestClear: '03:42.110', avgClear: '04:15.330', bestInterval: '1.62', avgInterval: '2.04', victories: 18, defeats: 5, rounds: 195, reps: 1105 },
    jacks:    { fastestClear: '04:01.220', avgClear: '04:38.510', bestInterval: '1.78', avgInterval: '2.21', victories: 12, defeats: 4, rounds: 140, reps: 820 },
    crunches: { fastestClear: '04:18.450', avgClear: '04:52.110', bestInterval: '1.85', avgInterval: '2.35', victories: 10, defeats: 3, rounds: 120, reps: 710 },
    lifetime: { sessions: 52, reps: 2635, rounds: 455, victories: 40 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'survivor', 'halfway_hero', 'monster_hunter', 'triple_crown', 'speed_demon', 'blinding_steel', 'untouchable'],
  },
  // Lunar_Squire — balanced player
  'Lunar_Squire': {
    squats:   { fastestClear: '04:05.320', avgClear: '04:45.120', bestInterval: '1.75', avgInterval: '2.18', victories: 14, defeats: 6, rounds: 170, reps: 960 },
    jacks:    { fastestClear: '04:12.150', avgClear: '04:50.220', bestInterval: '1.81', avgInterval: '2.25', victories: 11, defeats: 5, rounds: 135, reps: 785 },
    crunches: { fastestClear: '04:22.080', avgClear: '05:01.310', bestInterval: '1.90', avgInterval: '2.40', victories: 9, defeats: 4, rounds: 110, reps: 650 },
    lifetime: { sessions: 49, reps: 2395, rounds: 415, victories: 34 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'survivor', 'halfway_hero', 'monster_hunter', 'triple_crown', 'speed_demon'],
  },
  // Grog_Nasty — brute force, many sessions
  'Grog_Nasty': {
    squats:   { fastestClear: '03:55.440', avgClear: '04:30.210', bestInterval: '1.70', avgInterval: '2.12', victories: 16, defeats: 8, rounds: 185, reps: 1050 },
    jacks:    { fastestClear: '04:20.110', avgClear: '05:02.330', bestInterval: '1.95', avgInterval: '2.45', victories: 8, defeats: 7, rounds: 115, reps: 680 },
    crunches: { fastestClear: '04:35.220', avgClear: '05:10.420', bestInterval: '2.00', avgInterval: '2.50', victories: 7, defeats: 6, rounds: 100, reps: 600 },
    lifetime: { sessions: 52, reps: 2330, rounds: 400, victories: 31 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'survivor', 'halfway_hero', 'monster_hunter', 'last_stand'],
  },
  // Neon_Ronin — speed demon, low bulk
  'Neon_Ronin': {
    squats:   { fastestClear: '03:28.550', avgClear: '04:02.110', bestInterval: '1.45', avgInterval: '1.88', victories: 10, defeats: 3, rounds: 115, reps: 680 },
    jacks:    { fastestClear: '03:38.220', avgClear: '04:10.310', bestInterval: '1.52', avgInterval: '1.95', victories: 9, defeats: 2, rounds: 100, reps: 610 },
    crunches: { fastestClear: '03:50.110', avgClear: '04:25.220', bestInterval: '1.60', avgInterval: '2.02', victories: 8, defeats: 2, rounds: 90, reps: 550 },
    lifetime: { sessions: 34, reps: 1840, rounds: 305, victories: 27 },
    achievements: ['first_blood', 'blood_pumper', 'halfway_hero', 'monster_hunter', 'triple_crown', 'speed_demon', 'blinding_steel', 'untouchable'],
  },
  // Fia_Fireheart — consistent mid-tier
  'Fia_Fireheart': {
    squats:   { fastestClear: '04:15.110', avgClear: '04:55.220', bestInterval: '1.82', avgInterval: '2.28', victories: 11, defeats: 5, rounds: 140, reps: 800 },
    jacks:    { fastestClear: '04:25.330', avgClear: '05:05.110', bestInterval: '1.88', avgInterval: '2.32', victories: 10, defeats: 4, rounds: 125, reps: 740 },
    crunches: { fastestClear: '04:30.220', avgClear: '05:12.330', bestInterval: '1.92', avgInterval: '2.38', victories: 9, defeats: 3, rounds: 110, reps: 660 },
    lifetime: { sessions: 42, reps: 2200, rounds: 375, victories: 30 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'survivor', 'halfway_hero', 'monster_hunter', 'triple_crown'],
  },
  // Zero_Kelvin — newer, decent
  'Zero_Kelvin': {
    squats:   { fastestClear: '04:28.220', avgClear: '05:10.110', bestInterval: '1.90', avgInterval: '2.35', victories: 8, defeats: 4, rounds: 105, reps: 620 },
    jacks:    { fastestClear: '04:35.110', avgClear: '05:18.220', bestInterval: '1.95', avgInterval: '2.42', victories: 7, defeats: 3, rounds: 90, reps: 540 },
    crunches: { fastestClear: '04:42.330', avgClear: '05:25.110', bestInterval: '2.02', avgInterval: '2.48', victories: 6, defeats: 3, rounds: 80, reps: 480 },
    lifetime: { sessions: 31, reps: 1640, rounds: 275, victories: 21 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'halfway_hero', 'monster_hunter', 'triple_crown'],
  },
  // Blinker_Fluid — casual
  'Blinker_Fluid': {
    squats:   { fastestClear: '04:50.110', avgClear: '05:30.330', bestInterval: '2.05', avgInterval: '2.55', victories: 6, defeats: 5, rounds: 85, reps: 510 },
    jacks:    { fastestClear: '04:55.220', avgClear: '05:35.110', bestInterval: '2.10', avgInterval: '2.60', victories: 5, defeats: 4, rounds: 75, reps: 450 },
    crunches: { fastestClear: '05:05.110', avgClear: '05:45.220', bestInterval: '2.15', avgInterval: '2.65', victories: 4, defeats: 4, rounds: 65, reps: 390 },
    lifetime: { sessions: 28, reps: 1350, rounds: 225, victories: 15 },
    achievements: ['first_blood', 'blood_pumper', 'halfway_hero', 'monster_hunter'],
  },
  // Shadow_Step — stealthy, efficient
  'Shadow_Step': {
    squats:   { fastestClear: '03:35.330', avgClear: '04:08.110', bestInterval: '1.55', avgInterval: '1.92', victories: 9, defeats: 1, rounds: 95, reps: 580 },
    jacks:    { fastestClear: '03:48.110', avgClear: '04:22.220', bestInterval: '1.65', avgInterval: '2.05', victories: 8, defeats: 1, rounds: 85, reps: 520 },
    crunches: { fastestClear: '03:58.220', avgClear: '04:32.110', bestInterval: '1.72', avgInterval: '2.10', victories: 7, defeats: 1, rounds: 75, reps: 460 },
    lifetime: { sessions: 27, reps: 1560, rounds: 255, victories: 24 },
    achievements: ['first_blood', 'blood_pumper', 'halfway_hero', 'monster_hunter', 'triple_crown', 'speed_demon', 'blinding_steel', 'untouchable'],
  },
  // Mana_Miser — moderate effort
  'Mana_Miser': {
    squats:   { fastestClear: '04:38.110', avgClear: '05:18.220', bestInterval: '1.98', avgInterval: '2.42', victories: 7, defeats: 5, rounds: 95, reps: 570 },
    jacks:    { fastestClear: '04:45.220', avgClear: '05:25.110', bestInterval: '2.04', avgInterval: '2.48', victories: 6, defeats: 4, rounds: 82, reps: 500 },
    crunches: { fastestClear: '04:52.110', avgClear: '05:32.220', bestInterval: '2.08', avgInterval: '2.52', victories: 5, defeats: 4, rounds: 72, reps: 440 },
    lifetime: { sessions: 31, reps: 1510, rounds: 249, victories: 18 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'halfway_hero', 'monster_hunter'],
  },
  // Tactical_Taco — unverified, some play
  'Tactical_Taco': {
    squats:   { fastestClear: '05:02.330', avgClear: '05:45.110', bestInterval: '2.15', avgInterval: '2.68', victories: 4, defeats: 6, rounds: 70, reps: 420 },
    jacks:    { fastestClear: '05:10.110', avgClear: '05:52.220', bestInterval: '2.20', avgInterval: '2.72', victories: 3, defeats: 5, rounds: 58, reps: 350 },
    crunches: { fastestClear: '05:18.220', avgClear: '06:00.110', bestInterval: '2.25', avgInterval: '2.78', victories: 2, defeats: 5, rounds: 48, reps: 290 },
    lifetime: { sessions: 25, reps: 1060, rounds: 176, victories: 9 },
    achievements: ['first_blood', 'halfway_hero'],
  },
  // Cinder_Sage — newer but talented
  'Cinder_Sage': {
    squats:   { fastestClear: '03:48.110', avgClear: '04:20.220', bestInterval: '1.68', avgInterval: '2.08', victories: 8, defeats: 2, rounds: 90, reps: 545 },
    jacks:    { fastestClear: '03:55.220', avgClear: '04:28.110', bestInterval: '1.72', avgInterval: '2.12', victories: 7, defeats: 2, rounds: 82, reps: 500 },
    crunches: { fastestClear: '04:05.110', avgClear: '04:38.220', bestInterval: '1.78', avgInterval: '2.18', victories: 6, defeats: 2, rounds: 72, reps: 440 },
    lifetime: { sessions: 27, reps: 1485, rounds: 244, victories: 21 },
    achievements: ['first_blood', 'blood_pumper', 'halfway_hero', 'monster_hunter', 'triple_crown', 'speed_demon', 'untouchable'],
  },
  // Loot_Goblin — plays a lot but loses often
  'Loot_Goblin': {
    squats:   { fastestClear: '04:45.220', avgClear: '05:25.110', bestInterval: '2.02', avgInterval: '2.52', victories: 5, defeats: 8, rounds: 82, reps: 490 },
    jacks:    { fastestClear: '04:52.110', avgClear: '05:32.220', bestInterval: '2.08', avgInterval: '2.58', victories: 4, defeats: 7, rounds: 70, reps: 420 },
    crunches: { fastestClear: '05:00.220', avgClear: '05:40.110', bestInterval: '2.12', avgInterval: '2.62', victories: 3, defeats: 7, rounds: 60, reps: 360 },
    lifetime: { sessions: 34, reps: 1270, rounds: 212, victories: 12 },
    achievements: ['first_blood', 'iron_will', 'blood_pumper', 'halfway_hero', 'last_stand'],
  },
}

// --- Leaderboard data (pre-sorted, top 10 for app, top 12 for portal) ---
// Per-workout: Fastest Clear Time (lower is better), Best Rep Interval (lower is better)
// Lifetime: Total Reps (higher is better), Total Victories (higher is better)

function sortPlayers(extractor, ascending = true) {
  return PLAYERS
    .map(p => ({ username: p.username, value: extractor(PLAYER_STATS[p.username]) }))
    .filter(r => r.value !== null && r.value !== undefined)
    .sort((a, b) => ascending ? a.numVal - b.numVal : b.numVal - a.numVal)
    .map((r, i) => ({ rank: i + 1, username: r.username, value: r.value }))
}

function parseTime(t) {
  // "03:42.110" -> seconds as float
  const [min, rest] = t.split(':')
  return parseFloat(min) * 60 + parseFloat(rest)
}

function buildBoard(getVal, ascending = true) {
  return PLAYERS
    .map(p => {
      const raw = getVal(PLAYER_STATS[p.username])
      const numVal = typeof raw === 'string' ? parseTime(raw) : raw
      return { username: p.username, value: raw, numVal }
    })
    .sort((a, b) => ascending ? a.numVal - b.numVal : b.numVal - a.numVal)
    .map((r, i) => ({ rank: i + 1, username: r.username, value: r.value }))
}

export const LEADERBOARDS = {
  squats_clear_time:     buildBoard(s => s.squats.fastestClear, true),
  squats_best_interval:  buildBoard(s => s.squats.bestInterval, true),
  jacks_clear_time:      buildBoard(s => s.jacks.fastestClear, true),
  jacks_best_interval:   buildBoard(s => s.jacks.bestInterval, true),
  crunches_clear_time:   buildBoard(s => s.crunches.fastestClear, true),
  crunches_best_interval:buildBoard(s => s.crunches.bestInterval, true),
  lifetime_reps:         buildBoard(s => s.lifetime.reps, false),
  lifetime_victories:    buildBoard(s => s.lifetime.victories, false),
}

// --- Achievement unlock counts ---
const ALL_ACHIEVEMENT_IDS = [
  'first_blood', 'iron_will', 'blood_pumper', 'survivor', 'halfway_hero',
  'monster_hunter', 'triple_crown', 'speed_demon', 'blinding_steel', 'untouchable', 'last_stand',
]

export const ACHIEVEMENT_COUNTS = ALL_ACHIEVEMENT_IDS.map(id => {
  const count = Object.values(PLAYER_STATS).filter(s => s.achievements.includes(id)).length
  return { id, count }
})

// --- Admin Logs (using real player/admin references) ---
export const ADMIN_LOGS = [
  { id: 1, adminEmail: 'glitch.hunter@error-log.io', action: 'Force password reset', targetId: PLAYERS[3].id, details: `{ "username": "${PLAYERS[3].username}" }`, timestamp: '2026-03-28 14:32:05' },
  { id: 2, adminEmail: 'final.boss@overworld.net',   action: 'Deleted player',       targetId: 'b7a1e2f3-1001-4aaa-8001-000000000099', details: '{ "username": "Banned_User" }', timestamp: '2026-03-25 09:15:22' },
  { id: 3, adminEmail: 'glitch.hunter@error-log.io', action: 'Exported data',        targetId: null, details: '{ "tables": ["users","sessions"], "format": "csv" }', timestamp: '2026-03-22 16:45:10' },
  { id: 4, adminEmail: 'final.boss@overworld.net',   action: 'Force password reset', targetId: PLAYERS[7].id, details: `{ "username": "${PLAYERS[7].username}" }`, timestamp: '2026-03-20 11:20:00' },
  { id: 5, adminEmail: 'glitch.hunter@error-log.io', action: 'Exported data',        targetId: null, details: '{ "tables": ["admin_logs"], "format": "json" }', timestamp: '2026-03-18 08:05:33' },
]
