const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const channelId = config.channels[gamemode];
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const players = db.prepare(
        "SELECT * FROM queue WHERE gamemode = ? ORDER BY joinedAt ASC"
    ).all(gamemode);

    const queueList = players.length
        ? players.map((p, i) => `**#${i + 1}** • <@${p.userId}>`).join("\n")
        : "No players in queue.";

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle(`${gamemode.toUpperCase()} Queue`)
        .setDescription(queueList)
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
            }
        )
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`queue_${gamemode}`)
            .setLabel("Join Queue")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("leave_queue")
            .setLabel("Leave Queue")
            .setStyle(ButtonStyle.Danger)
    );

    // Message ID ko baad me config/database me save karenge.
    // Abhi first version complete kar rahe hain.
};