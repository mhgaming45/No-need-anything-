const db = require("./database");

// Players Table
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

// Queue Table
db.prepare(`
CREATE TABLE IF NOT EXISTS queue (

    userId TEXT PRIMARY KEY,

    username TEXT,

    gamemode TEXT,

    joinedAt TEXT

)
`).run();

// Queue Messages
db.prepare(`
CREATE TABLE IF NOT EXISTS queue_messages (
    gamemode TEXT PRIMARY KEY,
    channelId TEXT,
    messageId TEXT
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

console.log("✅ Database Loaded Successfully");