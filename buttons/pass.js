const db = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "fail",

    async execute(interaction, client) {

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

        // Add loss
        db.prepare(`
            UPDATE players
            SET losses = losses + 1
            WHERE userId = ?
        `).run(active.playerId);

        // Remove player from queue
        db.prepare(`
            DELETE FROM queue
            WHERE userId = ?
        `).run(active.playerId);

        // Remove active test
        db.prepare(`
            DELETE FROM active_tests
            WHERE gamemode = ?
        `).run(active.gamemode);

        // Update queue
        await updateQueue(client, active.gamemode);

        await interaction.update({

            content:
`❌ <@${active.playerId}> failed the test.

Player has been removed from the queue.`,

            embeds: [],
            components: []

        });

    }

};