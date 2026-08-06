const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show Tier Leaderboard"),

    async execute(interaction) {

        const db = load();

        if (!db.players) {

            return interaction.reply({

                content: "❌ No registered players.",

                ephemeral: true

            });

        }

        const players = Object.values(db.players);

        if (!players.length) {

            return interaction.reply({

                content: "❌ No registered players.",

                ephemeral: true

            });

        }

        players.sort((a, b) => {

            if ((b.wins || 0) !== (a.wins || 0))
                return (b.wins || 0) - (a.wins || 0);

            return (a.losses || 0) - (b.losses || 0);

        });

        const description = players
            .slice(0, 10)
            .map((p, i) =>
                `**${i + 1}.** <@${p.userId}> • 🏆 ${p.tier || "Unranked"} • ✅ ${p.wins || 0} • ❌ ${p.losses || 0}`
            )
            .join("\n");

        const embed = new EmbedBuilder()

            .setColor("Gold")

            .setTitle("🏆 Tier Leaderboard")

            .setDescription(
                description || "No players found."
            )

            .setFooter({

                text: "Developed by MHGAMING"

            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};