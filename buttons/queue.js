const db = require("../database/database");

module.exports = {

    id: "queue",

    async execute(interaction) {

        const gamemode = interaction.customId.replace("queue_", "");

        // Registered Check
        const player = db.prepare(
            "SELECT * FROM players WHERE userId = ?"
        ).get(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ You must register first.",
                ephemeral: true
            });
        }

        // Already in Queue
        const already = db.prepare(
            "SELECT * FROM queue WHERE userId = ?"
        ).get(interaction.user.id);

        if (already) {
            return interaction.reply({
                content: `❌ You are already in **${already.gamemode}** queue.`,
                ephemeral: true
            });
        }

        // Join Queue
        db.prepare(`
            INSERT INTO queue
            (userId, username, gamemode, joinedAt)
            VALUES (?, ?, ?, ?)
        `).run(
            interaction.user.id,
            interaction.user.username,
            gamemode,
            Date.now()
        );

        await interaction.reply({
            content: `✅ You joined **${gamemode.toUpperCase()}** queue.`,
            ephemeral: true
        });

        // Queue message update next step me add karenge
    }

};