const {
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const db = load();

    // Queue Panel Data
    const panel = db.queue_messages[gamemode];

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
    const active = db.active_tests[gamemode];

    // Queue Players
    const queue = db.queue
        .filter(q => q.gamemode === gamemode)
        .sort((a, b) => a.joinedAt - b.joinedAt);

    // Remove current testing player
    const players = active
        ? queue.filter(q => q.userId !== active.playerId)
        : queue;

    let description = "";

    if (players.length === 0) {

        description = "```No players in queue.```";

    } else {

        description = players
            .map((p, i) =>
                `${i + 1}. <@${p.userId}>`
            )
            .join("\n");

    }

    const embed = new EmbedBuilder()

        .setColor(config.settings.embedColor)

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
    text: "Developed by MHGAMING"
})
.setTimestamp();

        .setTimestamp();

    await message.edit({
        embeds: [embed]
    });

};