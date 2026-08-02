const db = require("./database");

// ========================================
// PLAYERS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS players (

    userId TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    displayName TEXT,
    avatar TEXT,

    ign TEXT NOT NULL,
    region TEXT NOT NULL,
    accountType TEXT NOT NULL,

    elo INTEGER DEFAULT 1000,

    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,

    registeredAt TEXT

)
`).run();

// ========================================
// PLAYER TIERS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS tiers (

    userId TEXT,
    gamemode TEXT,
    tier TEXT,
    updatedAt TEXT,

    PRIMARY KEY(userId, gamemode)

)
`).run();

// ========================================
// QUEUE
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS queue (

    userId TEXT PRIMARY KEY,
    username TEXT,
    gamemode TEXT,
    joinedAt INTEGER

)
`).run();

// ========================================
// ACTIVE TESTS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS active_tests (

    gamemode TEXT PRIMARY KEY,

    testerId TEXT,
    playerId TEXT,

    startedAt INTEGER

)
`).run();

// ========================================
// MATCH HISTORY
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS matches (

    matchId TEXT PRIMARY KEY,

    player1 TEXT,
    player2 TEXT,

    gamemode TEXT,

    winner TEXT,
    loser TEXT,

    tester TEXT,

    tier TEXT,

    status TEXT,

    createdAt TEXT

)
`).run();

// ========================================
// QUEUE PANELS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS queue_messages (

    gamemode TEXT PRIMARY KEY,

    channelId TEXT,

    messageId TEXT

)
`).run();

// ========================================
// BOT SETTINGS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS settings (

    key TEXT PRIMARY KEY,

    value TEXT

)
`).run();

// ========================================
// TESTER STATS
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS tester_stats (

    testerId TEXT PRIMARY KEY,

    totalTests INTEGER DEFAULT 0,

    ht5 INTEGER DEFAULT 0,
    ht4 INTEGER DEFAULT 0,
    ht3 INTEGER DEFAULT 0,
    ht2 INTEGER DEFAULT 0,
    ht1 INTEGER DEFAULT 0,

    lt1 INTEGER DEFAULT 0,
    lt2 INTEGER DEFAULT 0,
    lt3 INTEGER DEFAULT 0,
    lt4 INTEGER DEFAULT 0,
    lt5 INTEGER DEFAULT 0

)
`).run();

// ========================================
// PLAYER HISTORY
// ========================================
db.prepare(`
CREATE TABLE IF NOT EXISTS history (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    userId TEXT,

    gamemode TEXT,

    oldTier TEXT,
    newTier TEXT,

    testerId TEXT,

    createdAt TEXT

)
`).run();

console.log("====================================");
console.log("✅ SQLite Database Loaded");
console.log("✅ All Tables Loaded Successfully");
console.log("====================================");

module.exports = db;