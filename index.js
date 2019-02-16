const botAuth = require("./botconfig.json"); 
const Discord = require("Discord.js"); 
const {RichEmbed} = require('Discord.js') 
const bot = new Discord.Client();
const prefix = botAuth.prefix; 
const LeagueDAO = require('./Database/db')
const URL = require("./Api/api_endpoints");



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
    return URL.basePath+endpoint+param+"?api_key="+botAuth.riotApiToken; 
}

bot.login(botAuth.token); 