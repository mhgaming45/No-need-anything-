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
  EmbedBuilder,
  PermissionsBitField
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

// ========================================
// LIVE QUEUES
// ========================================

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

// ========================================
// READY EVENT
// ========================================

client.once(Events.ClientReady, () => {

  console.log(`${client.user.tag} is online!`);

});

// ========================================
// INTERACTION CREATE
// ========================================

client.on("interactionCreate", async (interaction) => {

  // ========================================
  // SLASH COMMANDS
  // ========================================

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
// ========================================
// REGISTER BUTTON
// ========================================

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
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("AS / EU / NA")
    .setRequired(true);

  const account = new TextInputBuilder()
    .setCustomId("account")
    .setLabel("Account Type")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Premium / Cracked")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(ign),
    new ActionRowBuilder().addComponents(region),
    new ActionRowBuilder().addComponents(account)
  );

  return interaction.showModal(modal);

}

// ========================================
// REGISTER MODAL
// ========================================

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
      .setLabel("Pot")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("mace")
      .setLabel("Mace")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("nethop")
      .setLabel("NetHop")
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
      "✅ Registration completed successfully!\n\n🎮 Please select your gamemode.",
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

  data.gamemode = mode;

  saveDB(db);

  // Already in queue?
  if (queues[mode].includes(interaction.user.id)) {

    const position =
      queues[mode].indexOf(interaction.user.id) + 1;

    return interaction.reply({
      content:
        `❌ You are already in the **${mode.toUpperCase()}** queue.\n\n` +
        `📍 Position: **#${position}**`,
      ephemeral: true
    });

  }

  queues[mode].push(interaction.user.id);

  const position = queues[mode].length;

  const playersAhead = position - 1;

  // Send queue message

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Joined Queue")
        .setDescription(
          `🎮 **Gamemode:** ${mode.toUpperCase()}\n\n` +
          `📍 **Your Position:** #${position}\n` +
          `👥 **Players Ahead:** ${playersAhead}\n\n` +
          `Please wait for a tester.`
        )
    ],
    ephemeral: true
  });

  // Update queue channel

  const channel = client.channels.cache.get(queueChannels[mode]);

  if (channel) {

    const list = queues[mode]
      .map((id, index) => `${index + 1}. <@${id}>`)
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
// TESTER PANEL - NEXT PLAYER
// ========================================

if (
  interaction.isButton() &&
  interaction.customId === "next_player"
) {

  const mode = interaction.message.embeds[0]?.title
    ?.split(" ")[0]
    ?.toLowerCase();

  if (!mode || !queues[mode]) {
    return interaction.reply({
      content: "❌ Invalid queue.",
      ephemeral: true
    });
  }

  if (queues[mode].length === 0) {
    return interaction.reply({
      content: "❌ Queue is empty.",
      ephemeral: true
    });
  }

  const userId = queues[mode][0];

  const db = loadDB();
  const data = db[`user_${userId}`];

  if (!data) {
    queues[mode].shift();

    return interaction.reply({
      content: "❌ Player data not found.",
      ephemeral: true
    });
  }

  const row = new ActionRowBuilder().addComponents(

    new ButtonBuilder()
      .setCustomId(`pass_${userId}`)
      .setLabel("✅ PASS")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`fail_${userId}`)
      .setLabel("❌ FAIL")
      .setStyle(ButtonStyle.Danger)

  );

  return interaction.reply({

    embeds: [

      new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🎯 Current Test")
        .setDescription(
          `👤 Player: <@${userId}>\n\n` +
          `IGN: **${data.ign}**\n`

// ========================================
// PASS BUTTON
// ========================================

if (
  interaction.isButton() &&
  interaction.customId.startsWith("pass_")
) {

  const userId = interaction.customId.replace("pass_", "");

  const db = loadDB();

  const data = db[`user_${userId}`];

  if (!data) {
    return interaction.reply({
      content: "❌ Player not found.",
      ephemeral: true
    });
  }

  const mode = data.gamemode;

  // Remove player from queue
  queues[mode] = queues[mode].filter(
    id => id !== userId
  );

  // Default Tier
  const rankEarned = "LT5";

  data.tier = rankEarned;

  db[`user_${userId}`] = data;

  saveDB(db);

  // Give tier role (optional)
  if (config.tierRoles && config.tierRoles[rankEarned]) {

    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (member) {

      await member.roles
        .add(config.tierRoles[rankEarned])
        .catch(() => {});

    }

  }

  await interaction.reply({

    content:
      `✅ **${data.ign}** passed the test!\n\n🏆 Tier: **${rankEarned}**`,

    ephemeral: true

  });

  // Update Queue Channel

  const channel = client.channels.cache.get(queueChannels[mode]);

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

  // DM Player

  const user = await client.users
    .fetch(userId)
    .catch(() => null);

  if (user) {

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("🎉 Test Passed")
          .setDescription(
            `Congratulations!\n\n` +
            `🏆 Tier Earned: **${rankEarned}**\n` +
            `🎮 Gamemode: **${mode.toUpperCase()}**`
          )
      ]
    }).catch(() => {});

  }

  return;

}