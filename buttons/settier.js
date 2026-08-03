const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {

    id: "set_tier",

    async execute(interaction) {

        const [, gamemode, userId] = interaction.customId.split("_");

        const modal = new ModalBuilder()
            .setCustomId(`tier_modal_${gamemode}_${userId}`)
            .setTitle("Set Player Tier");

        const tier = new TextInputBuilder()
            .setCustomId("tier")
            .setLabel("Tier")
            .setPlaceholder("HT5, HT4, HT3, HT2, HT1, LT1, LT2, LT3, LT4, LT5")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(tier)
        );

        await interaction.showModal(modal);

    }

};