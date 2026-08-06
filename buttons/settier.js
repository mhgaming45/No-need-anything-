const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    id: "settier",

    async execute(interaction) {

        const [, userId, gamemode] = interaction.customId.split("_");

        const modal = new ModalBuilder()
            .setCustomId(`tiermodal_${userId}_${gamemode}`)
            .setTitle("Set Player Tier");

        const tier = new TextInputBuilder()
            .setCustomId("tier")
            .setLabel("Enter Tier")
            .setPlaceholder("HT5, HT4, HT3, HT2, HT1, LT1, LT2, LT3, LT4, LT5")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(3);

        const row = new ActionRowBuilder().addComponents(tier);

        modal.addComponents(row);

        await interaction.showModal(modal);

    }

};