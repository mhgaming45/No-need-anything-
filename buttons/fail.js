const db = require("../database/database");

module.exports = {

    id: "fail",

    async execute(interaction) {

        const playerId = interaction.message?.mentions?.users?.first()?.id;

        if (playerId) {

            db.prepare(`
                UPDATE players
                SET losses = losses + 1
                WHERE userId = ?
            `).run(playerId);

        }

        await interaction.reply({
            content: "❌ Player has been marked as Failed.",
            ephemeral: true
        });

    }

};