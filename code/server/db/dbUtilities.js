const sqlite = require('sqlite3').verbose();
const dbSource = './db/EZWHDB.sqlite';

// db connection 
const dbConnection = new sqlite.Database(dbSource, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');
});

dbConnection.get("PRAGMA foreign_keys=ON");

// module export
module.exports = { dbConnection };