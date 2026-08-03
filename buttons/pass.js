const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    id: "pass",

    async execute(interaction) {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("settier")
                .setLabel("Set Tier")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({
            content: "✅ Player Passed.\nNow select the player's tier.",
            components: [row],
            ephemeral: true
        });

    }

};