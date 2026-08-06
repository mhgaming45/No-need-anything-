const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const { load } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("settier")
        .setDescription("Manually set a player's tier")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Select Player")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("player");

        const db = load();

        if (!db.players[user.id]) {

            return interaction.reply({

                content: "❌ Player is not registered.",

                ephemeral: true

            });

        }

        const modal = new ModalBuilder()

            .setCustomId(`tiermodal_${user.id}`)

            .setTitle(`Set Tier • ${user.username}`);

        const tierInput = new TextInputBuilder()

            .setCustomId("tier")

            .setLabel("Enter Tier")

            .setPlaceholder("HT5, HT4, HT3, HT2, HT1, LT1, LT2, LT3, LT4, LT5")

            .setStyle(TextInputStyle.Short)

            .setRequired(true)

            .setMaxLength(3);

        const row = new ActionRowBuilder()

            .addComponents(tierInput);

        modal.addComponents(row);

        await interaction.showModal(modal);

    }

};