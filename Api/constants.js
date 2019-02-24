module.exports = {
   gameType: function (gameQueueConfigId) {
      let gameMode = ""; 
      switch(gameQueueConfigId) {
         case 75: 
         gameMode = "6v6 Hexakill"
         break; 

         case 76: 
         gameMode = "Ultra Rapid Fire"
         break;

         case 78: 
         gameMode = "One For All: Mirror Mode"
         break; 

         case 100:
         gameMode = "ARAM"
         break; 
         case 310:
         gameMode = "Nemesis games"
         break; 
         case 313:
         gameMode = "Black Market Brawlers games"
         break; 
         case 317:
         gameMode = "Definitely Not Dominion games"
         break; 
         case 325:
         gameMode = "All Random games"
         break; 
         case 400:
         gameMode = "Normal Draft"
         break; 
         case 420:
         gameMode = "Ranked Solo/Duo"
         break; 
         case 430:
         gameMode = "Normal Blind pick"
         break; 
         case 440:
         gameMode = "Ranked Flex"
         break; 
         case 450:
         gameMode = "ARAM"
         break; 
         case 900:
         gameMode = "ARURF"
         break; 
         case 1020:
         gameMode = "One for All"
         break; 
         default: 
         gameMode = "0"
      }

      return gameMode; 
   }
}