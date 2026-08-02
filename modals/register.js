const db = require("../database/database");

module.exports = {

    id: "register_modal",

    async execute(interaction) {

        const ign = interaction.fields.getTextInputValue("ign");
        const region = interaction.fields.getTextInputValue("region");
        const account = interaction.fields.getTextInputValue("account");

        db.prepare(`
        INSERT OR REPLACE INTO players
        (
            userId,
            username,
            displayName,
            avatar,
            ign,
            region,
            accountType,
            registeredAt
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            interaction.user.id,
            interaction.user.username,
            interaction.user.displayName,
            interaction.user.displayAvatarURL(),
            ign,
            region,
            account,
            new Date().toISOString()
        );

        await interaction.reply({

            content:
`✅ Registration Completed!

👤 Username: ${ign}
🌍 Region: ${region}
💎 Account: ${account}

Now select your gamemode from the Register Panel.`,

            ephemeral: true

        });

    }

};