const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    const commandsPath = path.join(__dirname, "..", "commands");

    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
    }

    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));

        if (!command.data || !command.execute) {
            console.log(`[WARNING] ${file} is missing data or execute.`);
            continue;
        }

        client.commands.set(command.data.name, command);
        console.log(`[COMMAND] Loaded ${command.data.name}`);
    }
};