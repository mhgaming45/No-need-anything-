const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("View player's testing history")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select Player")
                .setRequired(false)
        ),

    async execute(interaction) {

        const target =
            interaction.options.getUser("player") ||
            interaction.user;

        const db = load();

        if (!db.players || !db.players[target.id]) {

            return interaction.reply({

                content: "❌ Player not registered.",

                ephemeral: true

            });

        }

        const player = db.players[target.id];

        const history = (db.history || [])
            .filter(h => h.userId === target.id)
            .slice(-10)
            .reverse();

        const embed = new EmbedBuilder()

            .setColor("Blue")

            .setTitle(`${player.ign} • Test History`)

            .setThumbnail(player.avatar)

            .addFields(

                {
                    name: "🏆 Tier",
                    value: player.tier || "Unranked",
                    inline: true
                },

                {
                    name: "✅ Wins",
                    value: String(player.wins || 0),
                    inline: true
                },

                {
                    name: "❌ Losses",
                    value: String(player.losses || 0),
                    inline: true
                }

            )

            .setDescription(

                history.length
                    ? history.map((h, i) =>
                        `**${i + 1}.** ${h.gamemode.toUpperCase()} • ${h.result} • ${h.tier || "No Tier"}`
                    ).join("\n")
                    : "No history found."

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