const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View Leaderboard")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("Leaderboard Type")
                .setRequired(true)
                .addChoices(
                    { name: "ELO", value: "elo" },
                    { name: "Wins", value: "wins" },
                    { name: "Tester", value: "tester" }
                )
        ),

    async execute(interaction) {

        const type =
            interaction.options.getString("type");

        let embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTimestamp();

        if (type === "elo") {

            const players = db.prepare(`
            SELECT *
            FROM players
            ORDER BY elo DESC
            LIMIT 10
            `).all();

            embed.setTitle("🏆 ELO Leaderboard");

            embed.setDescription(

                players.length

                    ? players
                        .map(
                            (p, i) =>
                                `**${i + 1}.** <@${p.userId}> • **${p.elo} ELO**`
                        )
                        .join("\n")

                    : "No players found."

            );

        }

        if (type === "wins") {

            const players = db.prepare(`
            SELECT *
            FROM players
            ORDER BY wins DESC
            LIMIT 10
            `).all();

            embed.setTitle("🥇 Wins Leaderboard");

            embed.setDescription(

                players.length

                    ? players
                        .map(
                            (p, i) =>
                                `**${i + 1}.** <@${p.userId}> • **${p.wins} Wins**`
                        )
                        .join("\n")

                    : "No players found."

            );

        }

        if (type === "tester") {

            const testers = db.prepare(`
            SELECT *
            FROM tester_stats
            ORDER BY totalTests DESC
            LIMIT 10
            `).all();

            embed.setTitle("👨‍⚖️ Tester Leaderboard");

            embed.setDescription(

                testers.length

                    ? testers
                        .map(
                            (t, i) =>
                                `**${i + 1}.** <@${t.testerId}> • **${t.totalTests} Tests**`
                        )
                        .join("\n")

                    : "No tester data found."

            );

        }

        await interaction.reply({
            embeds: [embed]
        });

    }

};