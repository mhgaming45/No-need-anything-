const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the registration panel")
        .setDefaultMemberPermissions("0"),

    async execute(interaction) {

        if (!interaction.member.permissions.has("ManageGuild")) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.settings.embedColor)
            .setTitle("🏆 Professional Tier Testing")
            .setDescription(
`Welcome to the Tier Testing System.

**How to Join**

1️⃣ Click **Register**
2️⃣ Fill the registration form
3️⃣ Select your Gamemode
4️⃣ Wait for your turn
5️⃣ A tester will test you

━━━━━━━━━━━━━━━━━━`
            )
            .setFooter({
                text: "Developed by MHGAMING"
            })
            .setTimestamp();

        const registerRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("register")
                    .setLabel("Register")
                    .setEmoji("📝")
                    .setStyle(ButtonStyle.Primary)
            );

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("queue_uhc")
                    .setLabel("UHC")
                    .setEmoji("<:uhc:1500781212590018580>")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_nethpot")
                    .setLabel("NethPot")
                    .setEmoji("<:neth:1508477782902964404>")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_vanilla")
                    .setLabel("Vanilla")
                    .setEmoji("<:crystal:1508477864377581578>")
                    .setStyle(ButtonStyle.Secondary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("queue_smp")
                    .setLabel("SMP")
                    .setEmoji("<:smp:1508478184348188903>")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_sword")
                    .setLabel("Sword")
                    .setEmoji("<:diamond_sword:1508478005876359208>")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_mace")
                    .setLabel("Mace")
                    .setEmoji("<:mace:1508478497209978981>")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_axe")
                    .setLabel("Axe")
                    .setEmoji("<:axe:1508478292024627463>")
                    .setStyle(ButtonStyle.Secondary)
            );

        const leaveRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("leave_queue")
                    .setLabel("Leave Queue")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.channel.send({

            embeds: [embed],

            components: [

                registerRow,
                row1,
                row2,
                leaveRow

            ]

        });

        await interaction.reply({

            content: "✅ Panel sent successfully.",

            ephemeral: true

        });

    }

};