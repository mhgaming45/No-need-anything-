require("dotenv").config();

const {
REST,
Routes,
SlashCommandBuilder
} = require("discord.js");

const commands = [

new SlashCommandBuilder()
.setName("panel")
.setDescription("Register Panel"),

new SlashCommandBuilder()
.setName("queue")
.setDescription("Queue Panel"),

new SlashCommandBuilder()
.setName("testerpanel")
.setDescription("Tester Panel")

].map(c=>c.toJSON());

const rest=new REST({version:"10"})
.setToken(process.env.TOKEN);

(async()=>{

console.log("Registering slash commands...");

await rest.put(

Routes.applicationGuildCommands(
process.env.CLIENT_ID,
"1528375001219207329"
),

{body:commands}

);

console.log("Slash commands registered!");

})();