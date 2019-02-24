const {prefix, token, riotApiToken} = require("./botconfig.json"); 
const Discord = require("discord.js"); 
const {RichEmbed} = require('discord.js') 
const bot = new Discord.Client();
const URL = require("./Api/api_endpoints");
const fs = require('fs');
const LeagueDAO = require('./Database/db')
const {fetchActiveMatch, getRanks, fetchPostGame} = require('./Api/api_fetchers'); 
const constants = require('./Api/constants'); 

//Collections
const commands = new Discord.Collection(); 
const cooldowns = new Discord.Collection(); 
const activeGames = new Discord.Collection(); 
const postGameStatsList = new Discord.Collection(); 

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

function checkActiveGames(callback, channel) {
    const db = new LeagueDAO("./Database/summoners.db");
    db.getAllSummoners((summoners) => {
        let delay = summoners.length*1000; 
        for(let i = 0; i < summoners.length; i++) {
            let summoner = summoners[i]; 


            setTimeout( function time() {
                fetchActiveMatch(summoner.encryptedSummonerId, (response) => { 
                    console.log("Checking summoner ", i)
                    let gameType = constants.gameType(response.data.gameQueueConfigId); 
                    if(response.status === 200 && gameType !== "0") {

                        let team1 = []; 
                        let team2 = []; 
                        
                        let team1_id = response.data.participants[0].teamId;
                        for(p of response.data.participants) {
                            if(p.summonerId === summoner.encryptedSummonerId) {
                                summoner.teamId = p.teamId; 
                                console.log(summoner.summonerName + ":" + summoner.teamId)
                            }
                            if (p.teamId === team1_id) {
                                team1.push(p); 
                            }
                            else {
                                team2.push(p); 
                            }
                        }


                        if(!activeGames.has(summoner.encryptedSummonerId)) {
                        const spectatorData = {
                            team1: team1, 
                            team2: team2, 
                            playerSpectating: summoner,
                            matchId: response.data.gameId, 
                            teamId: summoner.teamId,
                            gameType: gameType
                        }
    
                        activeGames.set(summoner.encryptedSummonerId, spectatorData); 
                        postGameStatsList.set(spectatorData.matchId, summoner);
                        console.log("ACTIVE!!!!")
                        console.log(activeGames.get(summoner.encryptedSummonerId).matchId);
    
                        console.log("Summoner team id: ", summoner.teamId)
                        formatTeams(spectatorData, channel); 
                        
    
                    } else {
                        console.log("Game is already tracked"); 
                    }
                    } else {
                        if(activeGames.has(summoner.encryptedSummonerId)) {
                            let matchId = activeGames.get(summoner.encryptedSummonerId).matchId; 
                            let teamId = activeGames.get(summoner.encryptedSummonerId).teamId; 
                            let isActive = postGameStatsList.has(matchId); 
                            console.log(summoner);
                            setTimeout(() => {
                                activeGames.delete(summoner.encryptedSummonerId)
                                postGameStats(matchId, summoner, teamId, isActive, channel); 
                            }, 60000); 
    
                            postGameStatsList.delete(matchId); 
                            console.log("Deleted..")
                            //TODO: Add post game stats for {gameId}
                        }
                    } 
                })
                
            }, i*delay)
        }
    }) 
}

function postGameStats(matchId, summoner, teamId, isActive, channel) {

    if(!isActive) {
        console.log("Post game stats already handled")
        return; 
    }
    fetchPostGame(matchId, (response) => {
        let matchData = response.data; 
        let summonerId = summoner.encryptedSummonerId; 

        let player = undefined; 
        for(p of matchData.participantIdentities) {
            if(p.player.summonerId === summonerId) {
                console.log("Found summoner id"); 
                player = p.player; 
                player.participantId = p.participantId; 
                break; 
            }
        } 
    
        //Check if win

        let win = false; 
        for(t of matchData.teams) {
            console.log("Summoner team id:", teamId)
            if(t.teamId === teamId) {
                if(t.win === 'Win') {
                    win = true;
                } 
            }
        }

            sendMessage(summoner.summonerName + " ble nettopp ferdig med et game og " + (win ? "vant" : "tapte.. :("), channel); 

    })

}

function sendMessage(embed, channel) {
    console.log("Sending..")
    channel.send(embed)
}

function formatTeams(spectatorData, channel) {


    getRanks(spectatorData.team1, function(team1League) {
        getRanks(spectatorData.team2, function(team2League) {

    let team1 = spectatorData.team1; 
    let team2 = spectatorData.team2; 
    for(const [i, p] of team1.entries()) {

        p.rank = "Unranked"; 
        p.tier = ""; 

        if(team1League[i][0] !== undefined) {

            for(league of team1League[i]) {
                if (league.queueType === "RANKED_SOLO_5x5") {
                    p.rank = league.rank; 
                    p.tier = league.tier;
                }
            } 
        }
    }

    for(const [i, p] of team2.entries()) {

        p.rank = "Unranked"; 
        p.tier = ""; 

        for(league of team2League[i]) {
            if (league.queueType === "RANKED_SOLO_5x5") {
                p.rank = league.rank; 
                p.tier = league.tier;
            }
        } 
    }


     let playerTeamId = getTeamId(spectatorData.team1, spectatorData.team2, spectatorData.playerSpectating);  

     let enemyTeamObject = spectatorData.team1[0].teamId !== playerTeamId ? team1 : team2; 
     let allyTeamObject = spectatorData.team1[0].teamId === playerTeamId ? team1 : team2; 

     let enemyTeam = ""; 
     let allyTeam = "";

     let enemyTeamRank = ""; 
     let allyTeamRank = ""; 
     for(player of enemyTeamObject) {
        enemyTeam += player.summonerName+"\n"; 
        enemyTeamRank += player.tier + " " + player.rank + "\n"; 
     }


     for (player of allyTeamObject) {
         if(player.summonerId === spectatorData.playerSpectating.encryptedSummonerId) {
            allyTeam += "**"+player.summonerName+"**" +"\n"; 
         }

         else {
            allyTeam += player.summonerName+"\n";
         }

         allyTeamRank += player.tier + " " + player.rank + "\n"; 
     }
     

     let embedAlly = {
         embed: {
            color: 3447003,
            author: "Test",
            title: "Live match information",
            description: "<@"+spectatorData.playerSpectating.id+"> / **" + spectatorData.playerSpectating.summonerName + "** gikk nettopp i et nytt game! (" + spectatorData.gameType + ")\nHer er lagene: ",
            fields: [{
                name: "Your Team",
                value: allyTeam,
                inline: true
            }, {
            name: "Rank",
            value: allyTeamRank, 
            inline: true
            }
        ]
     }
    }

    let embedEnemy = {
        embed: {
           color: 10038562,
           fields: [{
               name: "Enemy Team",
               value: enemyTeam,
               inline: true
           }, {
           name: "Rank",
           value: enemyTeamRank, 
           inline: true
           }
       ]
    }
   }

   sendMessage(embedAlly, channel);
   sendMessage(embedEnemy, channel); 
})
})

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
