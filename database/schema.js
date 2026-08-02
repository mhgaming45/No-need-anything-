const db = require("./database");

// ===============================
// PLAYERS
// ===============================
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

// ===============================
// PLAYER TIERS
// ===============================
db.prepare(`
CREATE TABLE IF NOT EXISTS tiers (

    userId TEXT,
    gamemode TEXT,
    tier TEXT,
    updatedAt TEXT,

    PRIMARY KEY(userId, gamemode)

)
`).run();

// ===============================
// QUEUE
// ===============================
db.prepare(`
CREATE TABLE IF NOT EXISTS queue (

    userId TEXT PRIMARY KEY,
    username TEXT,
    gamemode TEXT,
    joinedAt INTEGER

)
`).run();

// ===============================
// MATCH HISTORY
// ===============================
db.prepare(`
CREATE TABLE IF NOT EXISTS matches (

    matchId TEXT PRIMARY KEY,

    player1 TEXT,
    player2 TEXT,

    gamemode TEXT,

    winner TEXT,
    loser TEXT,

    tester TEXT,

    status TEXT,

    createdAt TEXT

)
`).run();

// ===============================
// QUEUE PANELS
// ===============================
db.prepare(`
CREATE TABLE IF NOT EXISTS queue_messages (

    gamemode TEXT PRIMARY KEY,

    channelId TEXT,

    messageId TEXT

)
`).run();

// ===============================
// BOT SETTINGS
// ===============================
db.prepare(`
CREATE TABLE IF NOT EXISTS settings (

    key TEXT PRIMARY KEY,

    value TEXT

)
`).run();

console.log("==================================");
console.log("✅ SQLite Database Loaded");
console.log("==================================");

module.exports = db;