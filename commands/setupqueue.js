const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setupqueue")
        .setDescription("Setup all queue panels.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        await interaction.reply({
            content: "⏳ Creating Queue Panels...",
            ephemeral: true
        });

        for (const gamemode of config.gamemodes) {

            const channel = interaction.guild.channels.cache.get(
                config.channels[gamemode]
            );

            if (!channel) continue;

            // Delete old queue panel (if exists)
            const old = db.prepare(`
                SELECT * FROM queue_messages
                WHERE gamemode = ?
            `).get(gamemode);

            if (old) {

                try {

                    const oldChannel =
                        await interaction.guild.channels.fetch(
                            old.channelId
                        );

                    const oldMessage =
                        await oldChannel.messages.fetch(
                            old.messageId
                        );

                    await oldMessage.delete();

                } catch {}

            }

            const embed = new EmbedBuilder()

                .setColor(config.settings.embedColor)

                .setTitle(
                    `🎮 ${gamemode.toUpperCase()} QUEUE`
                )

                .addFields(

                    {
                        name: "Status",
                        value: "🟢 OPEN",
                        inline: true
                    },

                    {
                        name: "Players",
                        value: "0",
                        inline: true
                    },

                    {
                        name: "Current Tester",
                        value: "None",
                        inline: true
                    },

                    {
                        name: "Queue List",
                        value:
                            "```No players in queue.```"
                    }

                )

                .setFooter({
                    text: config.settings.footer
                })

                .setTimestamp();

            const row =
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `queue_${gamemode}`
                        )
                        .setLabel("Join Queue")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "leave_queue"
                        )
                        .setLabel("Leave Queue")
                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

            const msg = await channel.send({

                embeds: [embed],

                components: [row]

            });

            db.prepare(`
                INSERT OR REPLACE INTO queue_messages
                (
                    gamemode,
                    channelId,
                    messageId
                )
                VALUES
                (?, ?, ?)
            `).run(

                gamemode,
                channel.id,
                msg.id

            );

        }

        await interaction.followUp({

            content:
                "✅ All Queue Panels Created Successfully.",

            ephemeral: true

        });

    }

};