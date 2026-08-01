require("dotenv").config();

require("./database/schema");

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel
    ]
});

// Collections
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// Load Handlers
const handlersPath = path.join(__dirname, "handlers");

if (fs.existsSync(handlersPath)) {
    const handlerFiles = fs.readdirSync(handlersPath)
        .filter(file => file.endsWith(".js"));

    for (const file of handlerFiles) {
        require(path.join(handlersPath, file))(client);
    }
}

// Bot Ready
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Login
client.login(process.env.TOKEN);