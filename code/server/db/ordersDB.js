const RestockOrder = require('../models/restockOrder');
const InternalOrder = require('../models/internalOrder');
const ReturnOrder = require('../models/returnOrder');
const { db } = require('./dbUtilities');

/* --- INTERNAL ORDERS --- */

// Function to get all internal orders
// OUTPUT - array of internal orders
async function getAllInternalOrders() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM internalOrder`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(order => new InternalOrder(order.issueDate, [], order.customerId, order.state, order.id)));
        })
    });
};

// Function to get all internal orders in a specified state
// INPUT - state
// OUTPUT - array of internal orders
async function getInternalOrdersInState(state){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM internalOrder WHERE state LIKE ?`;
        const params = [state];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(order => new InternalOrder(order.issueDate, [], order.customerId, order.state, order.id)));
        })
    });
}

// Function to get an internal order by id
// INPUT - id
// OUTPUT - internal order
async function getInternalOrder(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM internalOrder WHERE id = ?`;
        const params = [id];
        db.run(sql, params, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new InternalOrder(row.issueDate, [], row.customerId, row.state, row.id));
        })
    });
};

// Function to get sku info of an internal order
// INPUT - internal order id
// OUTPUT - array of map{skuId, description, price, quantity}
async function getInternalOrderSku(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM internalOrderSku WHERE internalOrderId = ?`;
        const params = [id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(row => {
                return {
                    SKUId: row.skuId,
                    description: row.description,
                    price: row.price,
                    quantity: row.quantity,
                }
            }));

        });
    });
}

// Function to get sku items of an internal order
// INPUT - internal order id
// OUTPUT - array of map{skuId, RFID}
async function getInternalOrderSkuItems(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM internalOrderSkuItem WHERE internalOrderId = ?`;
        const params = [id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(row => {
                return {
                    SKUId: row.skuId,
                    RFID: row.RFID,
                }
            }));
        });
    });
}

// Function to store an internal order in the database
// INPUT - internal order
// OUTPUT - internal order
async function storeInternalOrder(io) {
    const sql = `INSERT INTO internalOrder (issueDate, customerId, state) VALUES (?,?,?)`;
    const params = [io.getIssueDate(), io.getCustomerId(), io.getState()];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new InternalOrder(io.getIssueDate(), io.getProducts(), io.getCustomerId(), io.getState(), db.lastID));
        });
    });
};

// Function to store the info about sku of an internal order in the database
// INPUT - internal order id, {skuId, description, price, quantity}
// OUTPUT - true if successful else false
async function storeInternalOrderSku(id, products) {
    const sql = `INSERT INTO internalOrderSku(internalOrderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)`;
    let params = [];
    for (const sku of products) {
        params.push([id, sku.SKUId, sku.description, sku.price, sku.quantity]);
    }
    return new Promise((resolve, reject) => {
        let statement = db.prepare(sql);
        for (let i = 0; i < params.length; i++) {
            statement.run(params[i], (err) => { reject(err) });
        }
        statement.finalize();
        resolve(this.changes > 0 ? true : false);
    });
}

// Function to store the info about sku items of an internal order in the database
// INPUT - internal orderId, {skuId, RFID}
// OUTPUT - true if successful else false
async function storeInternalOrderSkuItems(id, skuItems) {
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
        resolve(statement.changes > 0 ? true : false);
    });
}

// Function to update the state of an internal order
// INPUT - internal order
// OUTPUT - true if successful else false
async function updateInternalOrder(io) {
    const sql = `UPDATE internalOrder SET state = ? WHERE id = ?`;
    const params = [io.getState(), id = io.getId()];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        });
    });
};
// Function to delete an internal order
// INPUT - internal order id
// OUTPUT - true if successful else false
async function deleteInternalOrder(id) {
    const sql = `DELETE FROM internalOrder WHERE id = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
};

// Function to delete the info about sku of an internal order
// INPUT - internal order id
// OUTPUT - true if successful else false
async function deleteInternalOrderSku(id) {
    const sql = `DELETE FROM internalOrderSku WHERE internalOrderId = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
};

// Function to delete the info about sku items of an internal order
// INPUT - internal order id
// OUTPUT - true if successful else false
async function deleteInternalOrderSkuItems(id) {
    const sql = `DELETE FROM internalOrderSkuItem WHERE internalOrderId = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
}
/* - END INTERNAL ORDER - */

/* --- RESTOCK ORDER --- */

// Function to get all restock orders
// OUTPUT - array of restock orders
async function getAllRestockOrders() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM restockOrder`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(order => new RestockOrder(order.issueDate, [], order.supplierId, order.transportNote, order.id, [], order.state)));
        })
    });
};

// Function to get all restock orders in a state. 
// INPUT - state
// OUTPUT - array of restock orders
async function getRestockOrdersInState(state) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM restockOrder WHERE state LIKE ?`;
        const params = [state];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(order => new RestockOrder(order.issueDate, [], order.supplierId, order.transportNote, order.id, [], order.state)));
        })
    });
};

// Function to get a restock order by id
// INPUT - id
// OUTPUT - restock order
async function getRestockOrder(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM restockOrder WHERE id = ?`;
        const params = [id];
        db.run(sql, params, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new RestockOrder(row.issueDate, [], row.supplierId, row.transportNote, row.id, [], row.state));
        })
    });
};


// Function to get sku info of a restock order
// INPUT - restock order id
// OUTPUT - array of map{skuId, description, price, quantity}
async function getRestockOrderSku(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM restockOrderSku WHERE restockOrderId = ?`;
        const params = [id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(row => {
                return {
                    SKUId: row.skuId,
                    description: row.description,
                    price: row.price,
                    quantity: row.quantity,
                }
            }));

        });
    });
}

// Function to get sku items of a restock order
// INPUT - restock order id
// OUTPUT - array of map{skuId, RFID}
async function getRestockOrderSkuItems(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM restockorderSku WHERE restockOrderId = ?`;
        const params = [id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(row => {
                return {
                    SKUId: row.skuId,
                    RFID: row.RFID,
                }
            }));
        });
    });
}

// Function to store a restock order in the database
// INPUT - restock order
// OUTPUT - restock order
async function storeRestockOrder(ro) {
    const sql = `INSERT INTO restockOrder (issueDate, state, supplierId, transportNote) VALUES (?,?,?,?)`;
    const params = [ro.getIssueDate(), ro.getState(), ro.getSupplierId(), ro.getTransportNote()];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new RestockOrder(ro.getIssueDate(), ro.getProducts(), ro.getSupplierId(), ro.getTransportNote(), db.lastID, ro.getSkuItems(), ro.getState()));
        });
    });
};

// Function to store the info about sku of a restock order in the database
// INPUT - restock order id, {skuId, description, price, quantity}
// OUTPUT - true if successful else false
async function storeRestockOrderSku(id, products) {
    const sql = `INSERT INTO restockOrderSku(restockOrderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)`;
    let params = [];
    for (const sku of products) {
        params.push([id, sku.SKUId, sku.description, sku.price, sku.quantity]);
    }
    return new Promise((resolve, reject) => {
        let statement = db.prepare(sql);
        for (let i = 0; i < params.length; i++) {
            statement.run(params[i], (err) => { reject(err) });
        }
        statement.finalize();
        resolve(this.changes > 0 ? true : false);
    });
}

// Function to store the info about sku items of a restock order in the database
// INPUT - restock orderId, {skuId, RFID}
// OUTPUT - true if successful else false
async function storeRestockOrderSkuItems(id, skuItems) {
    let sql = `INSERT INTO restockOrderSkuItems (restockOrderId, skuId, RFID) VALUES (?,?,?)`;
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
        resolve(statement.changes > 0 ? true : false);
    });
}

// Function to update the state of a restock order
// INPUT - restock order
// OUTPUT - true if successful else false
async function updateRestockOrder(ro) {
    const sql = `UPDATE restockOrder SET state = ? WHERE id = ?`;
    const params = [io.getState(), id = io.getId()];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        });
    });
};
// Function to delete a restock order
// INPUT - restock order id
// OUTPUT - true if successful else false
async function deleteRestockOrder(id) {
    const sql = `DELETE FROM restockOrder WHERE id = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
};

// Function to delete the info about sku of a restockOrder order
// INPUT - restock order id
// OUTPUT - true if successful else false
async function deleteRestockOrderSku(id) {
    const sql = `DELETE FROM restockOrderSku WHERE restockOrderId = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
};

// Function to delete the info about sku items of a restock order
// INPUT - restock order id
// OUTPUT - true if successful else false
async function deleteRestockOrderSkuItems(id) {
    const sql = `DELETE FROM restockOrderSkuItem WHERE restockOrderId = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
}

/* - END RESTOCK ORDER - */

/* --- RETURN ORDER */

// Function to get all return orders. 
// INPUT - none
// OUTPUT - array of return orders
async function getAllReturnOrders() {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM returnOrder`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(order => new ReturnOrder(order.returnDate, [], order.restockOrderId, order.id)));
        })
    });
};

// Function to get a return order by id
// INPUT - id
// OUTPUT - return order
async function getReturnOrder(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM internalOrder WHERE id = ?`;
        const params = [id];
        db.run(sql, params, (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new ReturnOrder(row.returnDate, [], row.restockOrderId, row.id));
        })
    });
};

// Function to get sku items of a return order
// INPUT - restock order id
// OUTPUT - array of map{skuId, description, price, RFID}
async function getReturnOrderSkuItems(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM returnOrderSkuItem WHERE returnOrderId = ?`;
        const params = [id];
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(rows.map(row => {
                return {
                    SKUId: row.skuId,
                    description: row.description,
                    price: row.price,
                    RFID: row.RFID,
                }
            }));
        });
    });
}

// Function to store a return order in the database
// INPUT - return order
// OUTPUT - return order
async function storeReturnOrder(ro) {
    let sql = `INSERT INTO returnOrder (returnDate, restockOrderId) VALUES (?,?)`;
    const params = [ro.getReturnDate(), ro.getRestockOrderId()];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(new ReturnOrder(ro.getReturnDate(), ro.getProducts(), ro.getRestockOrderId(), this.lastID));
        });
    });
};

// Function to store the info about sku items of a return order in the database
// INPUT - return orderId, {skuId, description, price, RFID}
// OUTPUT - true if successful else false
async function storeReturnOrderSkuItems(id, skuItems) {
    let sql = `INSERT INTO returnOrderSkuItems (returnOrderId, skuId, description, price, RFID) VALUES (?,?,?,?,?)`;
    const params = [];
    for (const skuItem of skuItems) {
        params.push([id, skuItem.SkuID, skuItem.description, skuItem.price, skuItem.RFID]);
    }
    return new Promise((resolve, reject) => {
        let statement = db.prepare(sql);
        for (let i = 0; i < params.length; i++) {
            statement.run(params[i], (err) => { reject(err) });
        }
        statement.finalize();
        resolve(statement.changes > 0 ? true : false);
    });
}

// Function to delete a return order
// INPUT - return order id
// OUTPUT - true if successful else false
async function deleteReturnOrder(id) {
    const sql = `DELETE FROM returnOrder WHERE id = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
};

// Function to delete the info about sku items of a return order
// INPUT - restock order id
// OUTPUT - true if successful else false
async function deleteReturnOrderSkuItems(id) {
    const sql = `DELETE FROM returnOrderSkuItem WHERE returnOrderId = ?`;
    const params = [id];
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            resolve(this.changes > 0 ? true : false);
        })
    });
}

/* - END RETURN ORDER - */
