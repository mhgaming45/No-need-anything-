const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("next")
        .setDescription("Get next player from queue")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select Gamemode")
                .setRequired(true)
                .addChoices(
                    { name: "NethPot", value: "nethpot" },
                    { name: "Vanilla", value: "vanilla" },
                    { name: "SMP", value: "smp" },
                    { name: "Sword", value: "sword" },
                    { name: "UHC", value: "uhc" },
                    { name: "Mace", value: "mace" },
                    { name: "Axe", value: "axe" }
                )
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const gamemode =
            interaction.options.getString("gamemode");

        const player = db.prepare(`
            SELECT *
            FROM queue
            WHERE gamemode = ?
            ORDER BY joinedAt ASC
            LIMIT 1
        `).get(gamemode);

        if (!player) {

            return interaction.reply({

                content:
                    `❌ No players are waiting in **${gamemode.toUpperCase()}** queue.`,

                ephemeral: true

            });

        }

        const embed = new EmbedBuilder()

            .setColor(config.settings.embedColor)

            .setTitle("🎮 Next Player")

            .addFields(

                {
                    name: "Player",
                    value: `<@${player.userId}>`,
                    inline: true
                },

                {
                    name: "Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                },

                {
                    name: "Joined Queue",
                    value: `<t:${Math.floor(player.joinedAt / 1000)}:R>`
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