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
// ================================
// CLAIM / PASS / FAIL BUTTONS
// ================================

if (interaction.isButton()) {

  const parts = interaction.customId.split("_");

  if (parts.length < 2) return;

  const action = parts[0];
  const userId = parts[1];

  if (!["claim", "pass", "fail"].includes(action)) return;

  // ================================
  // CLAIM BUTTON
  // ================================

  if (action === "claim") {

    const oldEmbed = interaction.message.embeds[0];

    const embed = EmbedBuilder.from(oldEmbed)
      .setFooter({
        text: `Claimed by ${interaction.user.tag}`
      });

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(`claim_${userId}`)
        .setLabel("Claimed")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId(`pass_${userId}`)
        .setLabel("Pass")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`fail_${userId}`)
        .setLabel("Fail")
        .setStyle(ButtonStyle.Danger)

    );

    await interaction.update({
      embeds: [embed],
      components: [row]
    });

    return;
  }

  // ================================
  // PASS BUTTON
  // ================================

  if (action === "pass") {

    const modal = new ModalBuilder()
      .setCustomId(`pass_modal_${userId}`)
      .setTitle("Test Passed");

    const before = new TextInputBuilder()
      .setCustomId("rank_before")
      .setLabel("Rank Before")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const earned = new TextInputBuilder()
      .setCustomId("rank_earned")
      .setLabel("Rank Earned")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const notes = new TextInputBuilder()
      .setCustomId("notes")
      .setLabel("Notes")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(before),
      new ActionRowBuilder().addComponents(earned),
      new ActionRowBuilder().addComponents(notes)
    );

    return interaction.showModal(mod
  // ================================
  // FAIL BUTTON
  // ================================

  if (action === "fail") {

    const modal = new ModalBuilder()
      .setCustomId(`fail_modal_${userId}`)
      .setTitle("Test Failed");

    const reason = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Failure Reason")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(reason)
    );

    return interaction.showModal(modal);
  }
}

// ================================
// PASS / FAIL MODALS
// ================================

if (interaction.isModalSubmit()) {

  if (interaction.customId.startsWith("pass_modal_")) {

        // ================================
    // PASS MODAL SUBMIT
    // ================================

    if (interaction.customId.startsWith("pass_modal_")) {

      const userId =
        interaction.customId.replace("pass_modal_", "");

      const rankBefore =
        interaction.fields.getTextInputValue("rank_before");

      const rankEarned =
        interaction.fields.getTextInputValue("rank_earned");

      const notes =
        interaction.fields.getTextInputValue("notes") ||
        "No notes provided.";

      const db = loadDB();
      const data = db[`user_${userId}`];

      if (!data) {
        return interaction.reply({
          content: "❌ Player data not found.",
          ephemeral: true
        });
      }

      // Remove from queue
      if (queues[data.gamemode]) {
        queues[data.gamemode] =
          queues[data.gamemode].filter(
            id => id !== userId
          );
      }

      // Remove Queue Role
      try {

        const member =
          await interaction.guild.members.fetch(userId);

        if (config.queueRole) {
          await member.roles
            .remove(config.queueRole)
            .catch(() => {});
        }

      } catch (err) {
        console.log(err);
      }

      const resultChannel =
        client.channels.cache.get(config.logChannel);

      if (resultChannel) {
        const resultEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`🏆 ${data.ign}'s Test Results`)
          .addFields(
            {
              name: "Player",
              value: `<@${userId}>`
            },
            {
              name: "Tester",
              value: `${interaction.user}`
            },
            {
              name: "Rank Before",
              value: rankBefore,
              inline: true
            },
            {
              name: "Rank Earned",
              value: rankEarned,
              inline: true
            },
            {
              name: "Gamemode",
              value: data.gamemode.toUpperCase(),
              inline: true
            },
            {
              name: "Notes",
              value: notes
            }
          )
          .setTimestamp();

        await resultChannel.send({
          embeds: [resultEmbed]
        });
      }

      return interaction.reply({
        content:
          `✅ **${data.ign}** has passed!\n🏆 Rank Earned: **${rankEarned}**`,
        ephemeral: true
      });

    }

  if (interaction.customId.startsWith("fail_modal_")) {

          const userId =
        interaction.customId.replace("fail_modal_", "");

      const reason =
        interaction.fields.getTextInputValue("reason");

      const db = loadDB();
      const data = db[`user_${userId}`];

      if (!data) {
        return interaction.reply({
          content: "❌ Player data not found.",
          ephemeral: true
        });
      }

      // Remove from queue
      if (queues[data.gamemode]) {
        queues[data.gamemode] =
          queues[data.gamemode].filter(
            id => id !== userId
          );
      }

      // Remove Queue Role
      try {

        const member =
          await interaction.guild.members.fetch(userId);

        if (config.queueRole) {
          await member.roles
            .remove(config.queueRole)
            .catch(() => {});
        }

      } catch (err) {
        console.log(err);
      }

      const resultChannel =
        client.channels.cache.get(config.logChannel);

      if (resultChannel) {

        const resultEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle(`❌ ${data.ign}'s Test Results`)
          .addFields(
            {
              name: "Player",
              value: `<@${userId}>`
            },
            {
              name: "Tester",
              value: `${interaction.user}`
            },
            {
              name: "Gamemode",
              value: data.gamemode.toUpperCase(),
              inline: true
            },
            {
              name: "Failure Reason",
              value: reason
            }
          )
          .setTimestamp();

        await resultChannel.send({
          embeds: [resultEmbed]
        });
      }

      return interaction.reply({
        content:
          `❌ **${data.ign}** has failed.\nReason: **${reason}**`,
        ephemeral: true
      });

    }
  }
}