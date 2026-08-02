const db = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "leave_queue",

    async execute(interaction, client) {

        // Check if player is in queue
        const player = db.prepare(`
            SELECT *
            FROM queue
            WHERE userId = ?
        `).get(interaction.user.id);

        if (!player) {

            return interaction.reply({

                content: "❌ You are not in any queue.",

                ephemeral: true

            });

        }

        // Remove from queue
        db.prepare(`
            DELETE FROM queue
            WHERE userId = ?
        `).run(interaction.user.id);

        // Update queue panel
        await updateQueue(client, player.gamemode);

        // Success message
        await interaction.reply({

            content:
`✅ You have left the **${player.gamemode.toUpperCase()}** queue.`,

            ephemeral: true

        });

    }

};