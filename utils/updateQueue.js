const { EmbedBuilder } = require("discord.js");
const { load } = require("../database/database");
const config = require("../config");

module.exports = async (client, gamemode) => {

    const db = load();

    if (!db.queue)
        db.queue = [];

    const players = db.queue.filter(
        p => p.gamemode === gamemode
    );

    const channelId = config.queueChannels[gamemode];

    if (!channelId) return;

    const channel = client.channels.cache.get(channelId);

    if (!channel) return;

    const embed = new EmbedBuilder()

        .setColor("Blue")

        .setTitle(`🎮 ${gamemode.toUpperCase()} Queue`)

        .setDescription(

            players.length
                ? players
                      .map(
                          (p, i) =>
                              `${i + 1}. <@${p.userId}>`
                      )
                      .join("\n")
                : "No players in queue."

        )

        .setFooter({
            text: "⚡ Developed by MHGAMING"
        })

        .setTimestamp();

    const messages = await channel.messages.fetch({
        limit: 10
    });

    const oldMessage = messages.find(
        m =>
            m.author.id === client.user.id &&
            m.embeds.length
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