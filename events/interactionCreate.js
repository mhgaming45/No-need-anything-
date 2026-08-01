const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "❌ An error occurred.",
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: "❌ An error occurred.",
                        ephemeral: true
                    });
                }
            }
        }

        // Buttons
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            return button.execute(interaction, client);
        }

        // Select Menus
        if (interaction.isStringSelectMenu()) {
            const menu = client.selectMenus.get(interaction.customId);

            if (!menu) return;

            return menu.execute(interaction, client);
        }

        // Modals
        if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);

            if (!modal) return;

            return modal.execute(interaction, client);
        }
    }
};