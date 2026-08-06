const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {
    id: "fail",

    async execute(interaction, client) {

        const [, gamemode, userId] = interaction.customId.split("_");

        const db = load();

        // Player Check
        if (db.players[userId]) {
            db.players[userId].losses =
                (db.players[userId].losses || 0) + 1;
        }

        // Remove only from this gamemode queue
        db.queue = db.queue.filter(
            q => !(q.userId === userId && q.gamemode === gamemode)
        );

        // Remove active test
        if (db.active_tests)
            delete db.active_tests[gamemode];

        save(db);

        // Update Queue
        await updateQueue(client, gamemode);

        return interaction.update({
            content:
                `❌ <@${userId}> **FAILED** the **${gamemode.toUpperCase()}** test.`,
            embeds: [],
            components: []
        });
    }
};