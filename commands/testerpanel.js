const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testerpanel")
    .setDescription("Send Tester Panel"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("🎯 Tester Panel")
      .setDescription(
`Welcome Tester!

Use the button below to take the next player from queue.

━━━━━━━━━━━━━━━━━━`
      );

    const select = new StringSelectMenuBuilder()
.setCustomId("select_test_mode")
.setPlaceholder("🎮 Select Gamemode")
.addOptions(
  {
    label: "Sword",
    value: "sword",
    emoji: "⚔️"
  },
  {
    label: "Axe",
    value: "axe",
    emoji: "🪓"
  },
  {
    label: "Crystal",
    value: "crystal",
    emoji: "💎"
  },
  {
    label: "Mace",
    value: "mace",
    emoji: "🔨"
  },
  {
    label: "UHC",
    value: "uhc",
    emoji: "🏹"
  },
  {
    label: "SMP",
    value: "smp",
    emoji: "🌎"
  },
  {
    label: "Netherite Pot",
    value: "nethop",
    emoji: "🔥"
  },
  {
    label: "Diamond Pot",
    value: "pot",
    emoji: "💠"
  },
  {
    label: "Cart",
    value: "cart",
    emoji: "🏎️"
  }
);

const row1 = new ActionRowBuilder()
.addComponents(select);


const row2 = new ActionRowBuilder()
.addComponents(
  new ButtonBuilder()
    .setCustomId("next_player")
    .setLabel("🎯 Next Player")
    .setStyle(ButtonStyle.Primary)
);