const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.clear();

        console.log("================================");
        console.log(" Professional Tier Testing Bot");
        console.log("================================");
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Servers: ${client.guilds.cache.size}`);
        console.log("Bot Started Successfully!");
        console.log("================================");

        client.user.setPresence({
            activities: [
                {
                    name: "Tier Testing",
                    type: ActivityType.Watching
                }
            ],
            status: "online"
        });
    }
};