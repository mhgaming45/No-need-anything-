const { EmbedBuilder } = require("discord.js");

// Result Channel
const resultChannel = interaction.guild.channels.cache.get(config.channels.results);

if (resultChannel) {

    const player = db.players[userId];

    const embed = new EmbedBuilder()

        .setColor("#FFD700")

        .setTitle(`🏆 ${player.ign}'s Tier Update`)

        .setThumbnail(
            `https://mc-heads.net/avatar/${player.ign}/256`
        )

        .addFields(

            {
                name: "👨‍⚖️ Tester",
                value: `<@${interaction.user.id}>`,
                inline: false
            },

            {
                name: "🎮 Minecraft Username",
                value: `\`${player.ign}\``,
                inline: true
            },

            {
                name: "⚔️ Game Mode",
                value: `\`${player.gamemode || "Unknown"}\``,
                inline: true
            },

            {
                name: "📊 Previous Rank",
                value: `\`${player.previousTier || "Unranked"}\``,
                inline: true
            },

            {
                name: "🏆 Rank Earned",
                value: `\`${tier}\``,
                inline: true
            }

        )

        .setFooter({
            text: "⚡ Developed by MHGAMING"
        })

        .setTimestamp();

    await resultChannel.send({

        content: `<@${userId}>`,

        embeds: [embed]

    });

    // Save previous rank
    player.previousTier = tier;
    save(db);

}