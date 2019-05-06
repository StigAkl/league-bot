const LeagueDAO = require("./../Database/db"); 
const {fetchSummoner, fetchLeague, requestOk} = require("./../Api/api_fetchers"); 
const {getRank} = require("./../Helpers/ranks");
const constants = require("./../Helpers/constants");

module.exports = {
    name: "add",
    description: "!add <Summoner Name> - Adds your summoner to the live game tracking",
    cooldown: 5,

    execute(message, args) {

        let db = new LeagueDAO("./Database/summoners.db"); 
        let summonerName = ""; 
        for(let arg of args) {
            summonerName+= arg + " ";
        }
        fetchSummoner(summonerName.trim(), function(response) {
            if(requestOk(response.status)){
                const summoner = response.data; 
                summoner.authorId = message.author.id;  
                summoner.tier = "null"; 
                summoner.rank = "0"; 

                fetchLeague(summoner.id, function(res) {
                    let league = res.data; 
                    
                    for(let i = 0; i < league.length; i++) {
                        let currentLeague = league[i]; 
                        if(currentLeague.queueType === constants.SOLO_RANKED_TYPE) {
                            summoner.tier = currentLeague.tier; 
                            summoner.rank = getRank(currentLeague.rank); 
                            break; 
                        }
                    }

                    db.addSummoner(summoner, callback);
                })

            } else {
                if(response.data.status.status_code === 404) {
                    callback("Kunne ikke finne noen summoners med dette navnet. Sjekk at du skrev inn riktig navn");
                } else {
                    callback("Status: " + response.data.status.status_code + " " + response.data.status.message); 
                }
            }
        })

        function callback(msg) {
            if(msg) {
                message.channel.send(msg);
            }
        }
    }
};