const {
    SlashCommandBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("finish")
        .setDescription("Finish the current test"),

    async execute(interaction, client) {

        if (!interaction.member.permissions.has("ManageGuild")) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });
        }

        const db = load();

        const gamemode = Object.keys(db.active_tests || {}).find(
            g => db.active_tests[g]?.testerId === interaction.user.id
        );

        if (!gamemode) {
            return interaction.reply({
                content: "❌ No active test found.",
                ephemeral: true
            });
        }

        const playerId = db.active_tests[gamemode].playerId;

        db.queue = db.queue.filter(
            q => q.userId !== playerId
        );

        delete db.active_tests[gamemode];

        save(db);

        await updateQueue(client, gamemode);

        return interaction.reply({
            content: `✅ Test finished.\nPlayer removed from ${gamemode.toUpperCase()} queue.`,
            ephemeral: true
        });

    }

};