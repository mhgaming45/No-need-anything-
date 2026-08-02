require("dotenv").config();

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
        GatewayIntentBits.MessageContent

    ],

    partials: [

        Partials.Channel,
        Partials.Message,
        Partials.User

    ]

});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// =========================
// DATABASE
// =========================
require("./database/database");

// =========================
// COMMANDS
// =========================

const commandFiles = fs.readdirSync("./commands")
.filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    client.commands.set(

        command.data.name,
        command

    );

}

// =========================
// BUTTONS
// =========================

const buttonFiles = fs.readdirSync("./buttons")
.filter(file => file.endsWith(".js"));

for (const file of buttonFiles) {

    const button = require(`./buttons/${file}`);

    client.buttons.set(

        button.id,
        button

    );

}

// =========================
// MODALS
// =========================

const modalFiles = fs.readdirSync("./modals")
.filter(file => file.endsWith(".js"));

for (const file of modalFiles) {

    const modal = require(`./modals/${file}`);

    client.modals.set(

        modal.id,
        modal

    );

}

// =========================
// EVENTS
// =========================

const eventFiles = fs.readdirSync("./events")
.filter(file => file.endsWith(".js"));

for (const file of eventFiles) {

    const event = require(`./events/${file}`);

    if (event.once) {

        client.once(

            event.name,

            (...args) => event.execute(...args, client)

        );

    } else {

        client.on(

            event.name,

            (...args) => event.execute(...args, client)

        );

    }

}

// =========================
// READY
// =========================

client.once("ready", () => {

    console.log("==============================");
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log("==============================");

});

// =========================
// ERROR HANDLER
// =========================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);