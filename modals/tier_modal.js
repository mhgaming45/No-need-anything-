const db = require("../database/database");
const config = require("../config");

module.exports = {

    id: "tier_modal",

    async execute(interaction) {

        const tier = interaction.fields
            .getTextInputValue("tier")
            .toUpperCase();

        const validTiers = [
            "HT5", "HT4", "HT3", "HT2", "HT1",
            "LT1", "LT2", "LT3", "LT4", "LT5"
        ];

        if (!validTiers.includes(tier)) {
            return interaction.reply({
                content: "❌ Invalid tier.",
                ephemeral: true
            });
        }

        // Player ID (temporary)
        const playerId = interaction.message?.mentions?.users?.first()?.id;

        if (!playerId) {
            return interaction.reply({
                content: "❌ Player not found.",
                ephemeral: true
            });
        }

        // Save tier
        db.prepare(`
            INSERT OR REPLACE INTO tiers
            (userId, gamemode, tier, updatedAt)
            VALUES (?, ?, ?, ?)
        `).run(
            playerId,
            "uhc", // Replace with current gamemode later
            tier,
            new Date().toISOString()
        );

        // Add Discord role
        const member = await interaction.guild.members.fetch(playerId).catch(() => null);

        if (member) {

            // Remove old tier roles
            for (const roleId of Object.values(config.tierRoles)) {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId).catch(() => {});
                }
            }

            // Add new tier role
            await member.roles.add(config.tierRoles[tier]).catch(() => {});
        }

        await interaction.reply({
            content: `✅ Successfully assigned **${tier}**.`,
            ephemeral: true
        });

    }

};