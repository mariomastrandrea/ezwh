const sqlite = require('sqlite3');
const TestDescriptor = require('../models/testDescriptor');
const TestResult = require('../models/testResult');
const User = require('../models/user');
const DBSOURCE = './db/ezwh.sqlite';


class DbManager2 {

    #db;

    constructor() {
        this.#db = new sqlite.Database(DBSOURCE, (err) => {
            if (err)
                throw err;
        });
    }

    closeDb(){
        this.#db.close();
    }

    async getAllTestDescriptors() {
        let testDescriptors = [];
        let sql = 'SELECT * FROM TestDescriptor';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, (err, rows) => {
                if (err)
                    reject(err);

                for (let row of rows) {
                    testDescriptors.push(new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId));
                }

                resolve(testDescriptors);
            });
        })
    };

    async getTestDescriptor(id) {
        let testDescriptor;
        let sql = 'SELECT * FROM TestDescriptor WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [id], (err, rows) => {
                if (err)
                    reject(err);

                for (let row of rows) {
                    testDescriptor = new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId);
                }

                resolve(testDescriptor);
            });
        })
    };

    async storeTestDescriptor(td) {
        let sql = 'INSERT INTO TestDescriptor (Name, ProcedureDescription, SkuId) VALUES (?,?,?)';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId()], function(err){
                if (err)
                    reject(err);

                resolve(new TestDescriptor(this.lastID,td.getName(),td.getProcedureDescription(),td.getSkuId()));
            });
        })
    };

    async updateTestDescriptor(td) {
        let sql = 'UPDATE TestDescriptor SET Name=?, ProcedureDescription=?, SkuId=? WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId(), td.getId()], function(err){
                if (err)
                    reject(err);

                resolve(this.changes);
            });
        })
    };

    async deleteTestDescriptor(id) {
        let sql = 'DELETE FROM TestDescriptor WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id], function(err){
                if (err)
                    reject(err);

                resolve(this.changes);
            });
        })
    };
}

/*
async function main() {
    const db2 = new DbManager2();

    //const a = await db2.getAllTestDescriptors();
    //console.log(a[1]);

    //console.log(await db2.getTestDescriptor(12));

    //console.log(await db2.storeTestDescriptor(new TestDescriptor(null,'test16','desc16',6)));

    //console.log(await db2.updateTestDescriptor(new TestDescriptor(17,'test16upd','desc16',6)));

    //cosa deve dare in return delete?
    //console.log(await db2.deleteTestDescriptor(20));

    //db2.closeDb();
}

main();
*/

module.exports = DbManager2;