const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Send the registration panel."),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📝 Tier Testing Registration")
            .setDescription(
`Welcome to the Tier Testing System!

Click the button below to register or update your profile.

After registering you will be able to:
• Join Queue
• Get Tested
• View Your Profile
• Receive Tier Roles`
            )
            .setFooter({
                text: "Professional Tier Testing Bot"
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("register")
                .setLabel("Register")
                .setEmoji("📝")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("profile")
                .setLabel("Profile")
                .setEmoji("👤")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};