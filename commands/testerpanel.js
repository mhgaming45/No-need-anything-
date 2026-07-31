const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
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
`Select a gamemode below and press **Next Player**.

━━━━━━━━━━━━━━━━━━━━`
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
          label: "UHC",
          value: "uhc",
          emoji: "🏹"
        },
        {
          label: "Diamond Pot",
          value: "pot",
          emoji: "💎"
        },
        {
          label: "Netherite Pot",
          value: "nethop",
          emoji: "🔥"
        },
        {
          label: "SMP",
          value: "smp",
          emoji: "🌍"
        },
        {
          label: "Mace",
          value: "mace",
          emoji: "🔨"
        },
        {
          label: "Cart",
          value: "cart",
          emoji: "🏎️"
        },
        {
          label: "Vanilla",
          value: "vanilla",
          emoji: "🌿"
        }
      );

    const row = new ActionRowBuilder().addComponents(select);

const row2 = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("next_player")
    .setLabel("🎯 Next Player")
    .setStyle(ButtonStyle.Primary)
);

await interaction.reply({
  embeds: [embed],
  components: [row, row2]
});