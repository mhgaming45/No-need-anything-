const db = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "queue",

    async execute(interaction, client) {

        const gamemode = interaction.customId.replace("queue_", "");

        // Registered Check
        const player = db.prepare(`
            SELECT * FROM players
            WHERE userId = ?
        `).get(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ Please register first.",
                ephemeral: true
            });
        }

        // Already in Queue
        const already = db.prepare(`
            SELECT * FROM queue
            WHERE userId = ?
        `).get(interaction.user.id);

        if (already) {
            return interaction.reply({
                content: `❌ You are already in **${already.gamemode.toUpperCase()}** queue.`,
                ephemeral: true
            });
        }

        // Add to Queue
        db.prepare(`
            INSERT INTO queue
            (
                userId,
                username,
                gamemode,
                joinedAt
            )
            VALUES
            (?, ?, ?, ?)
        `).run(
            interaction.user.id,
            interaction.user.username,
            gamemode,
            Date.now()
        );

        // Permanent Queue Channel Access
        const channel = interaction.guild.channels.cache.get(
            config.channels[gamemode]
        );

        if (channel) {

            await channel.permissionOverwrites.edit(
                interaction.user.id,
                {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                }
            ).catch(() => {});

        }

        // Update Queue Panel
        await updateQueue(client, gamemode);

        await interaction.reply({

            content:
`✅ Successfully joined **${gamemode.toUpperCase()}** Queue.

➡️ Please go to <#${config.channels[gamemode]}>.`,

            ephemeral: true

        });

    }

};