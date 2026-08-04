const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    id: "settier",

    async execute(interaction) {

        const args = interaction.customId.split("_");

        // settier_gamemode_userid
        const gamemode = args[1];
        const userId = args[2];

        const modal = new ModalBuilder()
            .setCustomId(`tier_modal_${gamemode}_${userId}`)
            .setTitle("Set Player Tier");

        const tier = new TextInputBuilder()
            .setCustomId("tier")
            .setLabel("Enter Tier")
            .setPlaceholder("HT5, HT4, HT3, HT2, HT1, LT1, LT2, LT3, LT4, LT5")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3);

        modal.addComponents(
            new ActionRowBuilder().addComponents(tier)
        );

        await interaction.showModal(modal);

    }

};