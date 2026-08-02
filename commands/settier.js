const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("settier")
        .setDescription("Set a player's tier")
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
        .addStringOption(option =>
            option
                .setName("tier")
                .setDescription("Tier")
                .setRequired(true)
                .addChoices(
                    { name: "HT5", value: "HT5" },
                    { name: "HT4", value: "HT4" },
                    { name: "HT3", value: "HT3" },
                    { name: "HT2", value: "HT2" },
                    { name: "HT1", value: "HT1" },
                    { name: "LT1", value: "LT1" },
                    { name: "LT2", value: "LT2" },
                    { name: "LT3", value: "LT3" },
                    { name: "LT4", value: "LT4" },
                    { name: "LT5", value: "LT5" }
                )
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const member = interaction.options.getMember("player");
        const gamemode = interaction.options.getString("gamemode");
        const tier = interaction.options.getString("tier");

        const old = db.prepare(`
        SELECT tier
        FROM tiers
        WHERE userId = ?
        AND gamemode = ?
        `).get(member.id, gamemode);

        // Save Tier
        db.prepare(`
        INSERT OR REPLACE INTO tiers
        (userId,gamemode,tier,updatedAt)
        VALUES(?,?,?,?)
        `).run(
            member.id,
            gamemode,
            tier,
            new Date().toISOString()
        );

        // Remove old tier roles
        for (const roleId of Object.values(config.tierRoles)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
            }
        }

        // Add new tier role
        const newRole = config.tierRoles[tier];

        if (newRole) {
            await member.roles.add(newRole).catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Tier Updated")
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
                    name: "Previous Tier",
                    value: old?.tier || "Unranked",
                    inline: true
                },
                {
                    name: "New Tier",
                    value: tier,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    }

};