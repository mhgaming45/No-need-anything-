const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = async (
    client,
    tester,
    player,
    gamemode,
    result,
    tier = "None"
) => {

    try {

        const channel = await client.channels.fetch(config.channels.logs).catch(() => null);

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(result === "PASS" ? "#00ff00" : "#ff0000")
            .setTitle("📝 Tier Test Log")
            .setThumbnail(player.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: "👨‍⚖️ Tester",
                    value: `${tester}`,
                    inline: true
                },
                {
                    name: "👤 Player",
                    value: `${player}`,
                    inline: true
                },
                {
                    name: "🎮 Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                },
                {
                    name: "📊 Result",
                    value: result,
                    inline: true
                },
                {
                    name: "🏆 Tier",
                    value: tier,
                    inline: true
                }
            )
            .setFooter({
                text: config.settings.footer
            })
            .setTimestamp();

        await channel.send({
            embeds: [embed]
        });

    } catch (err) {
        console.error("SendTestLog Error:", err);
    }

};