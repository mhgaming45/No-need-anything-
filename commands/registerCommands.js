const { REST, Routes } = require("discord.js");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const commands = [];

const commandFiles = fs
    .readdirSync(path.join(__dirname))
    .filter(file =>
        file.endsWith(".js") &&
        file !== "registerCommands.js"
    );

for (const file of commandFiles) {

    const command = require(path.join(__dirname, file));

    if (command.data) {

        commands.push(command.data.toJSON());

    }

}

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log("🚀 Registering Slash Commands...");

        await rest.put(

            Routes.applicationGuildCommands(

                process.env.CLIENT_ID,
                process.env.GUILD_ID

            ),

            {
                body: commands
            }

        );

        console.log(`✅ Successfully registered ${commands.length} commands.`);

    } catch (err) {

        console.error(err);

    }

})();