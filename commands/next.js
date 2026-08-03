const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("nextplayer")
        .setDescription("Start testing the next player")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select gamemode")
                .setRequired(true)
                .addChoices(
                    ...config.gamemodes.map(g => ({
                        name: g.toUpperCase(),
                        value: g
                    }))
                )
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction, client) {

        const gamemode =
            interaction.options.getString("gamemode");

        // Already active?
        const active = db.prepare(`
            SELECT *
            FROM active_tests
            WHERE gamemode = ?
        `).get(gamemode);

        if (active) {

            return interaction.reply({
                content: "❌ A test is already running.",
                ephemeral: true
            });

        }

        // Next player
        const player = db.prepare(`
            SELECT *
            FROM queue
            WHERE gamemode = ?
            ORDER BY joinedAt ASC
            LIMIT 1
        `).get(gamemode);

        if (!player) {

            return interaction.reply({
                content: "❌ Queue is empty.",
                ephemeral: true
            });

        }

        db.prepare(`
            INSERT INTO active_tests
            (
                gamemode,
                testerId,
                playerId,
                startedAt
            )
            VALUES (?, ?, ?, ?)
        `).run(
            gamemode,
            interaction.user.id,
            player.userId,
            Date.now()
        );

        await updateQueue(client, gamemode);

        const embed = new EmbedBuilder()
            .setColor(config.settings.embedColor)
            .setTitle(`${gamemode.toUpperCase()} Test Started`)
            .addFields(
                {
                    name: "Player",
                    value: `<@${player.userId}>`,
                    inline: true
                },
                {
                    name: "Tester",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`pass_${gamemode}_${player.userId}`)
                    .setLabel("PASS")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`fail_${gamemode}_${player.userId}`)
                    .setLabel("FAIL")
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};