function tierToValue(tier) {
    let value = -1; 

    switch(tier.toLowerCase()) {
        case "iron":
            value=1; 
            break; 
        case "bronze":
            value=2; 
            break; 
        case "silver":
            value=3;
        break; 
        case "gold":
            value=4; 
            break; 
        case "platinum":
            value=5; 
            break; 
        case "diamond":
            value=6;
            break; 
        case "master": 
            value=7;
            break;  
        case "grandmaster":
            value=8; 
            break; 
        case "challenger":
            value=9; 
            break; 
    }

    return value; 
}


module.exports = {
    //2 = Placement
    //1 = Promoted
    //0 = Nothing
    //-1 = Demoted
    compareRanks(oldRank, newRank) {

    if(oldRank.rank === 0 && oldRank.tier === "null") {
        return 2; 
    }

    let value1 = tierToValue(oldRank.tier); 
    let value2 = tierToValue(newRank.tier); 

    if(value1 < value2) {
        return 1; 
    }

    if(value1 > value2) {
        return -1; 
    }

    if(oldRank.rank === newRank.rank) {
        return 0; 
    }

    if(oldRank.rank < newRank.rank) {
        return -1; 
    } else {
        return 1; 
    }
},

    getRank(rank) {
        if(rank === "I") {
            return 1;
        }

        if(rank === "II") {
            return 2; 
        }

        if(rank === "III") {
            return 3; 
        }

        return 4; 
    }, 

    changeRankMessage(rankChange, newRank, summoner) {

        let message = ""; 
        if(rankChange === 1) {
            message = "```yaml\n" + summoner.summonerName + " got promoted to " + newRank.tier + " " + newRank.rank + "!" + "\n``` :smile:"; 
        } else {
            if(rankChange === -1) {
                message = "```diff\n-" +summoner.summonerName + " got demoted to " + newRank.tier + " " + newRank.rank + " ``` :cry:" ;
            } else {
                if (rankChange === 2) {
                    message = "```fix\n" +summoner.summonerName + " just finished the placement series and got placed in " + newRank.tier + " " + newRank.rank + ". Good luck!"+ "\n``` :smile:"; 
                }
            }
        }
        return message; 
    }
};