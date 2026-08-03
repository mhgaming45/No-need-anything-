const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const db = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("finish")
        .setDescription("Finish current test")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction, client) {

        // Find active test by this tester
        const active = db.prepare(`
            SELECT *
            FROM active_tests
            WHERE testerId = ?
        `).get(interaction.user.id);

        if (!active) {
            return interaction.reply({
                content: "❌ You don't have any active test.",
                ephemeral: true
            });
        }

        // Remove player from queue
        db.prepare(`
            DELETE FROM queue
            WHERE userId = ?
        `).run(active.playerId);

        // Remove active test
        db.prepare(`
            DELETE FROM active_tests
            WHERE gamemode = ?
        `).run(active.gamemode);

        // Update queue panel
        await updateQueue(client, active.gamemode);

        await interaction.reply({
            content: `✅ Test finished successfully.\nPlayer removed from **${active.gamemode.toUpperCase()}** queue.`
        });

    }

};