const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

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

        const player = db.prepare(`
            SELECT *
            FROM players
            WHERE userId = ?
        `).get(user.id);

        if (!player) {

            return interaction.reply({

                content: "❌ Player not registered.",

                ephemeral: true

            });

        }

        const tiers = db.prepare(`
            SELECT gamemode, tier
            FROM tiers
            WHERE userId = ?
        `).all(user.id);

        let tierText = "";

        for (const mode of config.gamemodes) {

            const data = tiers.find(
                t => t.gamemode === mode
            );

            tierText +=
                `**${mode.toUpperCase()}** : ${data ? data.tier : "Unranked"}\n`;

        }

        const embed = new EmbedBuilder()

            .setColor(config.settings.embedColor)

            .setAuthor({

                name: user.username,

                iconURL: user.displayAvatarURL()

            })

            .setThumbnail(user.displayAvatarURL())

            .addFields(

                {

                    name: "MinecraftUsername",

                    value: player.ign,

                    inline: true

                },

                {

                    name: "Region",

                    value: player.region,

                    inline: true

                },

                {

                    name: "Account",

                    value: player.accountType,

                    inline: true

                },

                {

                    name: "Wins",

                    value: `${player.wins}`,

                    inline: true

                },

                {

                    name: "Losses",

                    value: `${player.losses}`,

                    inline: true

                },

                {

                    name: "ELO",

                    value: `${player.elo}`,

                    inline: true

                },

                {

                    name: "Gamemode Tiers",

                    value: tierText

                }

            )

            .setFooter({

                text: config.settings.footer

            })

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};