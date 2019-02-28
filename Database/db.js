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
            id TEXT PRIMARY KEY,
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

        this.db.close(); 

    }

    addSummoner(summoner, callback) {

        this.db.get("SELECT * FROM summoners WHERE id=?", summoner.author_id, (err, row) => {
            let message = "";
            if(err) {
                message = "Det har skjedd en feil med databasen.. :/ "
            } else {
                if(row) {
                    message = "Følgende bruker er allerede registrert på deg: " + row.summonerName; 
                } else {
                    this.db.run(`INSERT INTO summoners VALUES ('${summoner.author_id}', '${summoner.name}', '${summoner.id}', '${summoner.accountId}', '${summoner.tier}', ${summoner.rank}, 0)`, (error) => {
                        if(error) {
                            message = "Det oppstod en feil når jeg forsøkte å registrere en bruker på deg";  
                        } else {
                            message = "Brukeren " + summoner.name + " er nå registrert på deg og vil bli tracket med live match information i fremtiden. Stay tuned! :smile:"; 
                        }
                        callback(message); 
                    }); 
                }
            }
            callback(message); 
        }); 

        this.db.close(); 
    }

    updateSummonerRank(id, rank, callback) {
        let sql = `UPDATE summoners SET tier=${rank.tier}, rank=${rank.rank} WHERE id=${id}`; 

        console.log("Running db update")
        this.db.run(sql, (err) => {
            if(err) {
                console.error("Error occured when updating rank in database for summoner", id); 
                console.error(err); 
            } else {
                callback("Summoner updated!"); 
            }
        })
    }

    removeSummoner(id, callback) {
        let sql = `
        DELETE FROM summoners WHERE id = ${id}
        `;

        this.db.run(sql, function(err) {
            if(err) {
                callback(err)
            } else {
                callback("Ingen league kontoer er nå knyttet til deg")
            }
        })

        this.db.close(); 
    }

    getAllSummoners(callback) {
        this.db.all("SELECT * FROM summoners", (err, rows) => {
            if(!err) {
                if (rows) {
                    callback(rows); 
                }
            }
        })
    }
}

module.exports = LeagueDAO