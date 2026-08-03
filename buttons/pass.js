const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    id: "pass",

    async execute(interaction) {

        const active = db.prepare(`
            SELECT *
            FROM active_tests
            WHERE testerId = ?
        `).get(interaction.user.id);

        if (!active) {
            return interaction.reply({
                content: "❌ No active test.",
                ephemeral: true
            });
        }

        // Add win
        db.prepare(`
            UPDATE players
            SET wins = wins + 1
            WHERE userId = ?
        `).run(active.playerId);

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("settier")
                .setLabel("Set Tier")
                .setStyle(ButtonStyle.Primary)

        );

        await interaction.update({

            content:
`✅ <@${active.playerId}> passed the test.

Click **Set Tier** to assign a tier.`,

            embeds: [],
            components: [row]

        });

    }

};