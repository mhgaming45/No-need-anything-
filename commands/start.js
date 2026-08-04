const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Start testing the next player")
        .addStringOption(option =>
            option
                .setName("gamemode")
                .setDescription("Select gamemode")
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

        if (!interaction.member.permissions.has("ManageGuild")) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });
        }

        const gamemode = interaction.options.getString("gamemode");

        const db = load();

        if (!db.active_tests)
            db.active_tests = {};

        if (db.active_tests[gamemode]) {
            return interaction.reply({
                content: "❌ A test is already running for this gamemode.",
                ephemeral: true
            });
        }

        const queue = db.queue
            .filter(q => q.gamemode === gamemode)
            .sort((a, b) => a.joinedAt - b.joinedAt);

        if (queue.length === 0) {
            return interaction.reply({
                content: "❌ Queue is empty.",
                ephemeral: true
            });
        }

        const player = queue[0];
        const data = db.players[player.userId];

        db.active_tests[gamemode] = {
            testerId: interaction.user.id,
            playerId: player.userId,
            startedAt: Date.now()
        };

        save(db);

        await updateQueue(client, gamemode);

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle(`🧪 ${gamemode.toUpperCase()} Test Started`)
            .addFields(
                {
                    name: "👤 Player",
                    value: `<@${player.userId}>`,
                    inline: true
                },
                {
                    name: "🎮 IGN",
                    value: data?.ign || "Unknown",
                    inline: true
                },
                {
                    name: "🌍 Region",
                    value: data?.region || "Unknown",
                    inline: true
                }
            )
            .setFooter({
                text: "Developed by MHGAMING"
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`pass_${gamemode}_${player.userId}`)
                .setLabel("PASS")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`fail_${gamemode}_${player.userId}`)
                .setLabel("FAIL")
                .setStyle(ButtonStyle.Danger)

        );

        await interaction.reply({

            embeds: [embed],

            components: [buttons]

        });

    }

};