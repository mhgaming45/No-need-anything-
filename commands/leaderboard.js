const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the top players leaderboard"),

    async execute(interaction) {

        const db = load();

        const players = Object.values(db.players || {});

        if (players.length === 0) {
            return interaction.reply({
                content: "❌ No registered players found.",
                ephemeral: true
            });
        }

        players.sort((a, b) => {

            if ((b.elo || 1000) !== (a.elo || 1000))
                return (b.elo || 1000) - (a.elo || 1000);

            return (b.wins || 0) - (a.wins || 0);

        });

        const description = players
            .slice(0, 10)
            .map((player, index) => {

                return `**${index + 1}.** <@${player.userId}>
🏆 ELO: **${player.elo || 1000}**
✅ Wins: **${player.wins || 0}**
❌ Losses: **${player.losses || 0}**`;

            })
            .join("\n\n");

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("🏆 Global Leaderboard")

            .setDescription(description)

            .setFooter({
                text: "Developed by MHGAMING"
            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};