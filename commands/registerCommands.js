const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send Register Panel"),

    async execute(interaction) {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("📝 Tier Testing Registration")

            .setDescription(
`Welcome to the Tier Testing System!

• Click **Register** first.
• After registering, choose your gamemode.
• You will automatically join the queue.
• Your queue channel will become permanently visible.`
            )

            .setFooter({
                text: "Professional Tier Testing Bot"
            });

        const row1 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("register")
                    .setLabel("Register")
                    .setEmoji("📝")
                    .setStyle(ButtonStyle.Primary)

            );

        const row2 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("queue_nethpot")
                    .setLabel("NethPot")
                    .setEmoji("1508477782902964404")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_vanilla")
                    .setLabel("Vanilla")
                    .setEmoji("1508477864377581578")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_smp")
                    .setLabel("SMP")
                    .setEmoji("1508478184348188903")
                    .setStyle(ButtonStyle.Secondary)

            );

        const row3 = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("queue_sword")
                    .setLabel("Sword")
                    .setEmoji("1508478005876359208")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_mace")
                    .setLabel("Mace")
                    .setEmoji("1508478497209978981")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_axe")
                    .setLabel("Axe")
                    .setEmoji("1508478292024627463")
                    .setStyle(ButtonStyle.Secondary)

            );

        await interaction.reply({

            embeds: [embed],

            components: [
                row1,
                row2,
                row3
            ]

        });

    }

};