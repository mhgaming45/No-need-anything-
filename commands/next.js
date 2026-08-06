const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { load, save } = require("../database/database");
const updateQueue = require("../utils/updateQueue");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("next")
        .setDescription("Start testing the next player")
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

        if (!db.queue)
            db.queue = [];

        if (!db.active_tests)
            db.active_tests = {};

        if (db.active_tests[gamemode]) {

            return interaction.reply({

                content:
                    "❌ A test is already running for this gamemode.",

                ephemeral: true

            });

        }

        const player = db.queue.find(
            q => q.gamemode === gamemode
        );

        if (!player) {

            return interaction.reply({

                content:
                    `❌ No players in ${gamemode.toUpperCase()} queue.`,

                ephemeral: true

            });

        }

        db.active_tests[gamemode] = {

            userId: player.userId,

            testerId: interaction.user.id,

            startedAt: Date.now()

        };

        save(db);

        await updateQueue(client, gamemode);

        const data = db.players[player.userId];

        const embed = new EmbedBuilder()

            .setColor("Blue")

            .setTitle("🎮 Next Player")

            .setThumbnail(
                `https://mc-heads.net/avatar/${data.ign}/256`
            )

            .addFields(

                {
                    name: "👤 Player",
                    value: `<@${player.userId}>`,
                    inline: true
                },

                {
                    name: "🎮 IGN",
                    value: data.ign,
                    inline: true
                },

                {
                    name: "🌍 Region",
                    value: data.region,
                    inline: true
                },

                {
                    name: "💎 Account",
                    value: data.accountType,
                    inline: true
                },

                {
                    name: "🏆 Tier",
                    value: data.tier,
                    inline: true
                },

                {
                    name: "⚔️ Gamemode",
                    value: gamemode.toUpperCase(),
                    inline: true
                }

            )

            .setFooter({

                text: "Developed by MHGAMING"

            })

            .setTimestamp();

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `pass_${gamemode}_${player.userId}`
                    )

                    .setLabel("PASS")

                    .setEmoji("✅")

                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()

                    .setCustomId(
                        `fail_${gamemode}_${player.userId}`
                    )

                    .setLabel("FAIL")

                    .setEmoji("❌")

                    .setStyle(ButtonStyle.Danger)

            );

        await interaction.reply({

            embeds: [embed],

            components: [row]

        });

    }

};