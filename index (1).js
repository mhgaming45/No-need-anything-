require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const config = require("./config/config.json");

// ========================================
// DATABASE
// ========================================

const DB_FILE = "./database.json";

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "{}");
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ========================================
// QUEUE CHANNELS
// ========================================

const queueChannels = config.queueChannels || {};

// ========================================
// LIVE QUEUES
// ========================================

const queues = {
  sword: [],
  axe: [],
  crystal: [],
  mace: [],
  uhc: [],
  smp: [],
  nethop: [],
  pot: [],
  cart: [],
  vanilla: []
};

// ========================================
// CLIENT
// ========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// ========================================
// LOAD COMMANDS
// ========================================

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {

    const command = require(path.join(commandsPath, file));

    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded Command: ${command.data.name}`);
    }

  }

}

// ========================================
// READY
// ========================================

client.once(Events.ClientReady, () => {

  console.log("==============================");
  console.log(`${client.user.tag} is online!`);
  console.log("AK Tire Testing Bot Ready");
  console.log("==============================");

});

// ========================================
// INTERACTION CREATE
// ========================================

client.on("interactionCreate", async (interaction) => {

  // Slash Commands
  if (interaction.isChatInputCommand()) {

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {

      await command.execute(interaction);

    } catch (err) {

      console.error(err);

      if (!interaction.replied && !interaction.deferred) {

        await interaction.reply({
          content: "❌ Something went wrong.",
          ephemeral: true
        });

      }

    }

    return;
  }

  // =====================================================
  // PART 2+
  // Register Button
  // Register Modal
  // Queue
  // Tester Panel
  // Next Player
  // PASS
  // FAIL
  // Tier Modal
  // Logs
  // =====================================================

});

// ========================================
// KEEP ALIVE
// ========================================

http
  .createServer((req, res) => {

    res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    res.end("Bot is running!");

  })
  .listen(process.env.PORT || 3000, () => {

    console.log("Web server started.");

  });

// ========================================
// ERROR HANDLING
// ========================================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ========================================
// LOGIN
// ========================================

client.login(process.env.TOKEN);