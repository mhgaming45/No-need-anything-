const { load, save } = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {
    id: "queue",

    async execute(interaction, client) {

        const gamemode = interaction.customId.replace("queue_", "");

        const db = load();

        if (!db.players) db.players = {};
        if (!db.queue) db.queue = [];

        // Register Check
        const player = db.players[interaction.user.id];

        if (!player) {
            return interaction.reply({
                content: "❌ Please register first.",
                ephemeral: true
            });
        }

        // Same queue already joined
        const already = db.queue.find(
            q =>
                q.userId === interaction.user.id &&
                q.gamemode === gamemode
        );

        if (already) {
            return interaction.reply({
                content: `❌ You are already in **${gamemode.toUpperCase()}** queue.`,
                ephemeral: true
            });
        }

        // Join Queue
        db.queue.push({
            userId: interaction.user.id,
            username: interaction.user.username,
            gamemode,
            joinedAt: Date.now()
        });

        save(db);

        const channelId = config.queueChannels[gamemode];

        await updateQueue(client, gamemode);

        return interaction.reply({
            content:
`✅ You joined **${gamemode.toUpperCase()} Queue**

➡️ Queue Channel: <#${channelId}>`,
            ephemeral: true
        });
    }
};