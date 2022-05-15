const sqlite = require('sqlite3');
const TestDescriptor = require('../models/testDescriptor');
const TestResult = require('../models/testResult');
const User = require('../models/user');
const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const DBSOURCE = './db/EZWHDB.sqlite';
//'C:/Users/User/Downloads/polito/Master/I.2/Software engineering/project/EzWhCoding/code/server/db/EZWHDB.sqlite';

class DbManager2 {

    #db;

    constructor() {
        /*
        this.#db = new sqlite.Database(DBSOURCE, (err) => {
            if (err)
                throw err;
        });

        this.#db.get("PRAGMA foreign_keys = ON");
        */
    }

    closeDb() {
        this.#db.close();
    }

    //#region Sku/SkuItem (temporary)
    async getSku(id) {
        let sku;
        let sql = 'SELECT * FROM Sku WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [id], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    sku = new Sku(row.Description, row.Weight, row.Volume, row.Notes, row.Price, row.AvailableQuantity, row.Position, row.TestDescriptor, row.ID);
                }

                return resolve(sku);
            });
        })
    };

    async getSkuItem(rfid) {
        let skuItem;
        let sql = 'SELECT * FROM SkuItem WHERE RFID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [rfid], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    skuItem = new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available, row.TestResults);
                }

                return resolve(skuItem);
            });
        })
    };
    //#endregion

    //#region TestDescriptors
    async getAllTestDescriptors() {
        let testDescriptors = [];
        let sql = 'SELECT * FROM TestDescriptor';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    testDescriptors.push(new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId));
                }

                return resolve(testDescriptors);
            });
        })
    };

    async getTestDescriptor(id) {
        let testDescriptor;
        let sql = 'SELECT * FROM TestDescriptor WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [id], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    testDescriptor = new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId);
                }

                return resolve(testDescriptor);
            });
        })
    };

    async storeTestDescriptor(td) {
        let sql = 'INSERT INTO TestDescriptor (Name, ProcedureDescription, SkuId) VALUES (?,?,?)';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId()], function (err) {
                if (err)
                    return reject(err);

                return resolve(new TestDescriptor(this.lastID, td.getName(), td.getProcedureDescription(), td.getSkuId()));
            });
        })
    };

    async updateTestDescriptor(td) {
        let sql = 'UPDATE TestDescriptor SET Name=?, ProcedureDescription=?, SkuId=? WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId(), td.getId()], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    };

    async deleteTestDescriptor(id) {
        let sql = 'DELETE FROM TestDescriptor WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    };
    //#endregion

    //#region TestResults
    async getAllTestResultsBySkuIem(rfid) {
        let testResults = [];
        let sql = 'SELECT * FROM TestResult WHERE RFID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [rfid], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    testResults.push(new TestResult(row.ID, row.RFID, row.TestDescriptorId, row.Date, row.Result));
                }

                return resolve(testResults);
            });
        })
    };

    async getTestResult(id, rfid) {
        let testResult;
        let sql = 'SELECT * FROM TestResult WHERE ID=? AND RFID=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [id, rfid], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    testResult = new TestResult(row.ID, row.RFID, row.TestDescriptorId, row.Date, row.Result);
                }

                return resolve(testResult);
            });
        })
    }

    async storeTestResult(tr) {
        let sql = 'INSERT INTO TestResult(RFID, TestDescriptorId, Date, Result) VALUES (?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [tr.getRfid(), tr.getTestDescriptorId(), tr.getDate(), tr.getResult()], function (err) {
                if (err)
                    return reject(err);

                return resolve(new TestResult(this.lastID, tr.getRfid(), tr.getTestDescriptorId(), tr.getDate(), tr.getResult()));
            });
        })
    }

    async updateTestResult(tr) {
        let sql = 'UPDATE TestResult SET TestDescriptorId=?, Date=?, Result=? WHERE ID=? AND RFID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [tr.getTestDescriptorId(), tr.getDate(), tr.getResult(), tr.getId(), tr.getRfid()], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    }

    async deleteTestResult(id, rfid) {
        let sql = 'DELETE FROM TestResult WHERE ID=? AND RFID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id, rfid], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    }

    //#endregion

    //#region User
    async getUser(username, type) {
        let user;
        let sql = 'SELECT * FROM User WHERE Email=? AND Type=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [username, type], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    user = new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password);
                }

                return resolve(user);
            });
        })
    }

    async getAllUsersOfType(type) {
        let users = [];
        let sql = 'SELECT * FROM User WHERE Type=?';
        return new Promise((resolve, reject) => {
            this.#db.all(sql, [type], (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    users.push(new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password));
                }

                return resolve(users);
            });
        })
    }

    async getAllUsers() {
        let users = [];
        let sql = "SELECT * FROM User WHERE Type!='manager'";
        return new Promise((resolve, reject) => {
            this.#db.all(sql, (err, rows) => {
                if (err)
                    return reject(err);

                for (let row of rows) {
                    users.push(new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password));
                }

                return resolve(users);
            });
        })
    }

    async storeNewUser(us) {
        let sql = 'INSERT INTO User(Name, Surname, Email, Type, Password) VALUES (?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword()], function (err) {
                if (err)
                    return reject(err);

                return resolve(new User(this.lastID, us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword()));
            });
        })
    }

    async updateUser(us) {
        let sql = 'UPDATE User SET Name=?,Surname=?,Email=?,Type=?,Password=? WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword(), us.getId()], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    }

    async deleteUser(id) {
        let sql = 'DELETE FROM User WHERE ID=?';
        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id], function (err) {
                if (err)
                    return reject(err);

                return resolve(this.changes);
            });
        })
    }
    //#endregion
    
    /*
    async deleteSkuItem(){
        let sql = "DELETE FROM SkuItem WHERE RFID='12345678901234567890123456789011'";
        return new Promise((resolve, reject) => {
            this.#db.run(sql, function (err) {
                if (err)
                    reject(err);

                resolve(this.changes);
            });
        })
    }

    async updateSkuItem() {
        let sql = "UPDATE SkuItem SET RFID='12345678901234567890123456789011' WHERE RFID='12345678901234567890123456789018'";
        return new Promise((resolve, reject) => {
            this.#db.run(sql, function (err) {
                if (err)
                    reject(err);

                resolve(this.changes);
            });
        })
    }*/
}

//#region Test
/*
async function main() {
    const db2 = new DbManager2();

    //const a = await db2.getAllTestDescriptors();
    //console.log(a[1]);

    //console.log(await db2.getTestDescriptor(2));

    //console.log(await db2.storeTestDescriptor(new TestDescriptor(null,'test16','desc16',6)));

    //console.log(await db2.updateTestDescriptor(new TestDescriptor(17,'test16upd','desc16',6)));

    //console.log(await db2.deleteTestDescriptor(20));

    //const a = await db2.getAllTestResultsBySkuIem('rfid2');
    //console.log(a[0]);

    //console.log(await db2.getTestResult(2,'rfid1'));

    //console.log(await db2.storeTestResult(new TestResult(null,'rfid4',14,'23/04/2022',false)));
    
    //console.log(await db2.updateTestResult(new TestResult(7,'rfid4',144,'23/04/2022',false)));

    //console.log(await db2.deleteTestResult(7,'rfid4'));

    //console.log(await db2.getUser('e4@gmail.com'));

    //const a = await db2.getAllUsersOfType('CUSTOMER');
    //console.log(a[0]);

    //const a = await db2.getAllUsers();
    //console.log(a.length);

    //console.log(await db2.updateUser(new User(1,'N1','S1','e1@gmail.com','CLERK','pass1')));

    //console.log(await db2.deleteUser('e4@gmail.com'));

    //db2.closeDb();

    //console.log(await db2.deleteSkuItem().catch(err => err));
    //console.log(await db2.updateSkuItem());
}

main();
*/
//#endregion

module.exports = DbManager2;