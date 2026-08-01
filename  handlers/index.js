const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    // Commands
    const commandsPath = path.join(__dirname, "..", "commands");

    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.data.name, command);
            console.log(`[COMMAND] ${command.data.name}`);
        }
    }

    // Buttons
    const buttonsPath = path.join(__dirname, "..", "buttons");

    if (fs.existsSync(buttonsPath)) {
        const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(".js"));

        for (const file of buttonFiles) {
            const button = require(path.join(buttonsPath, file));
            client.buttons.set(button.id, button);
            console.log(`[BUTTON] ${button.id}`);
        }
    }

    // Modals
    const modalsPath = path.join(__dirname, "..", "modals");

    if (fs.existsSync(modalsPath)) {
        const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith(".js"));

        for (const file of modalFiles) {
            const modal = require(path.join(modalsPath, file));
            client.modals.set(modal.id, modal);
            console.log(`[MODAL] ${modal.id}`);
        }
    }

    // Select Menus
    const menusPath = path.join(__dirname, "..", "selectMenus");

    if (fs.existsSync(menusPath)) {
        const menuFiles = fs.readdirSync(menusPath).filter(file => file.endsWith(".js"));

        for (const file of menuFiles) {
            const menu = require(path.join(menusPath, file));
            client.selectMenus.set(menu.id, menu);
            console.log(`[MENU] ${menu.id}`);
        }
    }

};