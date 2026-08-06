const { EmbedBuilder } = require("discord.js");
const { load, save } = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const db = load();

    if (!db.queue) db.queue = [];
    if (!db.queue_messages) db.queue_messages = {};

    const queue = db.queue.filter(
        p => p.gamemode === gamemode
    );

    const messageData = db.queue_messages[gamemode];

    if (!messageData) return;

    const channel = await client.channels
        .fetch(messageData.channelId)
        .catch(() => null);

    if (!channel) return;

    const message = await channel.messages
        .fetch(messageData.messageId)
        .catch(() => null);

    if (!message) return;

    const activePlayer =
        db.active_tests?.[gamemode]?.playerId || "None";

    const activeTester =
        db.active_tests?.[gamemode]?.testerId || "None";

    const embed = new EmbedBuilder()
        .setColor(config.settings.embedColor)
        .setTitle(
            `${config.emojis[gamemode]} ${gamemode.toUpperCase()} Queue`
        )
        .setDescription(
            queue.length
                ? queue
                      .map(
                          (p, i) =>
                              `**${i + 1}.** <@${p.userId}>`
                      )
                      .join("\n")
                : "```No players in queue.```"
        )
        .addFields(
            {
                name: "🟢 Status",
                value: "Open",
                inline: true
            },
            {
                name: "👨‍⚖️ Current Tester",
                value:
                    activeTester === "None"
                        ? "None"
                        : `<@${activeTester}>`,
                inline: true
            },
            {
                name: "👤 Current Player",
                value:
                    activePlayer === "None"
                        ? "None"
                        : `<@${activePlayer}>`,
                inline: true
            },
            {
                name: "📋 Players",
                value: `${queue.length}`,
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

    save(db);

};