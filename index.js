const {prefix, token, riotApiToken} = require("./botconfig.json"); 
const Discord = require("discord.js"); 
const {RichEmbed} = require('Discord.js') 
const bot = new Discord.Client();
const URL = require("./Api/api_endpoints");
const fs = require('fs');
const LeagueDAO = require('./Database/db')
const {fetchActiveMatch} = require('./Api/api_fetchers'); 

//Collections
const commands = new Discord.Collection(); 
const cooldowns = new Discord.Collection(); 
const activeGames = new Discord.Collection(); 
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); 
const announcementChannel = undefined; 

bot.login(token); 


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
    const db = new LeagueDAO("./Database/summoners.db"); 
    setInterval(() => { checkActiveGames(sendMessage, bot.channels.get("279995156503986176")) }, 20000); 
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


/* Helper functions */ 

async function checkActiveGames(callback, channel) {
    const db = new LeagueDAO("./Database/summoners.db");
    db.getAllSummoners((summoners) => {
        for(let i = 0; i < summoners.length; i++) {
            let summoner = summoners[i]; 
        
            
            setTimeout( function time() {

                fetchActiveMatch(summoner.encryptedSummonerId, (response) => { 
                    console.log("Checking summoner ", i)
                    if(response.status === 200 && (response.data.gameQueueConfigId === 420 || response.data.gameQueueConfigId === 440)) {
    
                        if(!activeGames.has(summoner.encryptedSummonerId)) {
                        console.log(summoner.summonerName + " just went in a new game");
                        let team1 = []; 
                        let team2 = []; 
                        
                        let team1_id = response.data.participants[0].teamId;
                        for(p of response.data.participants) {
                            if (p.teamId === team1_id) {
                                team1.push(p); 
                            }
                            else {
                                team2.push(p); 
                            }
                        }
    
                        const spectatorData = {
                            team1: team1, 
                            team2: team2, 
                            playerSpectating: summoner,
                            matchId: response.data.gameId
                        }
    
                        activeGames.set(summoner.encryptedSummonerId, spectatorData); 
                        console.log("ACTIVE!!!!")
                        console.log(activeGames.get(summoner.encryptedSummonerId).matchId);
    
                        let embed = formatTeams(spectatorData); 
    
                        callback(embed, channel); 
                        
    
                    } else {
                        console.log("Game is already tracked"); 
                    }
                    } else {
                        if(activeGames.has(summoner.encryptedSummonerId)) {
                            console.log(summoner.summonerName + " just finished a game! Game id: ", activeGames.get(summoner.encryptedSummonerId).matchId); 
                            setTimeout(() => {activeGames.delete(summoner.encryptedSummonerId)}, 60000); 
    
                            //TODO: Add post game stats for {gameId}
                        }
                    } 
                })
            }, i*1000);

                    const spectatorData = {
                        team1: team1, 
                        team2: team2, 
                        playerSpectating: summoner,
                        matchId: response.data.gameId
                    }

                    activeGames.set(summoner.encryptedSummonerId, spectatorData); 
                    console.log(activeGames.get(summoner.encryptedSummonerId).matchId);

                    let embed = formatTeams(spectatorData); 

                    callback(embed, channel); 
                } else {
                    console.log("Game is already tracked"); 
                }
                } else {
                    if(activeGames.has(summoner.encryptedSummonerId)) {
                        callback("(TEST): <@"+spectatorData.playerSpectating.id+"> ble nettopp ferdig med et game. Resultat: <ike implementert>")
                        console.log(summoner.summonerName + " just finished a game! Game id: ", activeGames.get(summoner.encryptedSummonerId).matchId); 
                        setTimeout(() => {activeGames.delete(summoner.encryptedSummonerId)}, 60000); 

                        //TODO: Add post game stats for {gameId}
                    }
                } 
            })
        }
    }) 
}

function sendMessage(embed, channel) {
    channel.send(embed)
}

function formatTeams(spectatorData) {
     let playerTeamId = getTeamId(spectatorData.team1, spectatorData.team2, spectatorData.playerSpectating);  
     let enemyTeamObject = spectatorData.team1[0].teamId !== playerTeamId ? spectatorData.team1 : spectatorData.team2; 
     let allyTeamObject = spectatorData.team1[0].teamId === playerTeamId ? spectatorData.team1 : spectatorData.team2; 

     let enemyTeam = ""; 
     let allyTeam = "";

     for(player of enemyTeamObject) {
        enemyTeam += player.summonerName+"\n"
     }

     for (player of allyTeamObject) {
         if(player.summonerId === spectatorData.playerSpectating.encryptedSummonerId) {
            allyTeam += "**"+player.summonerName+"**\n"
         }

         else {
            allyTeam += player.summonerName+"\n"
         }
     }

     let embed = {
         embed: {
            color: 3447003,
            author: "Test",
            title: "Live match information",
            description: "Live match data for <@"+spectatorData.playerSpectating.id+"> as **" + spectatorData.playerSpectating.summonerName + "**",
            fields: [{
                name: "Your Team",
                value: allyTeam,
                inline: true
            },
            {
                name: "Enemy Team",
                value: enemyTeam, 
                inline: true
            }
        ]
     }
    }

     return embed; 

}


function getTeamId(team1, team2, summoner) {
    for(player of team1) {
        if (player.summonerId === summoner.encryptedSummonerId) {
            return player.teamId; 
        }
    }

    for (player of team2) {
        if(player.summonerId === summoner.encryptedSummonerId) {
            return player.teamId; 
        }
    }
}

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

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
   }












// Command stuff 0

bot.on('message', message => {
        if (message.content === '!test') {
          const embed = new RichEmbed()
            .setTitle('Test')
            .setColor(0xFF0000)
            .setDescription('Hello, this is a slick embed!');
         
            let user = bot.users.get(237187264424181760) 
            message.channel.send("Test: " + user); 
        }
      });

function createtUrl(endpoint, param) {
    return URL.basePath+endpoint+param+"?api_key="+riotApiToken; 
}
