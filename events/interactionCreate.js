module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        try {

            // Slash Commands
            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(interaction.commandName);

                if (!command) return;

                await command.execute(interaction, client);
            }

            // Buttons
            else if (interaction.isButton()) {

                const button = client.buttons.get(interaction.customId);

                if (!button) return;

                await button.execute(interaction, client);
            }

            // Modals
            else if (interaction.isModalSubmit()) {

                const modal = client.modals.get(interaction.customId);

                if (!modal) return;

                await modal.execute(interaction, client);
            }

            // Select Menus (future use)
            else if (interaction.isStringSelectMenu()) {

                const menu = client.buttons.get(interaction.customId);

                if (!menu) return;

                await menu.execute(interaction, client);
            }

        } catch (err) {

            console.error(err);

            if (interaction.replied || interaction.deferred) {

                await interaction.followUp({
                    content: "❌ An error occurred while executing this interaction.",
                    ephemeral: true
                }).catch(() => {});

            } else {

                await interaction.reply({
                    content: "❌ An error occurred while executing this interaction.",
                    ephemeral: true
                }).catch(() => {});

            }

        }

    }
};