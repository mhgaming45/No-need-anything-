import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} from "discord.js";

// Required for __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
// JSON DATABASE
// ======================
import database from "./database/database.js";
client.db = database;

// ======================
// LOAD COMMANDS
// ======================
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(`file://${filePath}`);
        if (command.default && command.default.data) {
            client.commands.set(command.default.data.name, command.default);
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
        const filePath = path.join(buttonsPath, file);
        const button = await import(`file://${filePath}`);
        client.buttons.set(button.default.id, button.default);
    }
}

// ======================
// LOAD MODALS
// ======================
const modalsPath = path.join(__dirname, "modals");

if (fs.existsSync(modalsPath)) {
    const modalFiles = fs.readdirSync(modalsPath).filter(f => f.endsWith(".js"));

    for (const file of modalFiles) {
        const filePath = path.join(modalsPath, file);
        const modal = await import(`file://${filePath}`);
        client.modals.set(modal.default.id, modal.default);
    }
}

// ======================
// LOAD EVENTS
// ======================
const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const eventModule = await import(`file://${filePath}`);
        const event = eventModule.default;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// ======================
// LOGIN
// ======================
client.login(process.env.TOKEN);
