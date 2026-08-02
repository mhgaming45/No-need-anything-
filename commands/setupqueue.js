const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setupqueue")
        .setDescription("Setup all queue panels.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const gamemodes = [
            "nethpot",
            "vanilla",
            "smp",
            "sword",
            "uhc",
            "mace",
            "axe"
        ];

        await interaction.reply({
            content: "⏳ Setting up queue panels...",
            ephemeral: true
        });

        for (const mode of gamemodes) {

            const channel = interaction.guild.channels.cache.get(
                config.channels[mode]
            );

            if (!channel) continue;

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle(`${mode.toUpperCase()} QUEUE`)
                .setDescription(
                    "```No players in queue.```"
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
                        name: "Tester",
                        value: "None",
                        inline: false
                    }
                )
                .setFooter({
                    text: "Tier Testing Bot"
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(`queue_${mode}`)
                        .setLabel("Join Queue")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("leave_queue")
                        .setLabel("Leave Queue")
                        .setStyle(ButtonStyle.Danger)

                );

            const msg = await channel.send({
                embeds: [embed],
                components: [row]
            });

            console.log(`${mode}: ${msg.id}`);

        }

const db = require("../database/database");

db.prepare(`
INSERT OR REPLACE INTO queue_messages
(gamemode, channelId, messageId)
VALUES (?, ?, ?)
`).run(
    mode,
    channel.id,
    msg.id
);

        await interaction.followUp({
            content: "✅ Queue panels created successfully!",
            ephemeral: true
        });

    }

};