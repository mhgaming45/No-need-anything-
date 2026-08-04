const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = async (
    client,
    tester,
    player,
    gamemode,
    result,
    tier = null
) => {

    const channel = client.channels.cache.get(config.channels.logs);

    if (!channel) return;

    const embed = new EmbedBuilder()

        .setColor(result === "PASS" ? "Green" : "Red")

        .setTitle("📝 Test Log")

        .addFields(

            {
                name: "👨‍⚖️ Tester",
                value: `<@${tester.id}>`,
                inline: true
            },

            {
                name: "👤 Player",
                value: `<@${player.id}>`,
                inline: true
            },

            {
                name: "🎮 Gamemode",
                value: gamemode,
                inline: true
            },

            {
                name: "📊 Result",
                value: result,
                inline: true
            },

            {
                name: "🏆 Tier",
                value: tier || "None",
                inline: true
            }

        )

        .setFooter({
            text: "⚡ Developed by MHGAMING"
        })

        .setTimestamp();

    await channel.send({
        embeds: [embed]
    });

};