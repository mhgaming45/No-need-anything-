const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("finish")

        .setDescription("Finish current test")

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

        const db = load();

        if (!db.active_tests)
            db.active_tests = {};

        const test = db.active_tests[gamemode];

        if (!test) {

            return interaction.reply({

                content:
                    "❌ No active test for this gamemode.",

                ephemeral: true

            });

        }

        db.queue = db.queue.filter(
            q =>
                !(
                    q.userId === test.player &&
                    q.gamemode === gamemode
                )
        );

        delete db.active_tests[gamemode];

        save(db);

        await updateQueue(client, gamemode);

        await interaction.reply({

            content:
`✅ Test finished.

👤 Player: <@${test.player}>
🎮 Gamemode: **${gamemode.toUpperCase()}**

The player has been removed from the queue.`

        });

    }

};