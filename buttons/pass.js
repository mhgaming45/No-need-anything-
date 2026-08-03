const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    id: "pass",

    async execute(interaction) {

        const parts = interaction.customId.split("_");

        // pass_uhc_123456789
        const gamemode = parts[1];
        const userId = parts[2];

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Player Passed")
            .setDescription(
                `Player: <@${userId}>\n\n` +
                `Select a tier for this player.`
            )
            .setFooter({
                text: "Professional Tier Testing"
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`set_tier_${gamemode}_${userId}`)
                    .setLabel("SET TIER")
                    .setEmoji("🏆")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.update({

            embeds: [embed],
            components: [row]

        });

    }

};