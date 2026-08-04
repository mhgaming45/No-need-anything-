const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.json");

// Agar database.json nahi hai to automatically bana dega
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
        dbPath,
        JSON.stringify({
            players: {},
            tiers: {},
            queue: [],
            active_tests: {},
            queue_messages: {},
            tester_stats: {},
            history: [],
            settings: {}
        }, null, 4)
    );
}

// Load Database
function load() {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

// Save Database
function save(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
}

module.exports = {
    load,
    save
};