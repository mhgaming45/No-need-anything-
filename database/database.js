const Database = require("better-sqlite3");
const path = require("path");

// Database File
const db = new Database(
    path.join(__dirname, "database.sqlite")
);

// Better Performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = 10000");
db.pragma("temp_store = MEMORY");

// Load Tables
require("./schema");

module.exports = db;