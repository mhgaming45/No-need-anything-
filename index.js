require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  Collection,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const { QuickDB } = require("quick.db");
const db = new QuickDB();

const config = require("./config/config.json");

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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("interactionCreate", async (interaction) => {

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
    }

    return;
  }
  // Register Button
  if (interaction.isButton() && interaction.customId === "register") {

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
      .setLabel("Account Type (Premium / Cracked)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ign),
      new ActionRowBuilder().addComponents(region),
      new ActionRowBuilder().addComponents(account)
    );

    return interaction.showModal(modal);
  }

  // Modal Submit
  if (interaction.isModalSubmit() && interaction.customId === "register_modal") {

    const ign = interaction.fields.getTextInputValue("ign");
    const region = interaction.fields.getTextInputValue("region");
    const account = interaction.fields.getTextInputValue("account");

    await db.set(`user_${interaction.user.id}`, {
      ign,
      region,
      account,
      gamemode: null
    });

    try {
      await interaction.member.roles.add(config.queueRole);
    } catch (err) {
      console.log(err);
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
      content: "✅ Registration complete!\n\nNow choose your gamemode.",
      components: [row1, row2],
      ephemeral: true
    });
  }
  // Gamemode Buttons
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

    if (!gamemodes.includes(interaction.customId)) return;

    const data = await db.get(`user_${interaction.user.id}`);

    if (!data) {
      return interaction.reply({
        content: "❌ Please register first.",
        ephemeral: true
      });
    }

    // Save Gamemode
    data.gamemode = interaction.customId;
    await db.set(`user_${interaction.user.id}`, data);

    // Remove old gamemode roles
    for (const id of Object.values(config.roles)) {
      if (interaction.member.roles.cache.has(id)) {
        await interaction.member.roles.remove(id).catch(() => {});
      }
    }

    // Give selected role
    await interaction.member.roles
      .add(config.roles[interaction.customId])
      .catch(() => {});

    // Send queue message
    const channel = client.channels.cache.get(
      queueChannels[interaction.customId]
    );

    if (channel) {

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📝 New Testing Queue")
        .addFields(
          { name: "Player", value: `<@${interaction.user.id}>`, inline: false },
          { name: "IGN", value: data.ign, inline: true },
          { name: "Region", value: data.region, inline: true },
          { name: "Account", value: data.account, inline: true },
          { name: "Gamemode", value: interaction.customId.toUpperCase(), inline: true }
        )
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
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
        components: [buttons]
      });
    }

    return interaction.reply({
      content: `✅ You selected **${interaction.customId.toUpperCase()}**.\nYour testing request has been sent to the queue.`,
      ephemeral: true
    });
  }