const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.commands = new Map();

    const commandPath = path.join(__dirname, "..", "commands");

    const commandFiles = fs
        .readdirSync(commandPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(path.join(commandPath, file));

        if (!command.name) {
            console.log(`❌ ${file} is missing command name.`);
            continue;
        }

        client.commands.set(command.name, command);

        console.log(`✅ Loaded Command: ${command.name}`);

    }

};