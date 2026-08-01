const db = require("./database");

// Players
db.prepare(`
CREATE TABLE IF NOT EXISTS players (
    userId TEXT PRIMARY KEY,
    username TEXT,
    ign TEXT,
    region TEXT,
    elo INTEGER DEFAULT 1000,
    totalWins INTEGER DEFAULT 0,
    totalLosses INTEGER DEFAULT 0,
    registeredAt TEXT
)
`).run();

// Tiers
db.prepare(`
CREATE TABLE IF NOT EXISTS tiers (
    userId TEXT,
    gamemode TEXT,
    tier TEXT,
    updatedAt TEXT,
    PRIMARY KEY(userId, gamemode)
)
`).run();

// Queue
db.prepare(`
CREATE TABLE IF NOT EXISTS queue (
    userId TEXT,
    gamemode TEXT,
    joinedAt TEXT
)
`).run();

// Matches
db.prepare(`
CREATE TABLE IF NOT EXISTS matches (
    matchId TEXT PRIMARY KEY,
    player1 TEXT,
    player2 TEXT,
    gamemode TEXT,
    winner TEXT,
    loser TEXT,
    status TEXT,
    createdAt TEXT
)
`).run();

console.log("✅ Database Loaded");