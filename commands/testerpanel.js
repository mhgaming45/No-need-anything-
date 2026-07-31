const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("next_player")
          .setLabel("🎯 Next Player")
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });

  }
};