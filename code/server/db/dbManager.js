const sqlite3 = require('sqlite3').verbose();
const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const Item = require('../models/item');

const RestockOrder = require('../models/restockOrder');
const InternalOrder = require('../models/internalOrder');
const ReturnOrder = require('../models/returnOrder');

const DBSOURCE = './db/ezwh.sqlite';


const tables = [
    'sku',
    'skuitem',
    'item',
    'restockOrder',
    'restockOrderSkuItem',
    'returnOrder',
    'internalOrder',
    'internalOrderSkuItem',
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
        'id INTEGER',
        'issueDate text',
        'state text',
        'skuId numeric',
        'description text',
        'price numeric',
        'supplierId numeric',
        'transportNote text',
        'quantity numeric',
        'PRIMARY KEY(id, skuId)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)'
    ],
    restockOrderSkuItem: [
        'restockOrderId numeric',
        'skuId numeric',
        'RFID text',
        'PRIMARY KEY(restockOrderId, skuId, RFID)',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(RFID) REFERENCES skuitem(RFID)'
    ],
    returnOrder: [
        'id INTEGER',
        'returnDate text',
        'skuId numeric',
        'description text',
        'price numeric',
        'rfid text',
        'restockOrderId numeric',
        'PRIMARY KEY(id, rfid)',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(rfid) REFERENCES skuitem(RFID)'
    ],
    internalOrder: [
        'id INTEGER',
        'issueDate text',
        'state text',
        'skuId text',
        'description text',
        'price numeric',
        'quantity numeric',
        'customerId numeric',
        'PRIMARY KEY(id, SKUId)',
        'FOREIGN KEY(SKUId) REFERENCES sku(id)',
        'FOREIGN KEY(customerId) REFERENCES customer(id)'
    ],
    internalOrderSkuItem: [
        'internalOrderId numeric',
        'skuId numeric',
        'RFID text',
        'PRIMARY KEY(internalOrderId, skuId, RFID)',
    ],

}

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.');
        for (let table of tables) {
            db.run(`CREATE TABLE IF NOT EXISTS ${table} (${params[table].join(', ')})`);
        }
    }
});

const dbManagerFactory = (function () {

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
                    if (typeof row !== 'undefined') {
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
                    if (rows.length > 0) {
                        resolve(rows.map(row => new Sku(row.description, row.weight, row.volume, row.notes, row.price, row.availableQuantity, row.position, row.testDescriptor, row.id)));
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
                    if (rows.length > 0) {
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
                    if (typeof row !== 'undefined') {
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
                    if (rows.length > 0) {
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
                    if (rows.length > 0) {
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
                    if (typeof row !== 'undefined') {
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


        // internal orders functions
        this.getAllInternalOrders = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT id, issueDate, state, io.skuId, description, quantity, customerId, RFID FROM internalOrder as io LEFT JOIN  internalOrderSkuItem si ON io.id = si.internalOrderId and io.skuId = si.skuId`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let listOfIds = [];
                        let orders = [];
                        let products = [];
                        for (const row of rows) {
                            console.log(row)
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price
                            };
                            if (row.RFID){
                                rowProducts.RFID = row.RFID;
                            }else{
                                rowProducts.qty = row.quantity;
                            }
                            if (!listOfIds.includes(row.id)) {
                                listOfIds.push(row.id);
                                orders.push(
                                    {
                                        id: row.id,
                                        issueDate: row.issueDate,
                                        state: row.state,
                                        products: [],
                                        customerId: row.customerId,
                                    }
                                );
                                products.push([rowProducts]);
                            } else {
                                const orderId = listOfIds.indexOf(row.id);
                                products[orderId].push(rowProducts);
                            }
                        }
                        for (let i = 0; i < orders.length; i++) {
                            orders[i].products = products[i];
                        }
                        resolve(orders.map(order => new InternalOrder(order.issueDate, order.products, order.customerId, order.state, order.id)));
                    } else {
                        reject('No internalOrders found');
                    }
                })
            });
        };
        this.getInternalOrderInState = (state) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM internalOrder WHERE state LIKE ?`;
                const params = [state];
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let listOfIds = [];
                        let orders = [];
                        let products = [];
                        for (const row of rows) {
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price,
                                qty: row.quantity
                            };
                            if (!listOfIds.includes(row.id)) {
                                listOfIds.push(row.id);
                                orders.push(
                                    {
                                        id: row.id,
                                        issueDate: row.issueDate,
                                        state: row.state,
                                        products: [],
                                        customerId: row.customerId,
                                    }
                                );
                                products.push([rowProducts]);
                            } else {
                                const orderId = listOfIds.indexOf(row.id);
                                products[orderId].push(rowProducts);
                            }
                        }
                        for (let i = 0; i < orders.length; i++) {
                            orders[i].products = products[i];
                        }
                        resolve(orders.map(order => new InternalOrder(order.issueDate, order.products, order.customerId, order.state, order.id)));
                    } else {
                        reject('No internal found in state ' + state);
                    }
                })
            });
        };
        this.getInternalOrder = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT id, issueDate, state, io.skuId, description, quantity, customerId, RFID FROM internalOrder as io LEFT JOIN  internalOrderSkuItem si ON io.id = si.internalOrderId and io.skuId = si.skuId WHERE id = ${id}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let products = [];
                        for (const row of rows) {
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price
                            };
                            if (row.RFID){
                                rowProducts.RFID = row.RFID;
                            }else{
                                rowProducts.qty = row.quantity;
                            }
                            products.push(rowProducts);
                        }
                        resolve(new InternalOrder(rows[0].issueDate, products, rows[0].customerId, rows[0].state, rows[0].id));
                    } else {
                        reject('No internal order found');
                    }
                })
            });
        };
        this.storeInternalOrder = (io) => {
            let sql = `INSERT INTO internalOrder (id, issueDate, state, skuId, description, price, quantity, customerId) VALUES (?,?,?,?,?,?,?,?)`;
            const params = [];
            for (const sku of io.products) {
                params.push([io.id, io.issueDate, io.state, sku.SKUId, sku.description, sku.price, sku.quantity, io.customerId]);
            }
            return new Promise((resolve, reject) => {
                let statement = db.prepare(sql);
                for (let i = 0; i < params.length; i++) {
                    statement.run(params[i], (err) => { reject(err) });
                }
                statement.finalize();
                resolve(1);
            });

        };
        this.updateInternalOrder = (io) => {
            const sql = `UPDATE internalOrder SET state = ? WHERE id = ?`;
            const params = [io.state, io.id];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    } else {
                        resolve(1);
                    }
                });
            });
        };

        this.getInternalOrderSkuItems = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM internalOrderSkuItem WHERE internalOrderId = ${id}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows.map(row => {
                                return {
                                    SKUId: row.skuId,
                                    RFID: row.RFID,
                                }
                            }));
                        } else {
                            reject('No skuItems found');
                        }
                    }
                });
            });
        }

        this.storeInternalOrderSkuItems = (id, skuItems) => {
            let sql = `INSERT INTO internalOrderSkuItem (internalorderId, skuId, RFID) VALUES (?,?,?)`;
            const params = [];
            for (const skuItem of skuItems) {
                params.push([id, skuItem.SkuID, skuItem.RFID]);
            }
            return new Promise((resolve, reject) => {
                let statement = db.prepare(sql);
                for (let i = 0; i < params.length; i++) {
                    statement.run(params[i], (err) => { reject(err) });
                }
                statement.finalize();
                resolve(1);
            });
        }
        this.deleteInternalOrderSkuItems = (id) => {
            const sql = `DELETE FROM internalOrderSkuItem WHERE internalOrderId = ?`;
            const params = [id];
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
        this.deleteInternalOrder = (id) => {
            const sql = `DELETE FROM internalOrder WHERE id = ?`;
            const params = [id];
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

        // return orders functions
        this.getAllReturnOrders = () => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM returnOrder`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let listOfIds = [];
                        let orders = [];
                        let products = [];
                        for (const row of rows) {
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price,
                                RFID: row.rfid
                            };
                            if (!listOfIds.includes(row.id)) {
                                listOfIds.push(row.id);
                                orders.push(
                                    {
                                        id: row.id,
                                        returnDate: row.returnDate,
                                        products: [],
                                        restockOrderId: row.restockOrderId
                                    }
                                );
                                products.push([rowProducts]);
                            } else {
                                const orderId = listOfIds.indexOf(row.id);
                                products[orderId].push(rowProducts);
                            }
                        }
                        for (let i = 0; i < orders.length; i++) {
                            orders[i].products = products[i];
                        }
                        resolve(orders.map(order => new ReturnOrder(order.returnDate, order.products, order.restockOrderId, order.id)));
                    } else {
                        reject('No returnOrders found');
                    }
                })
            });
        };
        this.getReturnOrder = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM returnOrder WHERE id = ${id}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let products = [];
                        for (const row of rows) {
                            products.push({
                                SKUId: row.skuId,
                                description: row.description,
                                RFID: row.rfid
                            });
                        }
                        resolve(new ReturnOrder(rows[0].returnDate, products, rows[0].restockOrderId, rows[0].id));
                    } else {
                        reject('No return order found');
                    }
                })
            });
        };
        this.storeReturnOrder = (ro) => {
            let sql = `INSERT INTO returnOrder (id, returnDate, skuId, description, price, rfid, restockOrderId) VALUES (?,?,?,?,?,?,?)`;
            const params = [];
            for (const skuItem of ro.products) {
                params.push([ro.id, ro.returnDate, skuItem.SKUId, skuItem.description, skuItem.price, skuItem.RFID, ro.restockOrderId]);
            }
            return new Promise((resolve, reject) => {
                let statement = db.prepare(sql);
                for (let i = 0; i < params.length; i++) {
                    statement.run(params[i], (err) => { reject(err) });
                }
                statement.finalize();
                resolve(1);
            });
        };
        this.deleteReturnOrder = function (id) {
            const sql = `DELETE FROM returnOrder WHERE id = ?`;
            const params = [id];
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

        // restock orders functions
        this.getAllRestockOrders = () => {
            return new Promise((resolve, reject) => {
                const sql = `select id, issueDate, state, ro.skuId, description, price, supplierId, transportNote, quantity, si.skuId, RFID from restockOrder as ro LEFT JOIN restockOrderSkuItem as si ON ro.id = si.restockOrderId`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let listOfIds = [];
                        let orders = [];
                        let products = [];
                        let skuItems = [];
                        for (const row of rows) {
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price,
                                qty: row.quantity
                            };
                            let rowSkuItems = {
                                //todo add row Sku items
                            }
                            if (!listOfIds.includes(row.id)) {
                                listOfIds.push(row.id);
                                orders.push(
                                    {
                                        id: row.id,
                                        issueDate: row.issueDate,
                                        state: row.state,
                                        products: [],
                                        supplierId: row.supplierId,
                                        transportNote: row.transportNote,
                                        skuItems: []
                                    }
                                );
                                products.push([rowProducts]);
                            } else {
                                const orderId = listOfIds.indexOf(row.id);
                                products[orderId].push(rowProducts);
                            }
                        }
                        for (let i = 0; i < orders.length; i++) {
                            orders[i].products = products[i];
                        }
                        resolve(orders.map(order => new RestockOrder(order.issueDate, order.products, order.supplierId, order.transportNote, order.id, order.skuItems, order.state)));
                    } else {
                        reject('No restockOrders found');
                    }
                })
            });
        };
        this.getRestockOrdersInState = (state) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM restockOrder WHERE state LIKE ?`;
                const params = [state];
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let listOfIds = [];
                        let orders = [];
                        let products = [];
                        for (const row of rows) {
                            let rowProducts = {
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price,
                                qty: row.quantity
                            };
                            if (!listOfIds.includes(row.id)) {
                                listOfIds.push(row.id);
                                orders.push(
                                    {
                                        id: row.id,
                                        issueDate: row.issueDate,
                                        state: row.state,
                                        products: [],
                                        supplierId: row.supplierId,
                                        transportNote: row.transportNote,
                                        skuItems: []
                                    }
                                );
                                products.push([rowProducts]);
                            } else {
                                const orderId = listOfIds.indexOf(row.id);
                                products[orderId].push(rowProducts);
                            }
                        }
                        for (let i = 0; i < orders.length; i++) {
                            orders[i].products = products[i];
                        }
                        resolve(orders.map(order => new RestockOrder(order.issueDate, order.products, order.supplierId, order.transportNote, order.id, order.skuItems, order.state)));
                    } else {
                        reject('No restockOrders found in state ' + state);
                    }
                })
            });
        };
        this.getRestockOrder = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM restockOrder WHERE id = ${id}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (rows.length > 0) {
                        let products = [];
                        for (const row of rows) {
                            products.push({
                                SKUId: row.skuId,
                                description: row.description,
                                price: row.price,
                                qty: row.quantity
                            });
                        }
                        resolve(new RestockOrder(rows[0].issueDate, products, rows[0].supplierId, rows[0].transportNote, rows[0].id, [], rows[0].state));
                    } else {
                        reject('No restock order found');
                    }
                })
            });
        };
        // todo this.getSkuItemsToBeReturned
        this.updateRestockOrder = (ro) => {
            // const sql = `UPDATE restockOrder SET id = ?, issueDate = ?, state = ?, skuId = ?, description = ?, price = ?, supplierId = ?, transportNote = ?, quantity = ? WHERE id = ? and skuId = ?`;
            // const params = [];
            // console.log(ro);
            // for (const sku of ro.products) {
            //     console.log(sku);
            //     params.push([ro.id, ro.issueDate, ro.state, sku.SKUId, sku.description, sku.price, ro.supplierId, ro.transportNote, sku.qty, ro.id, sku.SKUId]);
            // }
            // return new Promise((resolve, reject) => {
            //     let statement = db.prepare(sql);
            //     for (let i = 0; i < params.length; i++) {
            //         console.log(params[i]);
            //         statement.run(params[i], (err) => {reject(err)});
            //     }
            //     statement.finalize();
            //     resolve(1);
            // });

            const sql = `UPDATE restockOrder SET state = ?, transportNote = ? WHERE id = ?`;
            const params = [ro.state, ro.transportNote, ro.id];
            return new Promise((resolve, reject) => {
                db.run(sql, params, (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    } else {
                        resolve(1);
                    }
                });
            });
        }

        this.getRestockOrderSkuItems = (id) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT * FROM restockOrderSkuItem WHERE restockOrderId = ${id}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            resolve(rows.map(row => {
                                return {
                                    SKUId: row.skuId,
                                    rfid: row.RFID,
                                }
                            }));
                        } else {
                            reject('No skuItems found');
                        }
                    }
                });
            });
        }

        this.storeRestockOrderSkuItems = (id, skuItems) => {
            let sql = `INSERT INTO restockOrderSkuItem (restockOrderId, skuId, RFID) VALUES (?,?,?)`;
            const params = [];
            for (const skuItem of skuItems) {
                params.push([id, skuItem.SKUId, skuItem.rfid]);
            }
            return new Promise((resolve, reject) => {
                let statement = db.prepare(sql);
                for (let i = 0; i < params.length; i++) {
                    statement.run(params[i], (err) => { reject(err) });
                }
                statement.finalize();
                resolve(1);
            });
        }
        this.deleteRestockOrderSkuItems = (id) => {
            const sql = `DELETE FROM restockOrderSkuItem WHERE id = ?`;
            const params = [id];
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

        this.storeRestockOrder = (ro) => {
            let sql = `INSERT INTO restockOrder (id, issueDate, state, skuId, description, price, supplierId, transportNote, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [];
            for (const sku of ro.products) {
                params.push([ro.id, ro.issueDate, ro.state, sku.SKUId, sku.description, sku.price, ro.supplierId, ro.transportNote, sku.quantity]);
            }
            return new Promise((resolve, reject) => {
                let statement = db.prepare(sql);
                for (let i = 0; i < params.length; i++) {
                    statement.run(params[i], (err) => { reject(err) });
                }
                statement.finalize();
                resolve(1);
            });
        };
        this.deleteRestockOrder = (id) => {
            const sql = `DELETE FROM restockOrder WHERE id = ?`;
            const params = [id];
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
        this.getNextAvailableId = (table) => {
            return new Promise((resolve, reject) => {
                const sql = `SELECT MAX(id) AS MAX FROM ${table}`;
                db.get(sql, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    if (typeof row !== 'undefined') {
                        resolve(row.MAX + 1);
                    } else {
                        reject('No max id found');
                    }
                })
            });
        }

    }

    let instance;
    return {
        getInstance: function () {
            if (!instance) {
                instance = new DbManager();
            }
            return instance;
        }
    }
})();

module.exports = dbManagerFactory;