const {prefix, token, riotApiToken} = require("./botconfig.json"); 
const Discord = require("discord.js"); 
const {RichEmbed} = require('discord.js') 
const bot = new Discord.Client();
const URL = require("./Api/api_endpoints");
const fs = require('fs');
const xp = require("./Database/xp.json");
const eveCounter = require('./Database/eve.json');
const LeagueDAO = require('./Database/db')
const {fetchActiveMatch, getRanks, fetchPostGame, fetchLeague} = require('./Api/api_fetchers'); 
const constants = require('./Helpers/constants'); 
const {getRank, compareRanks, changeRankMessage} = require('./Helpers/ranks'); 

//Interval delays
const activeGameDelay = 60000; 
const activeGameDelayPerTeamMember = 1000; //Not implemented yet
const checkRanksDelay = 60*10*1000; 
const checkRanksEachSummonerDelay = 2000; 

//Collections
const commands = new Discord.Collection(); 
const cooldowns = new Discord.Collection(); 
const activeGames = new Discord.Collection(); 
const postGameStatsList = new Discord.Collection(); 

const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js')); 
const announcementChannel = "549629836478382091";

//Login
bot.login(token); 


//Fetch commands
for (const file of commandFiles) {
    const command = require(`./Commands/${file}`); 
    commands.set(command.name, command); 
}



bot.on("ready", async () =>  {
    console.log(`${bot.user.username} er nå online`);
    //const db = new LeagueDAO("./Database/summoners.db"); 
    setInterval(() => { checkRanks(bot.channels.get(announcementChannel))}, checkRanksDelay); 
    setInterval(() => { checkActiveGames(sendMessage, bot.channels.get(announcementChannel)) }, activeGameDelay); 
})


//Handle errors
bot.on("error", error => {
    console.error('Error event:\n' + JSON.stringify(error));
  });


//Handle commands
bot.on("message", async message => {

    if(message.author.bot) return;

    let authorId = message.author.id; 

    if(!xp[message.author.id]) {
        xp[authorId] = {
            xp: 0,
            level: 1
        };
    }
    

    let xpEarned = Math.floor(Math.random() * 10) + 10 + xp[authorId].level;
    xp[authorId].xp = xp[authorId].xp + xpEarned; 


    let nextLevel = xp[authorId].level*10+((xp[authorId].level -1)*10*2); 
    console.log("Needed for neext level:",nextLevel);
    if(nextLevel <= xp[authorId].xp) {
        xp[authorId].level = xp[authorId].level + 1
        console.log("Level up?")
        message.channel.send("Du gikk nettopp opp i level og er nå lvl " + xp[authorId].level + "!").then((msg) => {
            msg.delete(5000); 
        })
    }

    fs.writeFile("./Database/xp.json", JSON.stringify(xp), (error) => {
        if(error) console.log(error); 
    })

    if (!message.content.startsWith(prefix)) return; 

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

                            if(summoner.id === eveCounter.id) {
                                console.log("EVECOUNTER!"); 

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



                    for(p of response.data.participants) {
                            if(p.summonerName === eveCounter.summonerName) {
                                if(constants.getChampion(p.championId) === "Evelynn") {
                                    console.log("And you are playing evelynn :))");
                                    eveCounter.counter = eveCounter + 1; 
                                    sendMessage("Antall eve games: " + eveCounter.counter, channel);
                                    fs.writeFile("./Database/eve.json", JSON.stringify(eveCounter), (error) => {
                                        if(error) console.log("Error writing to eve.json"); 
                                    })

                                    break; 
                                } else {
                                    console.log("Not playing eve :/");
                                }
                            }
                        }
    
                        activeGames.set(summoner.encryptedSummonerId, spectatorData); 
                        postGameStatsList.set(spectatorData.matchId, summoner);
                        console.log("ACTIVE!!!!")
                        console.log(activeGames.get(summoner.encryptedSummonerId).matchId);
                        formatTeams(spectatorData, channel); 
                        
    
                    } else {
                        console.log("Game is already tracked"); 
                    }

                    } else {
                        console.log("KAKKAKAAKAKAKAKAKAKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
                        console.log("FINISHED GAME?ASDFLØKDSFKØFKDASKFØLSDKFØLADSKLFDSAKØLFASKØLFKASDØLFK?");
                        if(activeGames.has(summoner.encryptedSummonerId)) {
                            let matchId = activeGames.get(summoner.encryptedSummonerId).matchId; 
                            let teamId = activeGames.get(summoner.encryptedSummonerId).teamId; 
                            let isActive = postGameStatsList.has(matchId); 
                            console.log(summoner);
                            setTimeout(() => {
                                activeGames.delete(summoner.encryptedSummonerId)
                                postGameStats(matchId, summoner, teamId, isActive, channel); 
                            }, 120000); 
    
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
    console.log("POSTGAME*******************************************************")
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


    getRanks(spectatorData.team1, activeGameDelayPerTeamMember, function(team1League) {
        getRanks(spectatorData.team2, activeGameDelayPerTeamMember, function(team2League) {

    let team1 = spectatorData.team1; 
    let team2 = spectatorData.team2; 
    for(const [i, p] of team1.entries()) {

        p.rank = "Unranked"; 
        p.tier = ""; 

        if(team1League[i][0] !== undefined) {

            for(league of team1League[i]) {
                if (league.queueType === constants.SOLO_RANKED_TYPE) {
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
            if (league.queueType === constants.SOLO_RANKED_TYPE) {
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
        enemyTeam += player.summonerName+" ("+constants.getChampion(player.championId)+")\n";
        enemyTeamRank += player.tier + " \t" + player.rank + "\n"; 
     }


     for (player of allyTeamObject) {
         if(player.summonerId === spectatorData.playerSpectating.encryptedSummonerId) {
            allyTeam += "**"+player.summonerName+"** (" + constants.getChampion(parseInt(player.championId))+")\n"; 
         }

         else {
            allyTeam += player.summonerName+" ("+constants.getChampion(player.championId)+")\n";
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
           name: "\tRank",
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

function checkRanks(channel) {
    const db = new LeagueDAO("./Database/summoners.db");
    db.getAllSummoners((summoners) => {
        
        //Loop through the summoners
        (function theLoop (data, i) {
            setTimeout(function () {
              

                let summoner = summoners[i-1]; 

                fetchLeague(summoner.encryptedSummonerId, (response) => {

                    
                    if(response && response.status === 200) {
                        
                        let leagues = response.data;

                        let oldRank = {
                            tier: summoner.tier, 
                            rank: summoner.rank
                        }

                        for(league of leagues) {
                            if(league.queueType === constants.SOLO_RANKED_TYPE) {
                                let newRank = {
                                    tier: league.tier,
                                    rank: getRank(league.rank)
                                }
                                
                                let rankChange = compareRanks(oldRank, newRank);

                                if(rankChange !== 0) {
                                    db.updateSummonerRank(summoner.id, newRank, (status) => { 
                                        let message = changeRankMessage(rankChange, newRank, summoner);  
                                        sendMessage(message, channel)
                                    })
                                }
                                break; 
                            }
                        }


                    }  else {

                        if(response) {
                        console.error(response.status, "Error fetching league for: ", summoner);

                        if(response.status === 401 || response.status === 403){
                            console.error("Terminating.."); 
                            process.exit(); 
                        } 
                    } else {

                        try {
                        console.error("Error, response is undefined at. Triggering error: ");
                        console.error(response.status);  
                        } catch(err) {
                            console.log(err); 
                        } finally {
                            process.exit(); 
                        }
                    }
                }

                    if (--i) {    
                        theLoop(data, i); 
                      }
                }); 

            }, checkRanksEachSummonerDelay);
          })(summoners, summoners.length);


    })
}

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
   }
