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

        const gamemode = interaction.options.getString("gamemode");

        const db = load();

        if (!db.active_tests)
            db.active_tests = {};

        if (!db.queue)
            db.queue = [];

        const test = db.active_tests[gamemode];

        if (!test) {

            return interaction.reply({

                content: "❌ No active test found for this gamemode.",

                ephemeral: true

            });

        }

        const playerId = test.player || test.userId;

        // Remove player from queue
        db.queue = db.queue.filter(
            q =>
                !(q.userId === playerId &&
                  q.gamemode === gamemode)
        );

        // Remove active test
        delete db.active_tests[gamemode];

        save(db);

        // Update Queue
        await updateQueue(client, gamemode);

        return interaction.reply({

            content:
`✅ Test Finished Successfully!

👤 Player: <@${playerId}>
🎮 Gamemode: **${gamemode.toUpperCase()}**

The player has been removed from the queue.`

        });

    }

};