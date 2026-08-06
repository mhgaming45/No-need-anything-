module.exports = {
    name: "ready",
    once: true,

    async execute(client) {

        console.log("=================================");
        console.log("✅ Bot Ready!");
        console.log(`🤖 Logged in as ${client.user.tag}`);
        console.log(`🌍 Servers: ${client.guilds.cache.size}`);
        console.log("=================================");

        client.user.setPresence({
            activities: [
                {
                    name: "Tier Testing",
                    type: 3 // Watching
                }
            ],
            status: "online"
        });

    }

};