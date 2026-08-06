const { load, save } = require("../database/database");

module.exports = {
    id: "register",

    async execute(interaction) {

        const ign = interaction.fields.getTextInputValue("ign");
        const region = interaction.fields.getTextInputValue("region");
        const account = interaction.fields.getTextInputValue("account");

        const db = load();

        if (!db.players) db.players = {};

        db.players[interaction.user.id] = {
            userId: interaction.user.id,
            ign,
            region,
            account,
            wins: db.players[interaction.user.id]?.wins || 0,
            losses: db.players[interaction.user.id]?.losses || 0,
            tier: db.players[interaction.user.id]?.tier || null,
            gamemode: db.players[interaction.user.id]?.gamemode || null
        };

        save(db);

        return interaction.reply({
            content:
`✅ Registration Successful!

👤 IGN: ${ign}
🌍 Region: ${region}
📦 Account: ${account}`,
            ephemeral: true
        });

    }
};