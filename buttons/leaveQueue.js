const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "leave_queue",

    async execute(interaction, client) {

        const db = load();

        // Find Player
        const index = db.queue.findIndex(
            q => q.userId === interaction.user.id
        );

        if (index === -1) {

            return interaction.reply({

                content: "❌ You are not in any queue.",

                ephemeral: true

            });

        }

        const gamemode = db.queue[index].gamemode;

        // Remove From Queue
        db.queue.splice(index, 1);

        save(db);

        // Update Queue Panel
        await updateQueue(client, gamemode);

        return interaction.reply({

            content: `✅ You left the **${gamemode.toUpperCase()}** queue.`,

            ephemeral: true

        });

    }

};