const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("forcenext")
        .setDescription("Force skip the first player in queue")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select Gamemode")
                .setRequired(true)
                .addChoices(
                    { name: "UHC", value: "uhc" },
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

    async execute(interaction, client) {

        const gamemode = interaction.options.getString("gamemode");

        const firstPlayer = db.prepare(`
            SELECT *
            FROM queue
            WHERE gamemode = ?
            ORDER BY joinedAt ASC
            LIMIT 1
        `).get(gamemode);

        if (!firstPlayer) {

            return interaction.reply({
                content: "❌ Queue is empty.",
                ephemeral: true
            });

        }

        // Remove first player
        db.prepare(`
            DELETE FROM queue
            WHERE userId = ?
        `).run(firstPlayer.userId);

        // Update queue panel
        await updateQueue(client, gamemode);

        // Next player
        const nextPlayer = db.prepare(`
            SELECT *
            FROM queue
            WHERE gamemode = ?
            ORDER BY joinedAt ASC
            LIMIT 1
        `).get(gamemode);

        const embed = new EmbedBuilder()

            .setColor("Orange")

            .setTitle("⏭ Queue Skipped")

            .addFields(
                {
                    name: "Skipped Player",
                    value: `<@${firstPlayer.userId}>`,
                    inline: true
                },
                {
                    name: "Next Player",
                    value: nextPlayer
                        ? `<@${nextPlayer.userId}>`
                        : "None",
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
            embeds: [embed]
        });

    }

};