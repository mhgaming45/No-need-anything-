const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    id: "pass",

    async execute(interaction) {

        const [, gamemode, userId] = interaction.customId.split("_");

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Player Passed")
            .setDescription(
                `👤 **Player:** <@${userId}>\n\nClick **SET TIER** to assign the player's tier.`
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`settier_${userId}_${gamemode}`)
                .setLabel("SET TIER")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Success)

        );

        await interaction.update({

            embeds: [embed],
            components: [row]

        });

    }

};