const { dbConnection } = require("./dbUtilities");

const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const Item = require('../models/item');

const RestockOrder = require('../models/restockOrder');
const InternalOrder = require('../models/internalOrder');
const ReturnOrder = require('../models/returnOrder');


const dbManagerFactory = (function () {

    function DbManager() {
        this.db = dbConnection;
        
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
        };

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
        };

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
        };

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
        };

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
        };

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
        };
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