const { load, save } = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    id: "queue",

    async execute(interaction, client) {

        const gamemode = interaction.customId.replace("queue_", "");

        const db = load();

        // Registered Check
        if (!db.players[interaction.user.id]) {

            return interaction.reply({

                content: "❌ Please register first.",

                ephemeral: true

            });

        }

        // Already In Queue
        const already = db.queue.find(
            q => q.userId === interaction.user.id
        );

        if (already) {

            return interaction.reply({

                content: `❌ You are already in **${already.gamemode.toUpperCase()}** queue.`,

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

        // Give Channel Access
        const channel = interaction.guild.channels.cache.get(
            config.queueChannels[gamemode]
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

        // Update Queue
        await updateQueue(client, gamemode);

        await interaction.reply({

            content:
`✅ Successfully joined **${gamemode.toUpperCase()}** Queue.

➡️ Please go to <#${config.queueChannels[gamemode]}>.`,

            ephemeral: true

        });

    }

};