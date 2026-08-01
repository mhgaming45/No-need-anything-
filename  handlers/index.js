module.exports = (client) => {
    require("./commandHandler")(client);
    require("./eventHandler")(client);
};