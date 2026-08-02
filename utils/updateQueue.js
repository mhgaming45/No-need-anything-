const {
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    // Queue Message
    const panel = db.prepare(`
        SELECT *
        FROM queue_messages
        WHERE gamemode = ?
    `).get(gamemode);

    if (!panel) return;

    const channel = await client.channels
        .fetch(panel.channelId)
        .catch(() => null);

    if (!channel) return;

    const message = await channel.messages
        .fetch(panel.messageId)
        .catch(() => null);

    if (!message) return;

    // Active Test
    const active = db.prepare(`
        SELECT *
        FROM active_tests
        WHERE gamemode = ?
    `).get(gamemode);

    // Queue Players
    const queue = db.prepare(`
        SELECT *
        FROM queue
        WHERE gamemode = ?
        ORDER BY joinedAt ASC
    `).all(gamemode);

    // Remove current testing player from list
    const players = active
        ? queue.filter(q => q.userId !== active.playerId)
        : queue;

    let description = "";

    if (players.length === 0) {

        description = "```No players in queue.```";

    } else {

        description = players
            .map((p, i) => `${i + 1}. <@${p.userId}>`)
            .join("\n");

    }

    const embed = new EmbedBuilder()

        .setColor("#5865F2")

        .setTitle(
            `${config.emojis[gamemode]} ${gamemode.toUpperCase()} Queue`
        )

        .addFields(

            {
                name: "🟢 Status",
                value: active ? "Testing" : "Open",
                inline: true
            },

            {
                name: "👨‍⚖️ Current Tester",
                value: active
                    ? `<@${active.testerId}>`
                    : "None",
                inline: true
            },

            {
                name: "👤 Current Player",
                value: active
                    ? `<@${active.playerId}>`
                    : "None",
                inline: true
            },

            {
                name: "━━━━━━━━━━━━━━",
                value: description
            },

            {
                name: "Players",
                value: `${players.length}`,
                inline: true
            }

        )

        .setFooter({
            text: config.settings.footer
        })

        .setTimestamp();

    await message.edit({

        embeds: [embed]

    });

};