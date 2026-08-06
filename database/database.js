const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "database.json");

// Create Database
if (!fs.existsSync(databasePath)) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify({
            players: {},
            queue: [],
            active_tests: {},
            queue_messages: {},
            history: [],
            testerStats: {}
        }, null, 4)
    );

}

// Load Database
function load() {

    try {

        const data = JSON.parse(
            fs.readFileSync(databasePath, "utf8")
        );

        // Fix missing keys
        if (!data.players) data.players = {};
        if (!data.queue) data.queue = [];
        if (!data.active_tests) data.active_tests = {};
        if (!data.queue_messages) data.queue_messages = {};
        if (!data.history) data.history = [];
        if (!data.testerStats) data.testerStats = {};

        return data;

    } catch (err) {

        console.error("Database Load Error:", err);

        return {
            players: {},
            queue: [],
            active_tests: {},
            queue_messages: {},
            history: [],
            testerStats: {}
        };

    }

}

// Save Database
function save(data) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(data, null, 4)
    );

}

module.exports = {
    load,
    save
};