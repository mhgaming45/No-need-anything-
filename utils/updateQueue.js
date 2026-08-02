const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    // Queue Panel Data
    const panel = db.prepare(`
        SELECT * FROM queue_messages
        WHERE gamemode = ?
    `).get(gamemode);

    if (!panel) return;

    // Channel
    const channel = await client.channels
        .fetch(panel.channelId)
        .catch(() => null);

    if (!channel) return;

    // Message
    const message = await channel.messages
        .fetch(panel.messageId)
        .catch(() => null);

    if (!message) return;

    // Queue Players
    const players = db.prepare(`
        SELECT *
        FROM queue
        WHERE gamemode = ?
        ORDER BY joinedAt ASC
    `).all(gamemode);

    let queue = "```No players in queue.```";

    if (players.length) {

        queue = players
            .map((player, index) => {

                return `**#${index + 1}** • <@${player.userId}>`;

            })
            .join("\n");

    }

    // Embed
    const embed = new EmbedBuilder()

        .setColor(config.settings.embedColor)

        .setTitle(`🎮 ${gamemode.toUpperCase()} QUEUE`)

        .addFields(

            {
                name: "Status",
                value: "🟢 OPEN",
                inline: true
            },

            {
                name: "Players",
                value: `${players.length}`,
                inline: true
            },

            {
                name: "Current Tester",
                value: "None",
                inline: true
            },

            {
                name: "Queue List",
                value: queue
            }

        )

        .setFooter({
            text: config.settings.footer
        })

        .setTimestamp();

    // Buttons
    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(`queue_${gamemode}`)

                .setLabel("Join Queue")

                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()

                .setCustomId("leave_queue")

                .setLabel("Leave Queue")

                .setStyle(ButtonStyle.Danger)

        );

    // Update Queue Panel
    await message.edit({

        embeds: [embed],

        components: [row]

    });

};