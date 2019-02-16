const URL = require("./api_endpoints"); 
const axios = require('axios');
const {riotApiToken} = require('./../botconfig.json')


module.exports = {


      fetchSummoner: (summonerName, callback) => {     
              axios.get(URL.basePath+URL.summonerByName+summonerName+"?api_key="+riotApiToken).then(function(response) {
                      callback(response); 
              }).catch(error => {
                        callback(error.response); 
              })
      },

      fetchMatches: (summonerName) => {
              console.log("Fetching matches for ", summonerName);
      }, 

      requestOk(status) {
              if(status === 200) {
                  return true; 
              } else {
                  return false; 
              }
      }
}