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
  if (
  interaction.isButton() &&
  interaction.customId === "register"
) {

  const modal = new ModalBuilder()
    .setCustomId("register_modal")
    .setTitle("Player Registration");

  const ign = new TextInputBuilder()
    .setCustomId("ign")
    .setLabel("Minecraft Username")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const region = new TextInputBuilder()
    .setCustomId("region")
    .setLabel("Region")
    .setPlaceholder("AS / EU / NA")
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
  if (
  interaction.isModalSubmit() &&
  interaction.customId === "register_modal"
) {

  const db = loadDB();

  db[`user_${interaction.user.id}`] = {

    ign: interaction.fields.getTextInputValue("ign"),

    region: interaction.fields.getTextInputValue("region"),

    account: interaction.fields.getTextInputValue("account"),

    gamemode: null,

    tier: null,

    wins: 0,

    losses: 0

  };

  saveDB(db);

  if (config.queueRole) {

    await interaction.member.roles
      .add(config.queueRole)
      .catch(() => {});

  }

  const row1 = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId("uhc")
      .setLabel("UHC")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("pot")
      .setLabel("Diamond Pot")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("mace")
      .setLabel("Mace")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("nethop")
      .setLabel("Netherite Pot")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("smp")
      .setLabel("SMP")
      .setStyle(ButtonStyle.Secondary)

  );

  const row2 = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId("sword")
      .setLabel("Sword")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("axe")
      .setLabel("Axe")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("vanilla")
      .setLabel("Vanilla")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("cart")
      .setLabel("Cart")
      .setStyle(ButtonStyle.Secondary)

  );

  return interaction.reply({

    content:
      "✅ Registration Complete!\n\n🎮 Select your gamemode below.",

    components: [row1, row2],

    ephemeral: true

  });

}
  // ========================================
// GAMEMODE BUTTONS
// ========================================

const gamemodes = [
  "uhc",
  "pot",
  "mace",
  "nethop",
  "smp",
  "sword",
  "axe",
  "vanilla",
  "cart"
];

if (
  interaction.isButton() &&
  gamemodes.includes(interaction.customId)
) {

  const db = loadDB();

  const data = db[`user_${interaction.user.id}`];

  if (!data) {
    return interaction.reply({
      content: "❌ Please register first.",
      ephemeral: true
    });
  }

  const mode = interaction.customId;

  // Already in another queue?
  for (const queue of Object.values(queues)) {
    if (queue.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ You are already in a queue.",
        ephemeral: true
      });
    }
  }

  data.gamemode = mode;
  db[`user_${interaction.user.id}`] = data;
  saveDB(db);

  queues[mode].push(interaction.user.id);

  const position = queues[mode].length;
  const playersAhead = position - 1;

  // Give Gamemode Role
  if (
    config.roles &&
    config.roles[mode]
  ) {

    // Remove old gamemode roles
    for (const roleId of Object.values(config.roles)) {

      await interaction.member.roles
        .remove(roleId)
        .catch(() => {});

    }

    await interaction.member.roles
      .add(config.roles[mode])
      .catch(() => {});
  }

  await interaction.reply({

    embeds: [

      new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Joined Queue")
        .setDescription(
          `🎮 Gamemode: **${mode.toUpperCase()}**\n\n` +
          `📍 Position: **#${position}**\n` +
          `👥 Players Ahead: **${playersAhead}**`
        )

    ],

    ephemeral: true

  });

  // ========================================
  // UPDATE QUEUE CHANNEL
  // ========================================

  const channel = client.channels.cache.get(
    queueChannels[mode]
  );

  if (channel) {

    const list = queues[mode]
      .map((id, index) =>
        `${index + 1}. <@${id}>`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(`${mode.toUpperCase()} Queue`)
      .setDescription(
        list || "No players in queue."
      );

    const messages = await channel.messages.fetch();

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    if (botMessage) {

      await botMessage.edit({
        embeds: [embed]
      });

    } else {

      await channel.send({
        embeds: [embed]
      });

    }

  }

  return;

}
// ========================================
// LEAVE QUEUE
// ========================================

if (
  interaction.isButton() &&
  interaction.customId === "leave_queue"
) {

  let found = false;
  let mode = null;

  // Find player in queues
  for (const gamemode of Object.keys(queues)) {

    const index = queues[gamemode].indexOf(interaction.user.id);

    if (index !== -1) {

      queues[gamemode].splice(index, 1);

      found = true;
      mode = gamemode;

      break;
    }

  }

  if (!found) {

    return interaction.reply({
      content: "❌ You are not in any queue.",
      ephemeral: true
    });

  }

  // Remove Gamemode Role
  if (config.roles) {

    for (const roleId of Object.values(config.roles)) {

      await interaction.member.roles
        .remove(roleId)
        .catch(() => {});

    }

  }

  // Reset database gamemode
  const db = loadDB();

  if (db[`user_${interaction.user.id}`]) {

    db[`user_${interaction.user.id}`].gamemode = null;

    saveDB(db);

  }

  await interaction.reply({
    content: `✅ You left the **${mode.toUpperCase()}** queue.`,
    ephemeral: true
  });

  // ========================================
  // UPDATE QUEUE CHANNEL
  // ========================================

  const channel = client.channels.cache.get(
    queueChannels[mode]
  );

  if (channel) {

    const list = queues[mode]
      .map((id, i) => `${i + 1}. <@${id}>`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle(`${mode.toUpperCase()} Queue`)
      .setDescription(
        list || "No players in queue."
      );

    const messages = await channel.messages.fetch();

    const botMessage = messages.find(
      m => m.author.id === client.user.id
    );

    if (botMessage) {

      await botMessage.edit({
        embeds: [embed]
      });

    } else {

      await channel.send({
        embeds: [embed]
      });

    }

  }

  return;

}
// ========================================
// REFRESH ALL QUEUE CHANNELS
// ========================================

async function updateQueue(mode) {

  const channel = client.channels.cache.get(queueChannels[mode]);

  if (!channel) return;

  const list = queues[mode]
    .map((id, index) => `${index + 1}. <@${id}>`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle(`${mode.toUpperCase()} Queue`)
    .setDescription(
      list || "No players in queue."
    )
    .setFooter({
      text: `Players Waiting: ${queues[mode].length}`
    });

  const messages = await channel.messages.fetch();

  const botMessage = messages.find(
    m => m.author.id === client.user.id
  );

  if (botMessage) {

    await botMessage.edit({
      embeds: [embed]
    });

  } else {

    await channel.send({
      embeds: [embed]
    });

  }

}

// ========================================
// UPDATE EVERY QUEUE
// ========================================

async function refreshAllQueues() {

  for (const mode of Object.keys(queues)) {

    await updateQueue(mode);

  }

}

// ========================================
// AUTO REFRESH
// ========================================

setInterval(async () => {

  try {

    await refreshAllQueues();

  } catch (err) {

    console.error(err);

  }

}, 30000);

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