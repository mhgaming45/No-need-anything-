const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { load, save } = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Start testing a player")
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

    async execute(interaction) {

        const gamemode = interaction.options.getString("gamemode");

        const db = load();

        if (!db.queue)
            db.queue = [];

        const queue = db.queue.filter(
            q => q.gamemode === gamemode
        );

        if (!queue.length) {

            return interaction.reply({

                content: `❌ No players in ${gamemode.toUpperCase()} queue.`,

                ephemeral: true

            });

        }

        const playerQueue = queue[0];

        const player = db.players[playerQueue.userId];

        if (!player) {

            return interaction.reply({

                content: "❌ Player data not found.",

                ephemeral: true

            });

        }

        if (!db.active_tests)
            db.active_tests = {};

        db.active_tests[gamemode] = {

            tester: interaction.user.id,
            player: playerQueue.userId

        };

        save(db);

        const embed = new EmbedBuilder()

            .setColor("Blue")

            .setTitle("🎮 Tier Test Started")

            .addFields(

                {
                    name: "👤 Player",
                    value: `<@${playerQueue.userId}>`,
                    inline: true
                },

                {
                    name: "🎮 IGN",
                    value: player.ign,
                    inline: true
                },

                {
                    name: "🌍 Region",
                    value: player.region,
                    inline: true
                },

                {
                    name: "⚔️ Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                },

                {
                    name: "👨‍⚖️ Tester",
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }

            )

            .setFooter({
                text: "⚡ Developed by MHGAMING"
            })

            .setTimestamp();

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()
                    .setCustomId(`pass_${gamemode}_${playerQueue.userId}`)
                    .setLabel("PASS")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`fail_${gamemode}_${playerQueue.userId}`)
                    .setLabel("FAIL")
                    .setStyle(ButtonStyle.Danger)

            );

        await interaction.reply({

            embeds: [embed],
            components: [row]

        });

    }

};