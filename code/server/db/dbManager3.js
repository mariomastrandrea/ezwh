const { dbConnection } = require("./dbUtilities");
const Position = require("../models/position");
const Sku = require("../models/sku");
const SkuItem = require("../models/SkuItem");
const RestockOrder = require("../models/restockOrder");

class DbManager3 {
    #db;
    static instance; // singleton instance

    constructor(db) {
        this.#db = db;
    }

    static getInstance() {
        if (!DbManager3.instance)
            DbManager3.instance = new DbManager3(dbConnection);

        return DbManager3.instance;
    }

    /**
     * Position 
     */

    // returns the required position, or 'null' if it is not found
    getPosition(positionId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Position
                              WHERE ID=?`;

            this.#db.get(sqlQuery, [positionId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)  // position not found
                    resolve(null);
                else
                    resolve(new Position(row.ID, row.Aisle, row.Row, row.Col, row.MaxWeight,
                        row.MaxVolume, row.OccupiedWeight, row.OccupiedVolume));
            });
        });
    }

    // returns an array containing all the existing positions
    getAllPositions() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Position`;

            this.#db.all(sqlQuery, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new Position(row.ID, row.Aisle, row.Row, row.Col, row.MaxWeight,
                            row.MaxVolume, row.OccupiedWeight, row.OccupiedVolume)));
            });
        });
    }

    // returns the new created position
    storePosition(newPosition) {
        const positionId = newPosition.getPositionId();
        const aisle = newPosition.getAisle();
        const row = newPosition.getRow();
        const col = newPosition.getCol();
        const maxWeight = newPosition.getMaxWeight();
        const maxVolume = newPosition.getMaxVolume();
        const occupiedWeight = newPosition.getOccupiedWeight();
        const occupiedVolume = newPosition.getOccupiedVolume();

        return new Promise((resolve, reject) => {
            const sqlStatement =
                `INSERT INTO Position (ID, Aisle, Row, Col, MaxWeight, MaxVolume, OccupiedWeight, OccupiedVolume)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            this.#db.run(sqlStatement, [positionId, aisle, row, col, maxWeight, maxVolume,
                occupiedWeight, occupiedVolume], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(new Position(this.lastID, aisle, row, col, maxWeight, maxVolume,
                            occupiedWeight, occupiedVolume));
                });
        });
    }

    // returns 'true' if the position was successfully updated; 'false' otherwise
    updatePosition(oldPositionId, newPosition) {
        const positionId = newPosition.getPositionId();
        const aisle = newPosition.getAisle();
        const row = newPosition.getRow();
        const col = newPosition.getCol();
        const maxWeight = newPosition.getMaxWeight();
        const maxVolume = newPosition.getMaxVolume();
        const occupiedWeight = newPosition.getOccupiedWeight();
        const occupiedVolume = newPosition.getOccupiedVolume();

        return new Promise((resolve, reject) => {
            const sqlStatement = `UPDATE Position
                                  SET    ID=?, Aisle=?, Row=?, Col=?, MaxWeight=?, 
                                         MaxVolume=?, OccupiedWeight=?, OccupiedVolume=?
                                  WHERE  ID=?`;

            this.#db.run(sqlStatement, [positionId, aisle, row, col, maxWeight, maxVolume,
                occupiedWeight, occupiedVolume, oldPositionId], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.changes > 0);
                });
        });
    }

    // returns 'true' if the position has been deleted, 'false' otherwise
    deletePosition(positionId) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM Position
                                  WHERE ID=?`;

            this.#db.run(sqlStatement, [positionId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0)
            })
        });
    }

    // return an object with 'weight' and 'volume' properties, corresponding to the position's 
    // actual weight and volume occupied
    getOccupiedCapacitiesOf(positionId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT SUM(Weight) AS weight, SUM(Volume) AS volume
                              FROM SkuItem SI, Sku S
                              WHERE SI.SkuId = S.ID AND S.Position=?`;

            this.#db.get(sqlQuery, [positionId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve({
                        weight: row.weight ?? 0,
                        volume: row.volume ?? 0
                    });
            });
        })
    }

    /**
     * Sku
     */

    // returns the sku object corresponding to the provided skuId; 
    // or 'null' if there is no corresponding sku
    getSkuById(skuId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT * 
                              FROM Sku 
                              WHERE id=?`;

            this.#db.get(sqlQuery, [skuId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve(new Sku(row.Description, row.Weight, row.Volume, row.Notes,
                        row.Price, row.AvailableQuantity, row.Position, [], row.ID));
            })
        });
    }

    // returns an array containing all the existing Skus
    getAllSkus() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT * 
                              FROM Sku`;

            this.#db.all(sqlQuery, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => new Sku(row.Description, row.Weight, row.Volume,
                        row.Notes, row.Price, row.AvailableQuantity, row.Position, [], row.ID)));
            })
        });
    }

    storeSku(sku) {
        const description = sku.getDescription();
        const weight = sku.getWeight();
        const volume = sku.getVolume();
        const notes = sku.getNotes();
        const position = sku.getPosition();
        const availableQuantity = sku.getAvailableQuantity();
        const price = sku.getPrice();

        return new Promise((resolve, reject) => {
            const sqlQuery =
                `INSERT INTO Sku (Description, Weight, Volume, Notes, Position, AvailableQuantity, Price) 
                 VALUES (?,?,?,?,?,?,?)`;

            const params = [description, weight, volume, notes, position, availableQuantity, price];

            this.#db.run(sqlQuery, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(new Sku(description, weight, volume, notes, price, 
                        availableQuantity, position, [], this.lastID));
            })
        });
    }

    // returns 'true' if the sku was successfully updated; 'false' otherwise
    updateSku(sku) {
        const description = sku.getDescription();
        const weight = sku.getWeight();
        const volume = sku.getVolume();
        const notes = sku.getNotes();
        const position = sku.getPosition();
        const availableQuantity = sku.getAvailableQuantity();
        const price = sku.getPrice();
        const id = sku.getId();

        return new Promise((resolve, reject) => {
            const sqlQuery = `UPDATE Sku
                              SET Description=?, Weight=?, Volume=?, Notes=?, Position=?, AvailableQuantity=?, Price=?
                              WHERE ID=?`;
            
            const params = [description, weight, volume, notes, position, availableQuantity, price, id];

            this.#db.run(sqlQuery, params, function (err) {
                if (err) 
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        });
    }

    // return 'true' if the positionID is successfully updated; 'false' otherwise
    updateSkuPosition(oldPositionID, newPositionID) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `UPDATE Sku
                                  SET Position=?
                                  WHERE Position=?`;

            this.#db.run(sqlStatement, [newPositionID, oldPositionID], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        })
    }

    // return sku corresponding to the specified position
    getSkuOfPosition(positionID) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Sku
                              WHERE Position=?`;

            this.#db.get(sqlQuery, [positionID], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve(new Sku(row.Description, row.Weight, row.Volume, row.Notes,
                        row.Price, row.AvailableQuantity, row.Position, [], row.ID));
            });
        })
    }

    deleteSku(id) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM Sku
                                  WHERE ID=?`;

            this.#db.run(sqlStatement, [id], function (err) {
                if (err) 
                    reject(err);
                else 
                    resolve(this.changes > 0);
            });
        });
    }

    /**
     * SkuItem
     */

    getSkuItemsOf(skuId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM SkuItem
                              WHERE SkuId=?`;
            
            this.#db.all(sqlQuery, [skuId], (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows.map(row => 
                        new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available, [])));
            });
        });
    }

    /**
     * TestDescriptor
     */

    // returns an array containing the test descriptors' IDs of the specified sku
    getTestDescriptorsOf(skuId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT ID
                              FROM TestDescriptor
                              WHERE SkuId=?`;

            this.#db.all(sqlQuery, [skuId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => row.ID));
            });
        });
    }

    /**
     * RestockOrder
     */

    // Function to get all restock orders
    // OUTPUT - array of restock orders
    getAllRestockOrders() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM RestockOrder`;
            this.#db.all(sql, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(order => new RestockOrder(order.IssueDate, [], order.SupplierId,
                    order.TransportNote, order.ID, [], order.State)));
            })
        });
    };

    // Function to get all restock orders in a state. 
    // INPUT - state
    // OUTPUT - array of restock orders
    getRestockOrdersInState(state) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM RestockOrder WHERE State LIKE ?`;
            const params = [state];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(order => new RestockOrder(order.IssueDate, [], order.SupplierId,
                    order.TransportNote, order.ID, [], order.State)));
            })
        });
    };

    // Function to get a restock order by id
    // INPUT - id
    // OUTPUT - restock order
    getRestockOrder(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM RestockOrder WHERE ID = ?`;
            const params = [id];
            this.#db.get(sql, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(new RestockOrder(row.IssueDate, [], row.SupplierId, row.TransportNote, row.ID, [], row.State));
            })
        });
    };

    // *****************
    // TO BE FIXED TO WORK WITH NEW DATABASE
    // *****************

    // Function to get sku info of a restock order
    // INPUT - restock order id
    // OUTPUT - array of map{skuId, description, price, quantity}
    getRestockOrderSku(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM RestockOrderSku WHERE restockOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
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
    getRestockOrderSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM RestockOrderSku WHERE restockOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
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

    // Function to get sku items to be returned of a restock order
    // INPUT - restock order id
    // OUTPUT - array of map{skuId, RFID}
    getReturnItemsByRestockOrderId(id) {
        return new Promise((resolve, reject) => {
            //const sql = `SELECT ros.skuId as skuId, ros.RFID as RFID FROM restockorderSkuItem as ros JOIN TestResult as tr ON ros.RFID = tr.RFID WHERE restockOrderId = ? and Result = 0`;
            const sql = `SELECT * FROM RestockOrderSkuItem WHERE RFID NOT IN (SELECT DISTINCT RFID FROM TestResult WHERE result = true)`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
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
    storeRestockOrder(ro) {
        const sql = `INSERT INTO RestockOrder (issueDate, state, supplierId, transportNote) VALUES (?,?,?,?)`;
        const params = [ro.getIssueDate(), ro.getState(), ro.getSupplierId(), ro.getTransportNote()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(new RestockOrder(ro.getIssueDate(), ro.getProducts(), ro.getSupplierId(), ro.getTransportNote(), this.lastID, ro.getSkuItems(), ro.getState()));
            });
        });
    };

    // Function to store the info about sku of a restock order in the database
    // INPUT - restock order id, {skuId, description, price, quantity}
    // OUTPUT - true if successful else false
    storeRestockOrderSku(id, products) {
        const sql = `INSERT INTO RestockOrderSku(restockOrderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)`;
        let params = products.map(sku => [id, sku.SKUId, sku.description, sku.price, sku.quantity]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            let changes = 0;
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err) reject(err);
                    changes += this.changes;
                });
            }
            statement.finalize();
            resolve(changes > 0);
        });
    }

    // Function to store the info about sku items of a restock order in the database
    // INPUT - restock orderId, {skuId, RFID}
    // OUTPUT - true if successful else false
    storeRestockOrderSkuItems(id, skuItems) {
        let sql = `INSERT INTO RestockOrderSkuItems (restockOrderId, skuId, RFID) VALUES (?,?,?)`;
        const params = skuItems.map(skuItem => [id, skuItem.SKUId, skuItem.RFID]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            let changes = 0;
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err) reject(err);
                    changes += this.changes;
                });
            }
            statement.finalize();
            resolve(changes > 0);
        });
    }

    // Function to update the state of a restock order
    // INPUT - restock order
    // OUTPUT - true if successful else false
    updateRestockOrder(ro) {
        const sql = `UPDATE RestockOrder SET state = ?, transportNote = ? WHERE id = ?`;
        const params = [ro.getState(), ro.getTransportNote(), ro.getId()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(this.changes > 0);
            });
        });
    };
    // Function to delete a restock order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrder(id) {
        const sql = `DELETE FROM RestockOrder WHERE id = ?`;
        const params = [id];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(this.changes > 0);
            })
        });
    };

    // Function to delete the info about sku of a restockOrder order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrderSku(id) {
        const sql = `DELETE FROM RestockOrderSku WHERE restockOrderId = ?`;
        const params = [id];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(this.changes > 0);
            })
        });
    };

    // Function to delete the info about sku items of a restock order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrderSkuItems(id) {
        const sql = `DELETE FROM RestockOrderSkuItem WHERE restockOrderId = ?`;
        const params = [id];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(this.changes > 0);
            })
        });
    }
}

module.exports = DbManager3.getInstance;