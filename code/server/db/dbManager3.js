const { dbConnection } = require("./dbUtilities");
const Position = require("../models/position");
const Sku = require("../models/sku");
const SkuItem = require("../models/SkuItem");
const RestockOrder = require("../models/restockOrder");
const ReturnOrder = require("../models/returnOrder");
const InternalOrder = require("../models/internalOrder");
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

            const params = [positionId, aisle, row, col, maxWeight, maxVolume,
                occupiedWeight, occupiedVolume, oldPositionId];

            this.#db.run(sqlStatement, params, function (err) {
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
    /* End of Position */

    /* Start of Restock Order */

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

    getAllSkuItems() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT * 
                              FROM SkuItem`;

            this.#db.all(sqlQuery, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available)));
            });

        });
    }

    getSkuItemByRfid(rfid) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM SkuItem
                              WHERE RFID=?`;

            this.#db.get(sqlQuery, [rfid], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve(new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available));
            });
        });
    }

    getSkuItemsOf(skuId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM SkuItem
                              WHERE SkuId=?`;

            this.#db.all(sqlQuery, [skuId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available, [])));
            });
        });
    }

    getAvailableSkuItemsOf(skuId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM SkuItem
                              WHERE SkuId=? AND Available=1`;

            this.#db.all(sqlQuery, [skuId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new SkuItem(row.RFID, row.SkuId, row.DateOfStock, row.Available, [])));
            });
        });
    }

    createSkuItem(skuItem) {
        const rfid = skuItem.getRfid();
        const skuId = skuItem.getSkuId();
        const available = skuItem.getAvailable();
        const dateOfStock = skuItem.getDateOfStock();

        return new Promise((resolve, reject) => {
            const sqlStatement = `INSERT INTO SkuItem (RFID, SkuId, Available, DateOfStock)
                                  VALUES (?, ?, ?, ?)`;

            this.#db.run(sqlStatement, [rfid, skuId, available, dateOfStock], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        });
    }

    updateSkuItem(oldRfid, newSkuItem) {
        const newRfid = newSkuItem.getRfid();
        const newSkuId = newSkuItem.getSkuId();
        const newAvailable = newSkuItem.getAvailable();
        const newDateOfStock = newSkuItem.getDateOfStock();

        return new Promise((resolve, reject) => {
            const sqlStatement = `UPDATE SkuItem
                                  SET RFID=?, SkuId=?, Available=?, DateOfStock=?
                                  WHERE RFID=?`;

            const params = [newRfid, newSkuId, newAvailable, newDateOfStock, oldRfid];

            this.#db.run(sqlStatement, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        });
    }

    deleteSkuItem(rfid) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM SkuItem
                                  WHERE RFID=?`;

            this.#db.run(sqlStatement, [rfid], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
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
                else resolve(rows.map(order => new RestockOrder(order.IssueDate, [], order.SupplierId,
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
                else resolve(rows.map(order => new RestockOrder(order.IssueDate, [], order.SupplierId,
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
                else if (!row) {
                    resolve(undefined);
                }
                else
                    resolve(new RestockOrder(row.IssueDate, [], row.SupplierId,
                        row.TransportNote, row.ID, [], row.State));
            })
        });
    };

    // Function to get sku info of a restock order
    // INPUT - restock order id
    // OUTPUT - array of map{skuId, description, price, quantity}
    getRestockOrderSku(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM RestockOrderSKU 
                         WHERE RestockOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(rows.map(row => {
                        return {
                            SKUId: row.SkuId,
                            description: row.Description,
                            price: row.Price,
                            quantity: row.Quantity,
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
            const sql = `SELECT * 
                         FROM RestockOrderSkuItem 
                        WHERE RestockOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(rows.map(row => {
                        return {
                            SKUId: row.SkuId,
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
            const sql = `SELECT * 
                         FROM RestockOrderSkuItem 
                         WHERE RFID NOT IN (SELECT DISTINCT RFID 
                                            FROM TestResult 
                                            WHERE Result = 1) AND RestockOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(rows.map(row => {
                        return {
                            SKUId: row.SkuId,
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
        const sql = `INSERT INTO RestockOrder (IssueDate, State, SupplierId, TransportNote) 
                     VALUES (?,?,?,?)`;
        const params = [ro.getIssueDate(), ro.getState(), ro.getSupplierId(), ro.getTransportNote()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(new RestockOrder(ro.getIssueDate(), ro.getProducts(),
                    ro.getSupplierId(), ro.getTransportNote(), this.lastID,
                    ro.getSkuItems(), ro.getState()));
            });
        });
    };

    // Function to store the info about sku of a restock order in the database
    // INPUT - restock order id, {skuId, description, price, quantity}
    // OUTPUT - true if successful else false
    storeRestockOrderSku(id, products) {
        const sql = `INSERT INTO RestockOrderSku(RestockOrderId, SkuId, Description, Price, Quantity) VALUES (?,?,?,?,?)`;
        let params = products.map(sku => [id, sku.SKUId, sku.description, sku.price, sku.quantity]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) reject(err);
                });
            }
            statement.finalize();
            resolve(true);
        });
    }

    // Function to store the info about sku items of a restock order in the database
    // INPUT - restock orderId, {skuId, RFID}
    // OUTPUT - true if successful else false
    storeRestockOrderSkuItems(id, skuItems) {
        let sql = `INSERT INTO RestockOrderSkuItem (RestockOrderId, SkuId, RFID) VALUES (?,?,?)`;
        const params = skuItems.map(skuItem => [id, skuItem.SKUId, skuItem.RFID]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) reject(err);
                });

            }
            statement.finalize();
            resolve(true);
        });
    }

    // Function to update the state of a restock order
    // INPUT - restock order
    // OUTPUT - true if successful else false
    updateRestockOrder(ro) {
        const sql = `UPDATE RestockOrder 
                     SET state = ?, transportNote = ? 
                     WHERE id = ?`;

        const params = [ro.getState(), ro.getTransportNote(), ro.getId()];

        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    };
    // Function to delete a restock order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrder(id) {
        const sql = `DELETE FROM RestockOrder 
                     WHERE id = ?`;

        const params = [id];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            })
        });
    };

    // Function to delete the info about sku of a restockOrder order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrderSku(id) {
        const sql = `DELETE FROM RestockOrderSku WHERE RestockOrderId = ?`;
        const params = [id];

        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(this.changes > 0);
            })
        });
    };

    // Function to delete the info about sku items of a restock order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrderSkuItems(id) {
        const sql = `DELETE FROM RestockOrderSkuItem WHERE RestockOrderId = ?`;
        const params = [id];

        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(this.changes > 0);
            })
        });
    }

    /* Start of Return Order */

    // Function to get all return orders. 
    // INPUT - none
    // OUTPUT - array of return orders
    getAllReturnOrders() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM ReturnOrder`;
            this.#db.all(sql, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(order => new ReturnOrder(order.ReturnDate, [], order.RestockOrderId, order.ID)));
            })
        });
    };

    // Function to get a return order by id
    // INPUT - id
    // OUTPUT - return order
    getReturnOrder(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ReturnOrder where ID = ?`;
            const params = [id];
            this.#db.get(sql, params, function (err, row) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                if (row === undefined) {
                    resolve(undefined);
                } else
                    resolve(new ReturnOrder(row.ReturnDate, [], row.RestockOrderId, row.ID));
            })
        });
    };

    // Function to get sku items of a return order
    // INPUT - restock order id
    // OUTPUT - array of map{skuId, description, price, RFID}
    getReturnOrderSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ReturnOrderSkuItem WHERE ReturnOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(row => {
                    return {
                        SKUId: row.SkuId,
                        description: row.Description,
                        price: row.Price,
                        RFID: row.RFID,
                    }
                }));
            });
        });
    }

    // Function to store a return order in the database
    // INPUT - return order
    // OUTPUT - return order
    storeReturnOrder(ro) {
        let sql = `INSERT INTO ReturnOrder (ReturnDate, RestockOrderId) VALUES (?,?)`;
        const params = [ro.getReturnDate(), ro.getRestockOrderId()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
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
    storeReturnOrderSkuItems(id, skuItems) {
        let sql = `INSERT INTO ReturnOrderSkuItem (ReturnOrderId, SkuId, Description, Price, RFID) VALUES (?,?,?,?,?)`;
        const params = [];
        for (const skuItem of skuItems) {
            params.push([id, skuItem.SkuID, skuItem.description, skuItem.price, skuItem.RFID]);
        }
        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) reject(err);
                });
            }
            statement.finalize();
            resolve(true);
        });
    }

    // Function to delete a return order
    // INPUT - return order id
    // OUTPUT - true if successful else false
    deleteReturnOrder(id) {
        const sql = `DELETE FROM ReturnOrder WHERE id = ?`;
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

    // Function to delete the info about sku items of a return order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteReturnOrderSkuItems(id) {
        const sql = `DELETE FROM ReturnOrderSkuItem WHERE ReturnOrderId = ?`;
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
    /* End of Return Order */

    /* Start of Internal Order */

    // Function to get all internal orders
    // OUTPUT - array of internal orders
    getAllInternalOrders() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM InternalOrder`;
            this.#db.all(sql, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(order => new InternalOrder(order.IssueDate, [], order.CustomerId, order.State, order.ID)));
            })
        });
    };

    // Function to get all internal orders in a specified state
    // INPUT - state
    // OUTPUT - array of internal orders
    getInternalOrdersInState(state) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM InternalOrder WHERE State LIKE ?`;
            const params = [state];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(order => new InternalOrder(order.IssueDate, [], order.CustomerId, order.State, order.ID)));
            })
        });
    }

    // Function to get an internal order by id
    // INPUT - id
    // OUTPUT - internal order
    getInternalOrder(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM InternalOrder WHERE ID = ?`;
            const params = [id];
            this.#db.get(sql, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                if (row === undefined) {
                    resolve(undefined);
                } else
                    resolve(new InternalOrder(row.IssueDate, [], row.CustomerId, row.State, row.ID));
            })
        });
    };

    // Function to get sku info of an internal order
    // INPUT - internal order id
    // OUTPUT - array of map{skuId, description, price, quantity}
    getInternalOrderSku(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM InternalOrderSku WHERE InternalOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(row => {
                    return {
                        SKUId: row.SkuId,
                        description: row.Description,
                        price: row.Price,
                        quantity: row.Quantity,
                    }
                }));

            });
        });
    }

    // Function to get sku items of an internal order
    // INPUT - internal order id
    // OUTPUT - array of map{skuId, RFID}
    getInternalOrderSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM InternalOrderSkuItem WHERE InternalOrderId = ?`;
            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows.map(row => {
                    return {
                        SKUId: row.SkuId,
                        RFID: row.RFID,
                    }
                }));
            });
        });
    }

    // Function to store an internal order in the database
    // INPUT - internal order
    // OUTPUT - internal order
    storeInternalOrder(io) {
        const sql = `INSERT INTO InternalOrder (IssueDate, CustomerId, State) VALUES (?,?,?)`;
        const params = [io.getIssueDate(), io.getCustomerId(), io.getState()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(new InternalOrder(io.getIssueDate(), io.getProducts(), io.getCustomerId(), io.getState(), this.lastID));
            });
        });
    };

    // Function to store the info about sku of an internal order in the database
    // INPUT - internal order id, {skuId, description, price, quantity}
    // OUTPUT - true if successful else false
    storeInternalOrderSku(id, products) {
        const sql = `INSERT INTO internalOrderSku(internalOrderId, skuId, description, price, quantity) VALUES (?,?,?,?,?)`;
        let params = [];
        for (const sku of products) {
            params.push([id, sku.SKUId, sku.description, sku.price, sku.quantity]);
        }
        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) reject(err);
                });
            }
            statement.finalize();
            resolve(true);
        });
    }

    // Function to store the info about sku items of an internal order in the database
    // INPUT - internal orderId, {skuId, RFID}
    // OUTPUT - true if successful else false
    storeInternalOrderSkuItems(id, skuItems) {
        let sql = `INSERT INTO InternalOrderSkuItem (InternalOrderId, SkuId, RFID) VALUES (?,?,?)`;
        const params = [];
        for (const skuItem of skuItems) {
            params.push([id, skuItem.SkuID, skuItem.RFID]);
        }
        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) reject(err);
                });
            }
            statement.finalize();
            resolve(true);
        });
    }

    // Function to update the state of an internal order
    // INPUT - internal order
    // OUTPUT - true if successful else false
    updateInternalOrder(io) {
        const sql = `UPDATE InternalOrder SET State = ? WHERE ID = ?`;
        const params = [io.getState(), io.getId()];
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
    // Function to delete an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrder(id) {
        const sql = `DELETE FROM InternalOrder WHERE ID = ?`;
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

    // Function to delete the info about sku of an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrderSku(id) {
        const sql = `DELETE FROM InternalOrderSku WHERE InternalOrderId = ?`;
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

    // Function to delete the info about sku items of an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrderSkuItems(id) {
        const sql = `DELETE FROM InternalOrderSkuItem WHERE InternalOrderId = ?`;
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

    /* End of Internal Order */

}

module.exports = DbManager3.getInstance;