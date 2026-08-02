// Previous Tier
const oldTierData = db.prepare(`
SELECT tier
FROM tiers
WHERE userId = ?
AND gamemode = ?
`).get(member.id, gamemode);

const previousTier = oldTierData?.tier || "Unranked";

// Save New Tier
db.prepare(`
INSERT OR REPLACE INTO tiers
(userId, gamemode, tier, updatedAt)
VALUES (?, ?, ?, ?)
`).run(
    member.id,
    gamemode,
    tier,
    new Date().toISOString()
);

// Results Channel
const resultsChannel = interaction.guild.channels.cache.get(
    config.channels.results
);

if (resultsChannel) {

    const resultEmbed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle(`🏆 ${member.user.username}'s Tier Update`)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            {
                name: "👨‍⚖️ Tester",
                value: `<@${interaction.user.id}>`,
                inline: true
            },
            {
                name: "🎮 Game Mode",
                value: gamemode.toUpperCase(),
                inline: true
            },
            {
                name: "⛏ Minecraft Username",
                value: player.ign,
                inline: true
            },
            {
                name: "📉 Previous Rank",
                value: previousTier,
                inline: true
            },
            {
                name: "🏅 Rank Earned",
                value: tier,
                inline: true
            }
        )
        .setFooter({
            text: "Professional Tier Testing"
        })
        .setTimestamp();

    await resultsChannel.send({
        content: `<@${member.id}>`, // Player mention upar
        embeds: [resultEmbed]
    });
}