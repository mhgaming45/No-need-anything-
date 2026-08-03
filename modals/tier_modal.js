const db = require("../database/database");
const config = require("../config");

module.exports = {

    id: "tier_modal",

    async execute(interaction) {

        const parts = interaction.customId.split("_");

        const gamemode = parts[2];
        const userId = parts[3];

        const tier = interaction.fields
            .getTextInputValue("tier")
            .toUpperCase();

        const valid = [
            "HT5","HT4","HT3","HT2","HT1",
            "LT1","LT2","LT3","LT4","LT5"
        ];

        if (!valid.includes(tier)) {

            return interaction.reply({
                content: "❌ Invalid Tier.",
                ephemeral: true
            });

        }

        db.prepare(`
            INSERT OR REPLACE INTO tiers
            (userId,gamemode,tier,updatedAt)
            VALUES(?,?,?,?)
        `).run(
            userId,
            gamemode,
            tier,
            new Date().toISOString()
        );

        const member = await interaction.guild.members.fetch(userId);

        for (const roleId of Object.values(config.tierRoles)) {

            if (member.roles.cache.has(roleId)) {

                await member.roles.remove(roleId).catch(() => {});

            }

        }

        await member.roles.add(config.tierRoles[tier]).catch(() => {});

        db.prepare(`
            UPDATE players
            SET wins = wins + 1
            WHERE userId = ?
        `).run(userId);

        db.prepare(`
            DELETE FROM active_tests
            WHERE gamemode = ?
        `).run(gamemode);

        db.prepare(`
            DELETE FROM queue
            WHERE userId = ?
        `).run(userId);

        await interaction.reply({

            content: `✅ <@${userId}> has been set to **${tier}**.`

        });

    }

};