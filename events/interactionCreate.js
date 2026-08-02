const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            return command.execute(interaction, client);
        }

        // Buttons
        if (interaction.isButton()) {

            // Queue Buttons
            if (interaction.customId.startsWith("queue_")) {
                const queueButton = client.buttons.get("queue");
                if (queueButton) {
                    return queueButton.execute(interaction, client);
                }
            }

            // Register Button
            if (interaction.customId === "register") {
                const register = client.buttons.get("register");
                if (register) {
                    return register.execute(interaction, client);
                }
            }

            // Leave Queue
            if (interaction.customId === "leave_queue") {
                const leave = client.buttons.get("leaveQueue");
                if (leave) {
                    return leave.execute(interaction, client);
                }
            }

            // Profile
            if (interaction.customId === "profile") {
                const profile = client.buttons.get("profile");
                if (profile) {
                    return profile.execute(interaction, client);
                }
            }
        }

        // Select Menus
        if (interaction.isStringSelectMenu()) {
            const menu = client.selectMenus.get(interaction.customId);
            if (menu) return menu.execute(interaction, client);
        }

        // Modals
        if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);
            if (modal) return modal.execute(interaction, client);
        }

    }
};