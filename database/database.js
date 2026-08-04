const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "database.json");

// Create database if it doesn't exist
if (!fs.existsSync(databasePath)) {

    const defaultData = {

        players: {},

        tiers: {},

        queue: [],

        active_tests: {},

        queue_messages: {},

        history: [],

        matches: [],

        testerStats: {},

        settings: {}

    };

    fs.writeFileSync(
        databasePath,
        JSON.stringify(defaultData, null, 4)
    );

}

// Load Database
function load() {

    return JSON.parse(
        fs.readFileSync(databasePath, "utf8")
    );

}

// Save Database
function save(data) {

    fs.writeFileSync(
        databasePath,
        JSON.stringify(data, null, 4)
    );

}

export default {

    load,
    save

};