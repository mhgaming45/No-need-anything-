require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const config = require("./config/config.json");

// ================================
// DATABASE
// ================================

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

// ================================
// QUEUE CHANNELS
// ================================

const queueChannels = {
  uhc: config.queueChannels.uhc,
  pot: config.queueChannels.pot,
  mace: config.queueChannels.mace,
  nethop: config.queueChannels.nethop,
  smp: config.queueChannels.smp,
  sword: config.queueChannels.sword,
  axe: config.queueChannels.axe,
  vanilla: config.queueChannels.vanilla,
  cart: config.queueChannels.cart
};

// ================================
// LIVE QUEUE
// ================================

const queues = {
  uhc: [],
  pot: [],
  mace: [],
  nethop: [],
  smp: [],
  sword: [],
  axe: [],
  vanilla: [],
  cart: []
};

// ================================
// CLIENT
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
// ================================
// LOAD COMMANDS
// ================================

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(
    path.join(commandsPath, file)
  );

  if (command.data && command.execute) {
    client.commands.set(
      command.data.name,
      command
    );
  }
}

// ================================
// READY
// ================================

client.once(Events.ClientReady, () => {

  console.log(`${client.user.tag} is online!`);

});

// ================================
// INTERACTION CREATE
// ================================

client.on("interactionCreate", async (interaction) => {

  // ================================
  // SLASH COMMANDS
  // ================================

  if (interaction.isChatInputCommand()) {

    const command = client.commands.get(
      interaction.commandName
    );

    if (!command) return;

    try {

      await command.execute(interaction);

    } catch (err) {

      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ An error occurred while executing this command.",
          ephemeral: true
        });
      }

    }

    return;
  }
  // ================================
  // REGISTER BUTTON
  // ================================

  if (
    interaction.isButton() &&
    interaction.customId === "register"
  ) {

    const modal = new ModalBuilder()
      .setCustomId("register_modal")
      .setTitle("Player Register");

    const ign = new TextInputBuilder()
      .setCustomId("ign")
      .setLabel("Minecraft Username")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const region = new TextInputBuilder()
      .setCustomId("region")
      .setLabel("Region")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const account = new TextInputBuilder()
      .setCustomId("account")
      .setLabel("Account Type")
      .setPlaceholder("Premium / Cracked")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ign),
      new ActionRowBuilder().addComponents(region),
      new ActionRowBuilder().addComponents(account)
    );

    return interaction.showModal(modal);
  }

  // ================================
  // REGISTER MODAL
  // ================================

  if (
    interaction.isModalSubmit() &&
    interaction.customId === "register_modal"
  ) {

    const db = loadDB();

    db[`user_${interaction.user.id}`] = {
      ign: interaction.fields.getTextInputValue("ign"),
      region: interaction.fields.getTextInputValue("region"),
      account: interaction.fields.getTextInputValue("account"),
      gamemode: null
    };

    saveDB(db);

    if (config.queueRole) {
      await interaction.member.roles
        .add(config.queueRole)
        .catch(() => {});
    }