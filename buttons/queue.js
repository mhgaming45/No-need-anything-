const { load, save } = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "queue",

    async execute(interaction, client) {

        const gamemode = interaction.customId.replace("queue_", "");

        const db = load();

        // Check Register
        const player = db.players[interaction.user.id];

        if (!player) {

            return interaction.reply({
                content: "❌ Please register first.",
                ephemeral: true
            });

        }

        // Already in Queue
        const already = db.queue.find(
            q => q.userId === interaction.user.id
        );

        if (already) {

            return interaction.reply({
                content: `❌ You are already in **${already.gamemode.toUpperCase()}** queue.`,
                ephemeral: true
            });

        }

        // Save Gamemode
        player.gamemode = gamemode;

        // Join Queue
        db.queue.push({

            userId: interaction.user.id,
            username: interaction.user.username,
            gamemode,
            joinedAt: Date.now()

        });

        save(db);

        // Give Channel Access
        const channelId = config.queueChannels[gamemode];

        if (channelId) {

            const channel = interaction.guild.channels.cache.get(channelId);

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

        }

        // Update Queue
        await updateQueue(client, gamemode);

        return interaction.reply({

            content:
`✅ Successfully joined **${gamemode.toUpperCase()}** Queue.

➡️ Please go to <#${channelId}>.`,

            ephemeral: true

        });

    }

};