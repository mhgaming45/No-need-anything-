const { EmbedBuilder } = require("discord.js");
const db = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const panel = db.prepare(`
        SELECT *
        FROM queue_messages
        WHERE gamemode = ?
    `).get(gamemode);

    if (!panel) return;

    const channel = await client.channels.fetch(panel.channelId).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(panel.messageId).catch(() => null);
    if (!message) return;

    const active = db.prepare(`
        SELECT *
        FROM active_tests
        WHERE gamemode = ?
    `).get(gamemode);

    const queue = db.prepare(`
        SELECT *
        FROM queue
        WHERE gamemode = ?
        ORDER BY joinedAt ASC
    `).all(gamemode);

    const players = active
        ? queue.filter(q => q.userId !== active.playerId)
        : queue;

    const description = players.length
        ? players.map((p, i) => `**${i + 1}.** <@${p.userId}>`).join("\n")
        : "```No players in queue.```";

    const embed = new EmbedBuilder()
        .setColor(config.settings.embedColor)
        .setTitle(`${config.emojis[gamemode]} ${gamemode.toUpperCase()} Queue`)
        .addFields(
            {
                name: "🟢 Status",
                value: active ? "Testing" : "Open",
                inline: true
            },
            {
                name: "👨‍⚖️ Tester",
                value: active ? `<@${active.testerId}>` : "None",
                inline: true
            },
            {
                name: "🎮 Current Player",
                value: active ? `<@${active.playerId}>` : "None",
                inline: true
            },
            {
                name: "━━━━━━━━━━━━━━",
                value: description
            },
            {
                name: "👥 Queue Size",
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