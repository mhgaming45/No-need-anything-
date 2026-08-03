require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require("discord.js");

// Load Database
require("./database/database");

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

// ======================
// LOAD COMMANDS
// ======================

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        }
    }
}

// ======================
// LOAD BUTTONS
// ======================

const buttonsPath = path.join(__dirname, "buttons");

if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith(".js"));

    for (const file of buttonFiles) {
        const button = require(path.join(buttonsPath, file));

        if (button.id && button.execute) {
            client.buttons.set(button.id, button);
        }
    }
}

// ======================
// LOAD MODALS
// ======================

const modalsPath = path.join(__dirname, "modals");

if (fs.existsSync(modalsPath)) {
    const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith(".js"));

    for (const file of modalFiles) {
        const modal = require(path.join(modalsPath, file));

        if (modal.id && modal.execute) {
            client.modals.set(modal.id, modal);
        }
    }
}

// ======================
// LOAD EVENTS
// ======================

const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// ======================
// READY
// ======================

client.once("ready", () => {
    console.log("=================================");
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log("=================================");
});

// ======================
// INTERACTION HANDLER
// ======================

client.on("interactionCreate", async interaction => {

    try {

        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            await command.execute(interaction);

        }

        else if (interaction.isButton()) {

            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            await button.execute(interaction);

        }

        else if (interaction.isModalSubmit()) {

            const modal = client.modals.get(interaction.customId);

            if (!modal) return;

            await modal.execute(interaction);

        }

    } catch (err) {

        console.error(err);

        if (interaction.replied || interaction.deferred) {

            interaction.followUp({
                content: "❌ An error occurred.",
                ephemeral: true
            }).catch(() => {});

        } else {

            interaction.reply({
                content: "❌ An error occurred.",
                ephemeral: true
            }).catch(() => {});

        }

    }

});

// ======================
// ERROR HANDLER
// ======================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ======================
// LOGIN
// ======================

client.login(process.env.TOKEN);