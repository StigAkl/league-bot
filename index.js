const {prefix, token, riotApiToken} = require("./botconfig.json"); 
const Discord = require("Discord.js"); 
const {RichEmbed} = require('Discord.js') 
const bot = new Discord.Client();
const LeagueDAO = require('./Database/db')
const URL = require("./Api/api_endpoints");
const fs = require('fs');

bot.commands = new Discord.Collection(); 
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); 

//Fetch commands
for (const file of commandFiles) {
    const command = require(`./Commands/${file}`); 
    bot.commands.set(command.name, command); 
}

//Some test data
const users = [
{
    summonerName: "ILoveDuskblade", 
    encryptedSummonerId: "w3I-cV99TdsOpaX7Yrs6qjgHJLKfTRFrpBUiV9-Xkj8unG0", 
    encryptedAccountId: "bByMXzzQFBcEVWFNKKm-dqVkOmMtkFW0lb1JC5oRou4KlrE", 
},
{
    summonerName: "Zekinava",
    encryptedSummonerId: "-BgMUiEPPenxsxzv3eSyZEIG_a2p1WR4eCkgtbfha50-_FM", 
    encryptedAccountId: "QIF4jvo6rEeb7aIGnKwdn8v-IxkKKlw4CvAcsDNQuwIgqTQ"
}
]; 


bot.on("ready", async () =>  {
    console.log(`${bot.user.username} is online`);
     var db = new LeagueDAO("./Database/summoners.db")
})


//HJandle commands
bot.on("message", async message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return; 

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase(); 


    if(!bot.commands.has(command)) {
        console.log("Command not found:", command); 
        return; 
    } 

    try {
        bot.commands.get(command).execute(message, args); 
    } catch(error) {
        console.error(error); 
        message.reply('There was an error trying to execute that command!'); 
    }
})













// Command stuff 0

bot.on("message", async message => {
    if (message.author.bot) return; 

    if(message.channel.type === "dm") return; 

    let messageArray = message.content.split(" "); 
    let cmd = messageArray[0]; 
    let args = messageArray.slice(1); 

    //Action
    if(cmd === `${prefix}status`) {
        return message.channel.send("Hello! My name is KangarooBot and I am finally back in business! I am currently getting rewritten in JavaScript, so that is AWESOME")
    }
})


bot.on('message', message => {
        if (message.content === 'how to embed') {
          const embed = new RichEmbed()
            .setTitle('A slick little embed')
            .setColor(0xFF0000)
            .setDescription('Hello, this is a slick embed!');
          message.reply(embed);
        }
      });

function createtUrl(endpoint, param) {
    return URL.basePath+endpoint+param+"?api_key="+riotApiToken; 
}

bot.login(token); 