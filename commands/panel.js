const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const config = require("../config");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send Register Panel")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const embed = new EmbedBuilder()

            .setColor(config.settings.embedColor)

            .setTitle("🏆 Tier Testing Panel")

            .setDescription(
`Welcome to the Tier Testing System!

📋 **Step 1**
Click **Register** and fill your details.

📋 **Step 2**
Choose your Gamemode.

📋 **Step 3**
Go to the Queue Channel and wait for your turn.`
            )

            .setFooter({
                text: config.settings.footer
            })

            .setTimestamp();

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
                    .setCustomId("queue_uhc")
                    .setLabel("UHC")
                    .setEmoji(config.emojis.uhc)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_nethpot")
                    .setLabel("NethPot")
                    .setEmoji(config.emojis.nethpot)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_vanilla")
                    .setLabel("Vanilla")
                    .setEmoji(config.emojis.vanilla)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_smp")
                    .setLabel("SMP")
                    .setEmoji(config.emojis.smp)
                    .setStyle(ButtonStyle.Secondary)

            );

        const row3 = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()
                    .setCustomId("queue_sword")
                    .setLabel("Sword")
                    .setEmoji(config.emojis.sword)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_mace")
                    .setLabel("Mace")
                    .setEmoji(config.emojis.mace)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("queue_axe")
                    .setLabel("Axe")
                    .setEmoji(config.emojis.axe)
                    .setStyle(ButtonStyle.Secondary)

            );

        await interaction.channel.send({

            embeds: [embed],

            components: [

                row1,
                row2,
                row3

            ]

        });

        await interaction.reply({

            content: "✅ Panel Sent.",

            ephemeral: true

        });

    }

};