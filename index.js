require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");

const registerCommands = require("./commands/registerCommands");

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent

    ],

    partials: [

        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember

    ]

});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

require("./handlers/commandHandler")(client);
require("./handlers/eventHandler")(client);

// Load Buttons
const buttonFiles = fs.readdirSync(
    path.join(__dirname, "buttons")
);

for (const file of buttonFiles) {

    if (!file.endsWith(".js")) continue;

    const button = require(`./buttons/${file}`);

    client.buttons.set(button.id, button);

    console.log(`✅ Loaded Button: ${button.id}`);

}

// Load Modals
const modalFiles = fs.readdirSync(
    path.join(__dirname, "modals")
);

for (const file of modalFiles) {

    if (!file.endsWith(".js")) continue;

    const modal = require(`./modals/${file}`);

    client.modals.set(modal.id, modal);

    console.log(`✅ Loaded Modal: ${modal.id}`);

}

// Ready
client.once("ready", async () => {

    console.log("=================================");
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`🌍 Servers : ${client.guilds.cache.size}`);
    console.log("=================================");

    await registerCommands(client);

});

// Error Handling
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.TOKEN);