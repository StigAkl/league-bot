const eveCounter = require('./../Database/eve.json'); 

module.exports = {
 name: 'counter',
 description: 'Count how many games with eve / goal num of games',
 cooldown: 5,
 execute(message, args) {

    if(message.author.id !== eveCounter.id) { 
     console.log("Invalid");
   } else {
     let response = "Du har " + eveCounter.counter + " / " + eveCounter.goal + " games med eve :smile:";  
     message.channel.send(response);
   }
 }
}