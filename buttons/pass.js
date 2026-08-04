
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

module.exports = {

    id: "pass",

    async execute(interaction) {

        const args = interaction.customId.split("_");

        // pass_gamemode_userid
        const gamemode = args[1];
        const userId = args[2];

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Player Passed")
            .setDescription(
                `👤 Player: <@${userId}>\n\n` +
                `Click **SET TIER** to assign the player's tier.`
            )
            .setFooter({
                text: "Developed by MHGAMING"
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`settier_${gamemode}_${userId}`)
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