const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setup-queue")
        .setDescription("Setup all queue panels")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        await interaction.deferReply({
            ephemeral: true
        });

        for (const gamemode of config.gamemodes) {

            const channelId = config.queueChannels[gamemode];

            if (!channelId) continue;

            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) continue;

            const embed = new EmbedBuilder()
                .setColor(config.settings.embedColor)
                .setTitle(`${config.emojis[gamemode]} ${gamemode.toUpperCase()} Queue`)
                .setDescription("```No players in queue.```")
                .addFields(
                    {
                        name: "🟢 Status",
                        value: "Open",
                        inline: true
                    },
                    {
                        name: "👨‍⚖️ Current Tester",
                        value: "None",
                        inline: true
                    },
                    {
                        name: "👤 Current Player",
                        value: "None",
                        inline: true
                    },
                    {
                        name: "Players",
                        value: "0",
                        inline: true
                    }
                )
                .setFooter({
                    text: config.settings.footer
                })
                .setTimestamp();

            const msg = await channel.send({
                embeds: [embed]
            });

            db.prepare(`
                INSERT OR REPLACE INTO queue_messages
                (
                    gamemode,
                    channelId,
                    messageId
                )
                VALUES (?, ?, ?)
            `).run(
                gamemode,
                channel.id,
                msg.id
            );

        }

        await interaction.editReply({
            content: "✅ All queue panels have been created successfully."
        });

    }

};