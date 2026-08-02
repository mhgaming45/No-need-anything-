const { EmbedBuilder } = require("discord.js");
const config = require("../config");

module.exports = async (
    client,
    type,
    user,
    data = {}
) => {

    const channel = await client.channels
        .fetch(config.channels.logs)
        .catch(() => null);

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor(config.settings.embedColor)
        .setTimestamp();

    switch (type) {

        case "register":

            embed
                .setTitle("📝 Player Registered")
                .addFields(
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Minecraft",
                        value: data.ign,
                        inline: true
                    },
                    {
                        name: "Region",
                        value: data.region,
                        inline: true
                    },
                    {
                        name: "Account",
                        value: data.accountType,
                        inline: true
                    }
                );

            break;

        case "queue_join":

            embed
                .setTitle("📥 Queue Joined")
                .addFields(
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Gamemode",
                        value: data.gamemode.toUpperCase(),
                        inline: true
                    }
                );

            break;

        case "queue_leave":

            embed
                .setTitle("📤 Queue Left")
                .addFields(
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Gamemode",
                        value: data.gamemode.toUpperCase(),
                        inline: true
                    }
                );

            break;

        case "test_start":

            embed
                .setTitle("🎮 Test Started")
                .addFields(
                    {
                        name: "Tester",
                        value: `<@${data.tester}>`,
                        inline: true
                    },
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Gamemode",
                        value: data.gamemode.toUpperCase(),
                        inline: true
                    }
                );

            break;

        case "test_finish":

            embed
                .setTitle("🏆 Test Finished")
                .addFields(
                    {
                        name: "Player",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "Tier",
                        value: data.tier,
                        inline: true
                    },
                    {
                        name: "Tester",
                        value: `<@${data.tester}>`,
                        inline: true
                    },
                    {
                        name: "Gamemode",
                        value: data.gamemode.toUpperCase(),
                        inline: true
                    }
                );

            break;
    }

    await channel.send({
        embeds: [embed]
    });

};