const sqlite3 = require('sqlite3');

class LeagueDAO {
    constructor(dbFilePath) {

        console.log("Connecting to database..")
        this.db = new sqlite3.Database(dbFilePath, (error) => {
            if(error) {
                console.log("Could not connect to database", error)
            } else {
                console.log("Connected to database")
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
            rank INTEGER,
            active INTEGER
        )
        `;

        this.db.run(sql, (error) => {
            if(error) {
                console.log("Error creating summoner table: ", error)
            } else {
                console.log("createSummonerTable success");
            }
        })

    }

    addSummoner(summoner, callback) {
        let sql = `
        SELECT * FROM summoners WHERE id = ?
        `;

        this.db.get("SELECT * FROM summoners WHERE id=?", summoner.id, (err, row) => {
            let message = "";
            if(err) {
                message = "Det har skjedd en feil med databasen.. :/ "
            } else {
                if(row) {
                    message = row.summonerName + " er allerede lagt til!"; 
                } else {
                    message = summoner.name + " vil nå bli lagt til"; 
                    console.log(summoner); 
                }
            }
           callback(message); 

        }); 



        /* return this.db.get(sql, [summoner.id], (err, row) => {
            if(err) {
                console.log("Error: ", err.message);
                return; 
            }

            if(!row) {
                //Add to database
                return this.db.run(`INSERT INTO summoners VALUES(1234, 'Zekinava', 'kfkfkf', 'alalal', 'Gold', '1', 0)`, (err) => {
                    if(!err) {
                        console.log("Sucesss") 
                    } else {
                        console.log("Failed", err)
                    }
                })
            } else {
                return row; 
            } 
        }) */
    }
}

module.exports = LeagueDAO