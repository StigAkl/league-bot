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

      fetchLeague: (summonerId, callback) => {
              axios.get(URL.basePath+URL.leagueBySummonerId+summonerId+"?api_key="+riotApiToken).then(function(response) {
                callback(response); 
              }).catch(error => {
                      callback(error.response)
              })
      },

      fetchActiveMatch: (summonerId, callback) => {
              console.log(URL.basePath+URL.activeGameSpectator+summonerId+"?api_key="+riotApiToken)
        axios.get(URL.basePath+URL.activeGameSpectator+summonerId+"?api_key="+riotApiToken).then(function(response) { 
                callback(response); 
        }).catch(error => {
                callback(error.response); 
        })
      },

      requestOk(status) {
              if(status === 200) {
                  return true; 
              } else {
                  return false; 
              }
      }
}