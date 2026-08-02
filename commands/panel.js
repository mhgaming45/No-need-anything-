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
        .setDescription("Send the Tier Testing Panel"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("📝 Tier Testing Registration")
            .setDescription(
`Welcome to the Tier Testing System!

**How to Register**
• Click **Register** and fill in your information.

**How to Join Queue**
• Click the **Queue** button.
• Select your preferred gamemode.
• You will automatically join that queue.

━━━━━━━━━━━━━━━━━━

🎮 Available Gamemodes

<:neth:1508477782902964404> **NethPot**
<:crystal:1508477864377581578> **Vanilla**
<:smp:1508478184348188903> **SMP**
<:diamond_sword:1508478005876359208> **Sword**
<:uhc:1500781212590018580> **UHC**
<:mace:1508478497209978981> **Mace**
<:axe:1508478292024627463> **Axe**

━━━━━━━━━━━━━━━━━━

Press a button below to continue.`
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
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("queue")
                .setLabel("Queue")
                .setEmoji("🎮")
                .setStyle(ButtonStyle.Primary)

        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};