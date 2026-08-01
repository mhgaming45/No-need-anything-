const db = require("../database/database");

module.exports = {

    id: "register_modal",

    async execute(interaction) {

        const ign = interaction.fields.getTextInputValue("ign");
        const region = interaction.fields.getTextInputValue("region");
        const age = interaction.fields.getTextInputValue("age");
        const country = interaction.fields.getTextInputValue("country");

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO players
            (userId, username, ign, region, registeredAt)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(
            interaction.user.id,
            interaction.user.username,
            ign,
            region,
            new Date().toISOString()
        );

        await interaction.reply({
            content:
`✅ Registration Successful!

👤 IGN: ${ign}
🌍 Region: ${region}
🎂 Age: ${age}
🏳️ Country: ${country}`,
            ephemeral: true
        });

    }

};