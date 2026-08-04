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
            .setCustomId("register_modal")
            .setTitle("Tier Testing Registration");

        const ign = new TextInputBuilder()
            .setCustomId("ign")
            .setLabel("Minecraft Username")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your IGN")
            .setRequired(true)
            .setMaxLength(16);

        const region = new TextInputBuilder()
            .setCustomId("region")
            .setLabel("Region")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("AS / EU / NA / ME")
            .setRequired(true);

        const account = new TextInputBuilder()
            .setCustomId("account")
            .setLabel("Account Type")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Premium / Cracked")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ign),
            new ActionRowBuilder().addComponents(region),
            new ActionRowBuilder().addComponents(account)
        );

        await interaction.showModal(modal);

    }

};