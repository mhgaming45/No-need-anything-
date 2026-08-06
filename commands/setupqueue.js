const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");
const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("setupqueue")

        .setDescription("Setup Queue Panel")

        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select Gamemode")
                .setRequired(true)
                .addChoices(
                    { name: "UHC", value: "uhc" },
                    { name: "NethPot", value: "nethpot" },
                    { name: "Vanilla", value: "vanilla" },
                    { name: "SMP", value: "smp" },
                    { name: "Sword", value: "sword" },
                    { name: "Mace", value: "mace" },
                    { name: "Axe", value: "axe" }
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction, client) {

        const gamemode =
            interaction.options.getString("gamemode");

        const channelId =
            config.queueChannels[gamemode];

        if (!channelId) {

            return interaction.reply({

                content:
                    "❌ Queue channel not found.",

                ephemeral: true

            });

        }

        const channel =
            interaction.guild.channels.cache.get(channelId);

        if (!channel) {

            return interaction.reply({

                content:
                    "❌ Invalid queue channel.",

                ephemeral: true

            });

        }

        const db = load();

        if (!db.queue_messages)
            db.queue_messages = {};

        db.queue_messages[gamemode] = {

            channelId,
            messageId: null

        };

        save(db);

        await updateQueue(client, gamemode);

        await interaction.reply({

            content:
                `✅ ${gamemode.toUpperCase()} Queue setup completed.`,

            ephemeral: true

        });

    }

};