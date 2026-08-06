const { load, save } = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {
    id: "leave_queue",

    async execute(interaction, client) {

        const gamemode = interaction.customId.replace("leave_", "");

        const db = load();

        if (!db.queue) db.queue = [];

        const index = db.queue.findIndex(
            q =>
                q.userId === interaction.user.id &&
                q.gamemode === gamemode
        );

        if (index === -1) {
            return interaction.reply({
                content: `❌ You are not in **${gamemode.toUpperCase()}** queue.`,
                ephemeral: true
            });
        }

        db.queue.splice(index, 1);

        save(db);

        const channelId = config.queueChannels[gamemode];

        if (channelId) {
            const channel = interaction.guild.channels.cache.get(channelId);

            if (channel) {
                await channel.permissionOverwrites
                    .delete(interaction.user.id)
                    .catch(() => {});
            }
        }

        await updateQueue(client, gamemode);

        return interaction.reply({
            content: `✅ You left **${gamemode.toUpperCase()}** queue.`,
            ephemeral: true
        });
    }
};