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
            .setLabel("Minecraft IGN")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(16);

        const region = new TextInputBuilder()
            .setCustomId("region")
            .setLabel("Region")
            .setPlaceholder("AS / EU / NA")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const age = new TextInputBuilder()
            .setCustomId("age")
            .setLabel("Age")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const country = new TextInputBuilder()
            .setCustomId("country")
            .setLabel("Country")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ign),
            new ActionRowBuilder().addComponents(region),
            new ActionRowBuilder().addComponents(age),
            new ActionRowBuilder().addComponents(country)
        );

        await interaction.showModal(modal);
    }

};