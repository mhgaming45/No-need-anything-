const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "fail",

    async execute(interaction, client) {

        const args = interaction.customId.split("_");

        // fail_gamemode_userid
        const gamemode = args[1];
        const userId = args[2];

        const db = load();

        // Increase Losses
        if (db.players[userId]) {
            db.players[userId].losses =
                (db.players[userId].losses || 0) + 1;
        }

        // Remove from Queue
        db.queue = db.queue.filter(
            q => q.userId !== userId
        );

        // Remove Active Test
        delete db.active_tests[gamemode];

        save(db);

        // Update Queue Panel
        await updateQueue(client, gamemode);

        await interaction.update({

            content:
`❌ <@${userId}> has **FAILED** the ${gamemode.toUpperCase()} test.`,

            embeds: [],
            components: []

        });

    }

};