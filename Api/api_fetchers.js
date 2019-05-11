const URL = require("./api_endpoints"); 
const axios = require("axios");
const {riotApiToken} = require("./../botconfig.json");


module.exports = {


      fetchSummoner: (summonerName, callback) => {     
              axios.get(URL.basePath+URL.summonerByName+summonerName+"?api_key="+riotApiToken).then(function(response) {
                      callback(response); 
              }).catch((error) => {
                      console.error("Fetch summoner failed: ", error.response); 
                      callback(error.response); 
              })
      },

      getRanks: (team, delay, callback) => {

        let id1 = team[0].summonerId; 
        let id2 = team[1].summonerId; 
        let id3 = team[2].summonerId; 
        let id4 = team[3].summonerId; 
        let id5 = team[4].summonerId; 

        axios.get(URL.basePath+URL.leagueBySummonerId+id1+"?api_key="+riotApiToken).then(function(p1) {     
                axios.get(URL.basePath+URL.leagueBySummonerId+id2+"?api_key="+riotApiToken).then(function(p2) {     
                        axios.get(URL.basePath+URL.leagueBySummonerId+id3+"?api_key="+riotApiToken).then(function(p3) {     
                                axios.get(URL.basePath+URL.leagueBySummonerId+id4+"?api_key="+riotApiToken).then(function(p4) {     
                                        axios.get(URL.basePath+URL.leagueBySummonerId+id5+"?api_key="+riotApiToken).then(function(p5) {   

                                                let teamArr = [p1.data, p2.data, p3.data, p4.data, p5.data];
                                                callback(teamArr); 
                                        }).catch((error) => {
                                                console.error("Error fetching p5: ", error.response); 
                                        })
                                }).catch((error) => {
                                        console.error("Error fetching p4: ", error.response); 
                                })
                        }).catch((error) => {
                                console.error("Error fetching p3: ", error.response); 
                        })
                }).catch((error) => {
                        console.error("Error fetching p2: ", error.response); 
                })
        }).catch((error) => {
                console.error("Error fetching p1: ", error.response); 
        })

      },

      fetchLeague: (summonerId, callback) => {
              axios.get(URL.basePath+URL.leagueBySummonerId+summonerId+"?api_key="+riotApiToken).then(function(response) {
                callback(response); 
              }).catch((error) => {
                      console.error("Fetch league error:", error.response);
                      callback(error.response);
              })
      },

      fetchActiveMatch: (summonerId, callback) => {
        axios.get(URL.basePath+URL.activeGameSpectator+summonerId+"?api_key="+riotApiToken).then(function(response) { 
                callback(response); 
        }).catch((error) => {
                callback(error.response);
        });
      },

      fetchPostGame: (matchId, callback) => {
        console.log("Fetching after-game stats...");
        axios.get(URL.basePath+URL.matchByMatchId+matchId+"?api_key="+riotApiToken).then(function(response) {
                callback(response); 
        }).catch((error) => {
                console.error("Error fetching post stats: ", error);
        });
      },

      requestOk(status) {
              if(status === 200) {
                  return true; 
              } else {
                  return false; 
              }
      }
};