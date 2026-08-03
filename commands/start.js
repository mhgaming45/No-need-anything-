const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Start current test")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const active = db.prepare(`
            SELECT *
            FROM active_tests
            WHERE testerId = ?
        `).get(interaction.user.id);

        if (!active) {
            return interaction.reply({
                content: "❌ No active test found. Use /next first.",
                ephemeral: true
            });
        }

        const player = db.prepare(`
            SELECT *
            FROM players
            WHERE userId = ?
        `).get(active.playerId);

        if (!player) {
            return interaction.reply({
                content: "❌ Player not found.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎯 Tier Test Started")
            .addFields(
                {
                    name: "Player",
                    value: `<@${active.playerId}>`,
                    inline: true
                },
                {
                    name: "IGN",
                    value: player.ign,
                    inline: true
                },
                {
                    name: "Region",
                    value: player.region,
                    inline: true
                },
                {
                    name: "Gamemode",
                    value: active.gamemode.toUpperCase(),
                    inline: true
                }
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("pass")
                .setLabel("PASS")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("fail")
                .setLabel("FAIL")
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};