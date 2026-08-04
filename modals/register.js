const { load, save } = require("../database/database");

module.exports = {

    id: "register_modal",

    async execute(interaction) {

        const ign = interaction.fields.getTextInputValue("ign");
        const region = interaction.fields.getTextInputValue("region");
        const account = interaction.fields.getTextInputValue("account");

        const db = load();

        db.players[interaction.user.id] = {

            userId: interaction.user.id,
            username: interaction.user.username,
            displayName: interaction.user.displayName,
            avatar: interaction.user.displayAvatarURL(),

            ign,
            region,
            accountType: account,

            elo: 1000,
            wins: 0,
            losses: 0,

            registeredAt: new Date().toISOString()

        };

        save(db);

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