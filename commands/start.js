const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Start a tier test")
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
                    "❌ No players in queue.",

                ephemeral: true

            });

        }

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("🎮 Tier Test Started")

            .addFields(

                {
                    name: "Player",
                    value: `<@${player.userId}>`,
                    inline: true
                },

                {
                    name: "Tester",
                    value: `${interaction.user}`,
                    inline: true
                },

                {
                    name: "Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                }

            )

            .setTimestamp();

        await interaction.reply({

            content: `<@${player.userId}>`,

            embeds: [embed]

        });

    }

};