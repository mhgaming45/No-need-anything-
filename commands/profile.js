const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your profile"),

    async execute(interaction) {

        const db = load();

        const player = db.players?.[interaction.user.id];

        if (!player) {

            return interaction.reply({

                content: "❌ You are not registered.",

                ephemeral: true

            });

        }

        const embed = new EmbedBuilder()

            .setColor("#FFD700")

            .setTitle("👤 Player Profile")

            .setThumbnail(
                `https://mc-heads.net/avatar/${player.ign}/256`
            )

            .addFields(

                {
                    name: "🎮 IGN",
                    value: player.ign,
                    inline: true
                },

                {
                    name: "🌍 Region",
                    value: player.region,
                    inline: true
                },

                {
                    name: "💎 Account",
                    value: player.accountType,
                    inline: true
                },

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

            .setFooter({

                text: "⚡ Developed by MHGAMING"

            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed],

            ephemeral: true

        });

    }

};