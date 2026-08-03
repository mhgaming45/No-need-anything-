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
        .setName("next")
        .setDescription("Get next player")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Gamemode")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

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
                content: "❌ Queue is empty.",
                ephemeral: true
            });
        }

        // Active Test Save
        db.prepare(`
            INSERT OR REPLACE INTO active_tests
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

        const profile = db.prepare(`
            SELECT *
            FROM players
            WHERE userId = ?
        `).get(player.userId);

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🎯 Next Player")
            .addFields(
                {
                    name: "Player",
                    value: `<@${player.userId}>`
                },
                {
                    name: "IGN",
                    value: profile?.ign || "Unknown",
                    inline: true
                },
                {
                    name: "Region",
                    value: profile?.region || "Unknown",
                    inline: true
                },
                {
                    name: "Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                }
            );

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