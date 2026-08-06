const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("finish")
        .setDescription("Finish current test")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )
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
        ),

    async execute(interaction, client) {

        const gamemode =
            interaction.options.getString("gamemode");

        const db = load();

        if (!db.active_tests)
            db.active_tests = {};

        const active = db.active_tests[gamemode];

        if (!active) {

            return interaction.reply({

                content:
                    "❌ No active test found for this gamemode.",

                ephemeral: true

            });

        }

        delete db.active_tests[gamemode];

        save(db);

        await updateQueue(client, gamemode);

        const embed = new EmbedBuilder()

            .setColor("Green")

            .setTitle("✅ Test Finished")

            .setDescription(
                `The current **${gamemode.toUpperCase()}** test has been finished.\n\nYou can now use **/next** to test the next player.`
            )

            .setTimestamp();

        return interaction.reply({

            embeds: [embed]

        });

    }

};