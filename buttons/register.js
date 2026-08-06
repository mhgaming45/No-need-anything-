const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    id: "register",

    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId("register")
            .setTitle("Player Registration");

        const ign = new TextInputBuilder()
            .setCustomId("ign")
            .setLabel("Minecraft Username")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const region = new TextInputBuilder()
            .setCustomId("region")
            .setLabel("Region")
            .setPlaceholder("AS / EU / NA / OCE")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const account = new TextInputBuilder()
            .setCustomId("account")
            .setLabel("Account Type")
            .setPlaceholder("Premium / Cracked")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ign),
            new ActionRowBuilder().addComponents(region),
            new ActionRowBuilder().addComponents(account)
        );

        await interaction.showModal(modal);

    }

};