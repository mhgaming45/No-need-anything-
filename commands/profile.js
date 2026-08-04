const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View player profile")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select player")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser("player") ||
            interaction.user;

        const db = load();

        const player = db.players[user.id];

        if (!player) {

            return interaction.reply({

                content: "❌ Player not registered.",

                ephemeral: true

            });

        }

        let tierText = "";

        const gamemodes = [
            "uhc",
            "nethpot",
            "vanilla",
            "smp",
            "sword",
            "mace",
            "axe"
        ];

        for (const mode of gamemodes) {

            const tier =
                db.tiers?.[user.id]?.[mode] || "Unranked";

            tierText += `**${mode.toUpperCase()}** : ${tier}\n`;

        }

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setAuthor({

                name: user.username,

                iconURL: user.displayAvatarURL()

            })

            .setThumbnail(user.displayAvatarURL())

            .addFields(

                {
                    name: "👤 Minecraft Username",
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
                    name: "🏆 Wins",
                    value: `${player.wins || 0}`,
                    inline: true
                },

                {
                    name: "❌ Losses",
                    value: `${player.losses || 0}`,
                    inline: true
                },

                {
                    name: "⭐ ELO",
                    value: `${player.elo || 1000}`,
                    inline: true
                },

                {
                    name: "🎮 Gamemode Tiers",
                    value: tierText
                }

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