const sqlite3 = require('sqlite3');

class LeagueDAO {
    constructor(dbFilePath) {

        console.log("Connecting..")
        this.db = new sqlite3.Database(dbFilePath, (error) => {
            if(error) {
                console.log("Could not connect to database")
            } else {
                console.log("Connected to database")
                this.createSummonerTable()
            }
        })
    }

    createSummonerTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS summoners (
            id INTEGER PRIMARY KEY,
            summonerName TEXT, 
            encryptedSummonerId TEXT,
            encryptedAccountId TEXT,
            tier TEXT,
            rank INTEGER
        )
        `;

        this.db.run(sql, (error) => {
            if(error) {
                console.log("Error creating summoner table: ", error)
            } else {
                console.log("createSummonerTable success");
            }
        })

        this.db.close(); 
    }

    addSummoner(summoner) {

    }
}

module.exports = LeagueDAO