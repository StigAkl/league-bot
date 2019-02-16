const LeagueDAO = require('./../Database/db'); 
const {fetchSummoner, requestOk} = require('./../Api/api_fetchers'); 

module.exports = {
    name: 'add',
    description: '!add <Summoner Name> - Adds your summoner to the live game tracking',
    cooldown: 5,

    execute(message, args) {

        let db = new LeagueDAO('./Database/summoners.db'); 

        fetchSummoner(args[0], function(response) {
            console.log(response); 
            if(requestOk(response.status)){
                const summoner = response.data;   
                db.addSummoner(summoner, callback);
            } else {
                if(response.data.status.status_code === 404) {
                    callback("Kunne ikke finne noen summoners med dette navnet. Sjekk at du skrev inn riktig navn")
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
}