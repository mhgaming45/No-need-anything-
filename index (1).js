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

  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
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
// INTERACTION
// ================================

client.on("interactionCreate", async (interaction) => {

// Slash Commands

if (interaction.isChatInputCommand()) {

  const command =
    client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
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
      "✅ Registration complete!\n\nChoose your gamemode.",
    components: [row1, row2],
    ephemeral: true
  });
}
// ================================
// GAMEMODE BUTTONS
// ================================

if (interaction.isButton()) {

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

  if (gamemodes.includes(interaction.customId)) {

    const db = loadDB();
    const data = db[`user_${interaction.user.id}`];

    if (!data) {
      return interaction.reply({
        content: "❌ Please register first.",
        ephemeral: true
      });
    }

    // Save gamemode
    data.gamemode = interaction.customId;
    db[`user_${interaction.user.id}`] = data;
    saveDB(db);

    // Remove old queue entry
    queues[interaction.customId] =
      queues[interaction.customId].filter(
        id => id !== interaction.user.id
      );

    // Add to queue
    queues[interaction.customId].push(interaction.user.id);

    // Queue Position
    const position =
      queues[interaction.customId].indexOf(interaction.user.id) + 1;

    // Remove old roles
    for (const id of Object.values(config.roles)) {
      if (interaction.member.roles.cache.has(id)) {
        await interaction.member.roles.remove(id).catch(() => {});
      }
    }

    // Give selected role
    if (config.roles[interaction.customId]) {
      await interaction.member.roles
        .add(config.roles[interaction.customId])
        .catch(() => {});
    }

    const channel =
      client.channels.cache.get(
        queueChannels[interaction.customId]
      );

    if (channel) {

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📝 New Testing Queue")
        .addFields(
          {
            name: "Player",
            value: `<@${interaction.user.id}>`
          },
          {
            name: "IGN",
            value: data.ign,
            inline: true
          },
          {
            name: "Region",
            value: data.region,
            inline: true
          },
          {
            name: "Account",
            value: data.account,
            inline: true
          },
          {
            name: "Gamemode",
            value: interaction.customId.toUpperCase(),
            inline: true
          },
          {
            name: "Queue Position",
            value: `#${position}`,
            inline: true
          }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`claim_${interaction.user.id}`)
          .setLabel("Claim")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId(`pass_${interaction.user.id}`)
          .setLabel("Pass")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`fail_${interaction.user.id}`)
          .setLabel("Fail")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        embeds: [embed],
        components: [row]
      });
    }

    return interaction.reply({
      content:
`✅ You joined the **${interaction.customId.toUpperCase()}** queue.

📍 Your Queue Position: **#${position}**`,
      ephemeral: true
    });
  }
}