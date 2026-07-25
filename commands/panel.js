const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Send Register Panel"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📝 Register Testing")
      .setDescription(
`Click the button below to register for testing.

After registering you can choose your gamemode.

━━━━━━━━━━━━━━━━━━`
      );

    const register = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("register")
        .setLabel("Register / Update")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Danger)
    );

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("uhc").setLabel("UHC").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("pot").setLabel("Pot").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("mace").setLabel("Mace").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("nethop").setLabel("NetHop").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("smp").setLabel("SMP").setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("sword").setLabel("Sword").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("axe").setLabel("Axe").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vanilla").setLabel("Vanilla").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("cart").setLabel("Cart").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [embed],
      components: [register, row1, row2]
    });

  }
};