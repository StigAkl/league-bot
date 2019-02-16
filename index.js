const {prefix, token, riotApiToken} = require("./botconfig.json"); 
const Discord = require("Discord.js"); 
const {RichEmbed} = require('Discord.js') 
const bot = new Discord.Client();
const URL = require("./Api/api_endpoints");
const fs = require('fs');
const LeagueDAO = require('./Database/db')

//Collections
const commands = new Discord.Collection(); 
const cooldowns = new Discord.Collection(); 

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); 

//Fetch commands
for (const file of commandFiles) {
    const command = require(`./Commands/${file}`); 
    commands.set(command.name, command); 
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
    console.log(`${bot.user.username} er nå online`);
     var db = new LeagueDAO("./Database/summoners.db")
    // db.createSummonerTable(); 
})


//Handle commands
bot.on("message", async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return; 

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase(); 
    const command = commands.get(commandName); 

    if(!command) {
        console.log("Kunne ikke finne kommandoen: ", commandName); 
        return; 
    }

   if(checkCooldowns(command, message)) return; 

    try {
        command.execute(message, args); 
    } catch(error) {
        console.error(error); 
        message.reply('Det oppstod en feil under utførelsen av kommandoen, prøv igjen senere!'); 
    }
})





function checkCooldowns(command, message) {
    if(!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection()); 
    }

    const now = Date.now(); 
    const timestamps = cooldowns.get(command.name); 
    const cooldownAmount = (command.cooldown || 0) * 1000; 

    if(timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if(now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000; 
            message.reply(`Vennligst vent ${timeLeft.toFixed(1)} sekunder før du bruker ${command.name} igjen. Ingen liker spam :smile:`);
            return true;
        }
    } else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return false; 
    }
}












// Command stuff 0

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