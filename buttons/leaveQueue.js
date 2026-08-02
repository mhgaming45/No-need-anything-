const db = require("../database/database");

module.exports = {

    id: "leaveQueue",

    async execute(interaction) {

        const player = db.prepare(
            "SELECT * FROM queue WHERE userId = ?"
        ).get(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ You are not in any queue.",
                ephemeral: true
            });
        }

        db.prepare(
            "DELETE FROM queue WHERE userId = ?"
        ).run(interaction.user.id);

        await interaction.reply({
            content: `✅ You left **${player.gamemode.toUpperCase()}** queue.`,
            ephemeral: true
        });

        // Next step me queue message automatically update hoga
    }

};