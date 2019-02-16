const LeagueDAO = require('./../Database/db'); 

module.exports = {
   name: 'remove',
   description: '!remove vill fjerne kontoen som er knytte til deg',
   cooldown: 1,
   execute(message, args) {
    
      let db = new LeagueDAO('./Database/summoners.db'); 
      const id = message.author.id; 
      db.removeSummoner(id, function(msg) {
         message.channel.send(msg); 
      })

   }
}