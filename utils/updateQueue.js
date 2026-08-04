const { EmbedBuilder } = require("discord.js");
const { load } = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const db = load();

    if (!db.queues) db.queues = {};

    if (!db.queues[gamemode])
        db.queues[gamemode] = [];

    const queue = db.queues[gamemode];

    const channelId = config.queueChannels?.[gamemode];

    if (!channelId) return;

    const channel = client.channels.cache.get(channelId);

    if (!channel) return;

    const description = queue.length
        ? queue
              .map((id, index) => `${index + 1}. <@${id}>`)
              .join("\n")
        : "No players in queue.";

    const embed = new EmbedBuilder()

        .setColor("Blue")

        .setTitle(`🎮 ${gamemode.toUpperCase()} Queue`)

        .setDescription(description)

        .setFooter({
            text: "⚡ Developed by MHGAMING"
        })

        .setTimestamp();

    const messages = await channel.messages.fetch({ limit: 10 });

    const oldMessage = messages.find(
        (m) =>
            m.author.id === client.user.id &&
            m.embeds.length > 0
    );

    if (oldMessage) {

        await oldMessage.edit({
            embeds: [embed]
        });

    } else {

        await channel.send({
            embeds: [embed]
        });

    }

};