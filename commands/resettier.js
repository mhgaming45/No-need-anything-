const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("resettier")
        .setDescription("Reset player's tier")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Player")
                .setRequired(true)
        )
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

        const member = interaction.options.getMember("player");
        const gamemode = interaction.options.getString("gamemode");

        const data = db.prepare(`
            SELECT *
            FROM tiers
            WHERE userId = ?
            AND gamemode = ?
        `).get(member.id, gamemode);

        if (!data) {

            return interaction.reply({
                content: "❌ This player has no tier in this gamemode.",
                ephemeral: true
            });

        }

        // Remove Database Tier
        db.prepare(`
            DELETE FROM tiers
            WHERE userId = ?
            AND gamemode = ?
        `).run(member.id, gamemode);

        // Remove Tier Roles
        for (const roleId of Object.values(config.tierRoles)) {

            if (member.roles.cache.has(roleId)) {

                await member.roles.remove(roleId).catch(() => {});

            }

        }

        const embed = new EmbedBuilder()

            .setColor("Red")

            .setTitle("🗑️ Tier Reset")

            .addFields(

                {
                    name: "Player",
                    value: `${member}`,
                    inline: true
                },

                {
                    name: "Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                },

                {
                    name: "Removed Tier",
                    value: data.tier,
                    inline: true
                }

            )

            .setTimestamp();

        await interaction.reply({

            embeds: [embed]

        });

    }

};