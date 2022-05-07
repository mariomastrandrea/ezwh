const sqlite3 = require('sqlite3').verbose();
const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const Item = require('../models/item');
const DBSOURCE = './db/ezwh.sqlite';

const {
    generateInternalOrders, 
    generateReturnOrders,
    generateRestockOrders
} = require('../controller/utility') 

const tables = [
    'sku',
    'skuitem',
    'item',
    'restockOrder',
    'returnOrder',
    'internalOrder'
]

const params = {
    sku: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'description text',
        'weight numeric', 
        'volume numeric',
        'notes text',
        'position text',
        'availableQuantity numeric',
        'price numeric',
        'testDescriptor text'
    ],
    skuitem: [
        'RFID text PRIMARY KEY',
        'SKUId numeric',
        'Available numeric',
        'DateOfStock text',
        'TestResults text',
        'FOREIGN KEY(SKUId) REFERENCES sku(id)'
    ],
    item: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'description text',
        'price numeric',
        'skuId numeric',
        'supplierId numeric ',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
    ],
    restockOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'products text',
        'supplierId numeric',
        'transportNote numeric',
        'skuItems text',
    ],
    returnOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'returnDate text',
        'products text',
        'restockOrderId numeric',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)'
    ],
    internalOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'products text',
        'customerId numeric',
    ]
}

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.');
        for (let table of tables) {
            db.run(`CREATE TABLE IF NOT EXISTS ${table} (${params[table].join(', ')})`);
        }
    }
});

const dbManagerFactory = (function() {

    function DbManager() {
        this.db = db;

        // SKU
        this.getSku = (skuId) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM sku WHERE id = ${skuId}`;
                db.get(sql, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(typeof row !== 'undefined'){
                        resolve(new Sku(row.description, row.weight, row.volume, row.notes, row.price, row.availableQuantity, row.position, row.testDescriptor, row.id));
                    } else {
                        reject('No sku found');
                    }
                })
            });
            
        }
    
        this.getAllSkus = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM sku`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(rows.length > 0){
                        resolve(rows.map(row => new Sku(row.description, row.weight, row.volume, row.notes, row.price, row.availableQuantity,  row.position, row.testDescriptor, row.id)));
                    } else {
                        reject('No skus found');
                    }
                })
            });
        }
    
        this.storeSku = (sku) => {
            const sql = `INSERT INTO sku (description, weight, volume, notes, position, availableQuantity, price, testDescriptor) VALUES (?,?,?,?,?,?,?,?)`;
            const params = [sku.description, sku.weight, sku.volume, sku.notes, sku.position, sku.availableQuantity, sku.price, sku.testDescriptor];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }

        this.updateSku = (sku) => {
            const sql = `UPDATE sku SET description = ?, weight = ?, volume = ?, notes = ?, position = ?, availableQuantity = ?, price = ?, testDescriptor = ? WHERE id = ?`;
            const params = [sku.description, sku.weight, sku.volume, sku.notes, sku.position, sku.availableQuantity, sku.price, sku.testDescriptor, sku.id];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }
    
        this.deleteSku = (skuId) => {
            const sql = `DELETE FROM sku WHERE id = ?`;
            const params = [skuId];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }

        // SKUITEM
        this.getAllSkuItems = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM skuitem`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(rows.length > 0){
                        resolve(rows.map(row => new SkuItem(row.RFID, row.SKUId, row.DateOfStock, row.Available, row.TestResults)));
                    } else {
                        reject('No skuitems found');
                    }
                })
            });
        };

        this.getSkuItem = (skuItemId) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM skuitem WHERE RFID LIKE '${skuItemId}'`;
                db.get(sql, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(typeof row !== 'undefined'){
                        resolve(new SkuItem(row.RFID, row.SKUId, row.DateOfStock, row.Available, row.TestResults));
                    } else {
                        reject('No skuitem found');
                    }
                })
            });
        }

        this.getAvailableSkuItems = (SkuId) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM skuitem WHERE Available = 1 AND SKUId = ${SkuId}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(rows.length > 0){
                        resolve(rows.map(row => new SkuItem(row.RFID, row.SKUId, row.DateOfStock, row.Available, row.TestResults)));
                    } else {
                        reject('No skuitems found');
                    }
                })
            });
        }

        this.storeSkuItem = (skuItem) => {
            const sql = `INSERT INTO skuitem (RFID, SKUId, DateOfStock, Available, TestResults) VALUES (?,?,?,?,?)`;    
            const params = [skuItem.RFID, skuItem.SKUId, skuItem.DateOfStock, skuItem.Available, skuItem.TestResults];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }

        this.updateSkuItem = (skuItem) => {
            const sql = `UPDATE skuitem SET RFID = ?, SKUId = ?, DateOfStock = ?, Available = ?, TestResults = ? WHERE RFID = ?`;
            const params = [skuItem.RFID, skuItem.SKUId, skuItem.DateOfStock, skuItem.Available, skuItem.TestResults, skuItem.RFID];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }

        this.deleteSkuItem = (skuItemId) => {
            const sql = `DELETE FROM skuitem WHERE RFID = ?`;
            const params = [skuItemId];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        }

        // ITEM
        this.getAllItems = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM item`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(rows.length > 0){
                        resolve(rows.map(row => new Item(row.id, row.description, row.price, row.skuId, row.supplierId)));
                    } else {
                        reject('No items found');
                    }
                })
            });
        };

        this.getItem = (itemId) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM item WHERE id = ${itemId}`;
                db.get(sql, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if(typeof row !== 'undefined'){
                        resolve(new Item(row.id, row.description, row.price, row.skuId, row.supplierId));
                    } else {
                        reject('No item found');
                    }
                })
            });
        };

        this.storeItem = (item) => {
            const sql = `INSERT INTO item (id, description, price, skuId, supplierId) VALUES (?,?,?,?,?)`;
            const params = [item.id, item.description, item.price, item.skuId, item.supplierId];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        };

        this.updateItem = (item) => {
            const sql = `UPDATE item SET id = ?, description = ?, price = ?, skuId = ?, supplierId = ? WHERE id = ?`;
            const params = [item.id, item.description, item.price, item.skuId, item.supplierId, item.id];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        };

        this.deleteItem = (itemId) => {
            const sql = `DELETE FROM item WHERE id = ?`;
            const params = [itemId];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve(1);
                })
            });
        };

        this.db = generateInternalOrders();
    
        this.dbreturn = generateReturnOrders();
        
        this.dbrestock = generateRestockOrders();
    
        // internal orders functions
        this.getAllInternalOrders = () => this.db;
        this.getInternalOrderInState = (state) => this.db.filter(io => io.getState() === state);
        this.getInternalOrder = (id) => this.db.filter(io => io.getId() === id);
        this.getNextAvailableIOId = () => this.db.length+1;
        this.storeInternalOrder = (io) => this.db.push(io);
        this.updateInternalOrder = function (io) { 
            this.db = this.db.map(oldIo => oldIo.getId() == io.getId() ? io : oldIo)
        };
        this.deleteInternalOrder = function (id) { 
            this.db = this.db.filter(io => io.getId() !== id)
        };
    
        // return orders functions
        this.getAllReturnOrders = () => this.dbreturn;
        this.getReturnOrder = (id) => this.dbreturn.filter(io => io.getId() === id);
        this.getNextAvailableReturnOId = () => this.dbreturn.length+1;
        this.storeReturnOrder = (ro) => this.dbreturn.push(ro);
        this.deleteReturnOrder = function (id) {
            this.dbreturn = this.dbreturn.filter(io => io.getId() !== id)
        }
    
        // return orders functions
        this.getAllRestockOrders = () => this.dbrestock;
        this.getRestockOrdersInState = (state) => this.dbrestock.filter(io => io.getState() === state);
        this.getRestockOrder = (id) => this.dbrestock.filter(io => io.getId() === id);
        this.getNextAvailableRestockOId = () => this.dbrestock.length+1;
        this.updateRestockOrder = function (ro) {
            this.dbrestock = this.dbrestock.map(oldRo => oldRo.getId() == ro.getId() ? ro : oldRo)
        }
        this.storeRestockOrder = (ro) => this.dbrestock.push(ro);
        this.deleteRestockOrder = function (id) {
            this.dbrestock = this.dbrestock.filter(io => io.getId() !== id)
        }
    
    
    }

    let instance;
    return {
        getInstance: function() {
            if (!instance) {
                instance = new DbManager();
            }
            return instance;
        }
    }
})();

module.exports = dbManagerFactory;