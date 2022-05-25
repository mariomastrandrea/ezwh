// import db connection
const { dbConnection } = require("./dbUtilities");

// import models
const Position = require("../models/position");
const Sku = require("../models/sku");
const SkuItem = require("../models/skuItem");
const Item = require("../models/item");
const TestDescriptor = require('../models/testDescriptor');
const TestResult = require('../models/testResult');
const RestockOrder = require("../models/restockOrder");
const ReturnOrder = require("../models/returnOrder");
const InternalOrder = require("../models/internalOrder");
const User = require("../models/user");


class DbManager {
    #db;
    static instance; // singleton instance

    constructor(db) {
        this.#db = db;
    }

    static getInstance() {
        if (!DbManager.instance)
            DbManager.instance = new DbManager(dbConnection);

        return DbManager.instance;
    }

    closeDb() {
        this.#db.close();
    }

    /**
     * Position 
     */

    // returns the required position, or 'null' if it is not found
    getPosition(positionId) {
        const parsedId = positionId.toString()
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Position
                              WHERE ID=?`;

            this.#db.get(sqlQuery, [parsedId], (err, row) => {
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
                        resolve(new Position(positionId, aisle, row, col, maxWeight, maxVolume,
                            occupiedWeight, occupiedVolume));
                });
        });
    }

    // returns 'true' if the position was successfully updated; 'false' otherwise
    updatePosition(oldPositionId, newPosition) {
        const parsedId = oldPositionId.toString()
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
                occupiedWeight, occupiedVolume, parsedId];

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
        const parsedId = positionId.toString()
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM Position
                                  WHERE ID=?`;

            this.#db.run(sqlStatement, [parsedId], function (err) {
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
        const parsedId = positionId.toString()
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT SUM(Weight) AS weight, SUM(Volume) AS volume
                              FROM SkuItem SI, Sku S
                              WHERE SI.SkuId = S.ID AND S.Position=?`;

            this.#db.get(sqlQuery, [parsedId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
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

    // returns an array containing all the existing skuItems
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

    // returns the skuItem object corresponding to the provided RFID; 
    // or 'null' if there is no corresponding skuItem
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

    // return an array containing all the SkuItems of the specified sku
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

    // return an array containing all the AVAILABLE SkuItems of the specified sku
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

    // create a new persistent SkuItem in the db; returns the new SkuItem created 
    storeSkuItem(skuItem) {
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
                    resolve(new SkuItem(rfid, skuId, dateOfStock, available));
            });
        });
    }

    // update the existing SkuItem with the information contained in the provided skuItem;
    // returns 'true' if the SkuItem was successfully updated, 'false' otherwise
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

    // delete the SkuItem corresponding to the provided RFID; returns 'true' if the 
    // SkuItem was successfully deleted, 'false' otherwise
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
     * Item
     */

    // returns an array containing all the existing Items
    getAllItems() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Item`;

            this.#db.all(sqlQuery, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new Item(row.ID, row.Description, row.Price, row.SkuId, row.SupplierId)));
            });
        });
    }

    // returns the Item corresponding to the given skuId; 'null' if the item is not found
    getItemById(itemId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Item
                              WHERE ID=?`;

            this.#db.get(sqlQuery, [itemId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve(new Item(row.ID, row.Description, row.Price, row.SkuId, row.SupplierId));
            });
        });
    }

    getItemBySkuIdAndSupplier(skuId, supplierId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM Item
                              WHERE SkuId=? AND SupplierId=?`;

            this.#db.get(sqlQuery, [skuId, supplierId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else {
                    const inserted = new Item(row.ID, row.Description, row.Price, row.SkuId, row.SupplierId);
                    console.log(inserted);
                    console.log(inserted.getId());
                    resolve(inserted);
                }
            });
        });
    }

    // create a new persistent SkuItem in the db; returns the new SkuItem created 
    storeItem(newItem) {
        const newId = newItem.getId();
        const newDescription = newItem.getDescription();
        const newPrice = newItem.getPrice();
        const newSkuId = newItem.getSkuId();
        const newSupplierId = newItem.getSupplierId();

        return new Promise((resolve, reject) => {
            const sqlStatement = `INSERT INTO Item (ID, Description, Price, SkuId, SupplierId)
                                  VALUES (?, ?, ?, ?, ?)`;

            const params = [newId, newDescription, newPrice, newSkuId, newSupplierId];

            this.#db.run(sqlStatement, params, function (err) {
                if (err)
                    reject(err);
                else 
                    resolve(new Item(this.lastID, newDescription, newPrice, newSkuId, newSupplierId));
            });
        });
    }

    // it updates the provided Item's information (except the ID)
    // returns 'true' if the sku was successfully updated; 'false' otherwise
    updateItem(newItem) {
        const itemId = newItem.getId();
        const newDescription = newItem.getDescription();
        const newPrice = newItem.getPrice();
        const newSkuId = newItem.getSkuId();
        const newSupplierId = newItem.getSupplierId();

        return new Promise((resolve, reject) => {
            const sqlStatement = `UPDATE Item 
                                  SET Description=?, Price=?, SkuId=?, SupplierId=?
                                  WHERE ID=?`;

            const params = [newDescription, newPrice, newSkuId, newSupplierId, itemId];

            this.#db.run(sqlStatement, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        });
    }

    // returns 'true' if the Item was successfully deleted; 'false' otherwise
    deleteItem(itemId) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM Item
                                  WHERE ID=?`;

            this.#db.run(sqlStatement, [itemId], function (err) {
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

    getAllTestDescriptors() {
        let testDescriptors = [];
        let sql = `SELECT * 
                   FROM TestDescriptor`;

        return new Promise((resolve, reject) => {
            this.#db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (let row of rows) {
                    testDescriptors.push(
                        new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId));
                }

                resolve(testDescriptors);
            });
        })
    };

    getTestDescriptor(id) {
        let testDescriptor;
        let sql = `SELECT * 
                   FROM TestDescriptor 
                   WHERE ID=?`;

        return new Promise((resolve, reject) => {
            this.#db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(null);
                    return;
                }

                testDescriptor = new TestDescriptor(row.ID, row.Name, row.ProcedureDescription, row.SkuId);
                resolve(testDescriptor);
            });
        })
    };

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

    storeTestDescriptor(td) {
        let sql = `INSERT INTO TestDescriptor (Name, ProcedureDescription, SkuId) 
                   VALUES (?,?,?)`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId()], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(new TestDescriptor(this.lastID, td.getName(), td.getProcedureDescription(), td.getSkuId()));
            });
        })
    };

    updateTestDescriptor(td) {
        let sql = `UPDATE TestDescriptor 
                   SET Name=?, ProcedureDescription=?, SkuId=? 
                   WHERE ID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [td.getName(), td.getProcedureDescription(), td.getSkuId(), td.getId()], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this.changes > 0);
            });
        })
    };

    deleteTestDescriptor(id) {
        let sql = `DELETE FROM TestDescriptor 
                   WHERE ID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this.changes > 0);
            });
        })
    };

    /**
     * TestResult
     */

    getAllTestResultsBySkuItem(rfid) {
        let testResults = [];
        let sql = `SELECT * 
                   FROM TestResult 
                   WHERE RFID=?`;

        return new Promise((resolve, reject) => {
            this.#db.all(sql, [rfid], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (let row of rows) {
                    testResults.push(new TestResult(row.ID, row.RFID, row.TestDescriptorId, row.Date, row.Result));
                }

                resolve(testResults);
            });
        })
    };

    getTestResult(id, rfid) {
        let sql = `SELECT * 
                   FROM TestResult 
                   WHERE ID=? AND RFID=?`;

        return new Promise((resolve, reject) => {
            this.#db.get(sql, [id, rfid], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(null);
                    return;
                }

                const testResult = new TestResult(row.ID, row.RFID, row.TestDescriptorId, row.Date, row.Result);
                resolve(testResult);
            });
        })
    }

    getNegativeTestResultsOf(rfid) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM TestResult
                              WHERE RFID=? AND Result=0`;

            this.#db.all(sqlQuery, [rfid], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row =>
                        new TestResult(row.ID, row.RFID, row.TestDescriptorId, row.Date, row.Result)));
            });
        });
    }

    storeTestResult(tr) {
        let sql = `INSERT INTO TestResult(RFID, TestDescriptorId, Date, Result) 
                   VALUES (?,?,?,?)`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [tr.getRfid(), tr.getTestDescriptorId(), tr.getDate(), tr.getResult()], function (err) {
                if (err)
                    reject(err);

                else resolve(new TestResult(this.lastID, tr.getRfid(), tr.getTestDescriptorId(), tr.getDate(), tr.getResult()));
            });
        })
    }

    updateTestResult(tr) {
        let sql = `UPDATE TestResult 
                   SET TestDescriptorId=?, Date=?, Result=? 
                   WHERE ID=? AND RFID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [tr.getTestDescriptorId(), tr.getDate(), tr.getResult(), tr.getId(), tr.getRfid()], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this.changes > 0);
            });
        })
    }

    deleteTestResult(id, rfid) {
        let sql = `DELETE FROM TestResult 
                   WHERE ID=? AND RFID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id, rfid], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes > 0);
            });
        })
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
                    resolve(null);
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
                         FROM RestockOrderSku 
                         WHERE RestockOrderId=?`;

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
                            qty: row.Quantity
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
                         WHERE RestockOrderId=?`;
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
                            rfid: row.RFID,
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
            const sql = `SELECT * 
                         FROM RestockOrderSkuItem 
                         WHERE RFID IN (SELECT RFID 
                                        FROM TestResult 
                                        WHERE Result=0) AND RestockOrderId=?`;
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
                            rfid: row.RFID,
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
        const params = [ro.getIssueDate(), ro.getState(), ro.getSupplierId(), ro.getTransportNoteString()];
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
        const sql = `INSERT INTO RestockOrderSku(RestockOrderId, SkuId, Description, Price, Quantity) 
                     VALUES (?,?,?,?,?)`;
        let params = products.map(sku => [id, sku.SKUId, sku.description, sku.price, sku.qty]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes == 0) {
                        reject(err);
                        return;
                    }
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
        let sql = `INSERT INTO RestockOrderSkuItem (RestockOrderId, SkuId, RFID) 
                   VALUES (?,?,?)`;

        const params = skuItems.map(skuItem => [id, skuItem.SKUId, skuItem.rfid]);

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes === 0) {
                        reject(err);
                        return;
                    }
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
                     SET state=?, transportNote=? 
                     WHERE id=?`;

        const params = [ro.getState(), ro.getTransportNoteString(), ro.getId()];

        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(this.changes > 0);
            });
        });
    };

    // Function to delete a restock order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrder(id) {
        const sql = `DELETE FROM RestockOrder 
                     WHERE id=?`;

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

    // Function to delete the info about sku of a restockOrder order
    // INPUT - restock order id
    // OUTPUT - true if successful else false
    deleteRestockOrderSku(id) {
        const sql = `DELETE FROM RestockOrderSku 
                     WHERE RestockOrderId = ?`;
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
        const sql = `DELETE FROM RestockOrderSkuItem 
                     WHERE RestockOrderId = ?`;
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

    /* 
     * ReturnOrder 
     */

    // Function to get all return orders. 
    // INPUT - none
    // OUTPUT - array of return orders
    getAllReturnOrders() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * 
                       FROM ReturnOrder`;

            this.#db.all(sql, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(rows.map(order =>
                    new ReturnOrder(order.ReturnDate, [], order.RestockOrderId, order.ID)));
            })
        });
    };

    // Function to get a return order by id
    // INPUT - id
    // OUTPUT - return order
    getReturnOrder(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM ReturnOrder 
                         where ID=?`;

            const params = [id];
            this.#db.get(sql, params, function (err, row) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else if (!row)
                    resolve(null);
                else
                    resolve(new ReturnOrder(row.ReturnDate, [], row.RestockOrderId, row.ID));
            })
        });
    };

    // Function to get sku items of a return order
    // INPUT - restock order id
    // OUTPUT - array of map{skuId, description, price, RFID}
    getReturnOrderSkuItems(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM ReturnOrderSkuItem 
                         WHERE ReturnOrderId=?`;

            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(rows.map(row => {
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
        let sql = `INSERT INTO ReturnOrder (ReturnDate, RestockOrderId) 
                   VALUES (?,?)`;

        const params = [ro.getReturnDate(), ro.getRestockOrderId()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(new ReturnOrder(ro.getReturnDate(), ro.getProducts(), ro.getRestockOrderId(), this.lastID));
            });
        });
    };

    // Function to store the info about sku items of a return order in the database
    // INPUT - return orderId, {skuId, description, price, RFID}
    // OUTPUT - true if successful else false
    storeReturnOrderSkuItems(id, skuItems) {
        let sql = `INSERT INTO ReturnOrderSkuItem (ReturnOrderId, SkuId, Description, Price, RFID) 
                   VALUES (?, ?, ?, ?, ?)`;

        const params = [];
        for (const skuItem of skuItems) {
            params.push([id, skuItem.SKUId, skuItem.description, skuItem.price, skuItem.RFID]);
        }

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes === 0) {
                        reject(err);
                        return;
                    }
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

    /*
     * InternalOrder
     */

    // Function to get all internal orders
    // OUTPUT - array of internal orders
    getAllInternalOrders() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * 
                       FROM InternalOrder`;

            this.#db.all(sql, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(rows.map(order =>
                        new InternalOrder(order.IssueDate, [], order.CustomerId, order.State, order.ID)));
            })
        });
    };

    // Function to get all internal orders in a specified state
    // INPUT - state
    // OUTPUT - array of internal orders
    getInternalOrdersInState(state) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM InternalOrder 
                         WHERE State=?`;

            const params = [state];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(rows.map(order =>
                        new InternalOrder(order.IssueDate, [], order.CustomerId, order.State, order.ID)));
            })
        });
    }

    // Function to get an internal order by id
    // INPUT - id
    // OUTPUT - internal order
    getInternalOrder(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM InternalOrder 
                         WHERE ID=?`;

            const params = [id];
            this.#db.get(sql, params, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else if (!row) {
                    resolve(null);
                }
                else
                    resolve(new InternalOrder(row.IssueDate, [], row.CustomerId, row.State, row.ID));
            })
        });
    };

    // Function to get sku info of an internal order
    // INPUT - internal order id
    // OUTPUT - array of map{skuId, description, price, quantity}
    getInternalOrderSku(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * 
                         FROM InternalOrderSku 
                         WHERE InternalOrderId=?`;

            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(rows.map(row => {
                    return {
                        SKUId: row.SkuId,
                        description: row.Description,
                        price: row.Price,
                        qty: row.Quantity,
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
            const sql = `SELECT * 
                         FROM InternalOrderSkuItem 
                         WHERE InternalOrderId=?`;

            const params = [id];
            this.#db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(rows.map(row => {
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
        const sql = `INSERT INTO InternalOrder (IssueDate, CustomerId, State) 
                     VALUES (?,?,?)`;

        const params = [io.getIssueDate(), io.getCustomerId(), io.getState()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else
                    resolve(new InternalOrder(io.getIssueDate(), io.getProducts(), io.getCustomerId(), io.getState(), this.lastID));
            });
        });
    };

    // Function to store the info about sku of an internal order in the database
    // INPUT - internal order id, {skuId, description, price, quantity}
    // OUTPUT - true if successful else false
    storeInternalOrderSku(id, products) {
        const sql = `INSERT INTO internalOrderSku(InternalOrderId, SkuId, Description, Price, Quantity) 
                     VALUES (?, ?, ?, ?, ?)`;

        let params = [];
        for (const sku of products) {
            params.push([id, sku.SKUId, sku.description, sku.price, sku.qty]);
        }

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);

            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || !this.changes) {
                        reject(err);
                        return;
                    }
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
        let sql = `INSERT INTO InternalOrderSkuItem (InternalOrderId, SkuId, RFID) 
                   VALUES (?, ?, ?)`;

        const params = [];
        for (const skuItem of skuItems) {
            params.push([id, skuItem.SkuID, skuItem.RFID]);
        }

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(sql);

            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || !this.changes) {
                        reject(err);
                        return;
                    }
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
        const sql = `UPDATE InternalOrder 
                     SET State=?
                     WHERE ID=?`;

        const params = [io.getState(), io.getId()];
        return new Promise((resolve, reject) => {
            this.#db.run(sql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                else resolve(this.changes > 0);
            });
        });
    };

    // Function to delete an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrder(id) {
        const sql = `DELETE FROM InternalOrder 
                     WHERE ID=?`;

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

    // Function to delete the info about sku of an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrderSku(id) {
        const sql = `DELETE FROM InternalOrderSku 
                     WHERE InternalOrderId=?`;

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

    // Function to delete the info about sku items of an internal order
    // INPUT - internal order id
    // OUTPUT - true if successful else false
    deleteInternalOrderSkuItems(id) {
        const sql = `DELETE FROM InternalOrderSkuItem 
                     WHERE InternalOrderId = ?`;

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

    /**
     * User
     */

    // it returns the user corresponding to the provided id and type; 'null' if it does not exist
    getUserByIdAndType(userId, userType) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM User
                              WHERE ID=? AND Type=?`;

            this.#db.get(sqlQuery, [userId, userType], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)
                    resolve(null);
                else
                    resolve(new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password));
            });
        });
    }

    getUser(username, type) {
        let sql = `SELECT * 
                   FROM User 
                   WHERE Email=? AND Type=?`;

        return new Promise((resolve, reject) => {
            this.#db.get(sql, [username, type], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(null);
                    return;
                }

                const user = new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password);
                resolve(user);
            });
        })
    }

    getAllUsersOfType(type) {
        let users = [];
        let sql = `SELECT * 
                   FROM User 
                   WHERE Type=?`;

        return new Promise((resolve, reject) => {
            this.#db.all(sql, [type], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (let row of rows) {
                    users.push(
                        new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password));
                }

                resolve(users);
            });
        })
    }

    getAllUsers() {
        let users = [];
        let sql = `SELECT * 
                   FROM User 
                   WHERE Type!='manager'`;

        return new Promise((resolve, reject) => {
            this.#db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (let row of rows) {
                    users.push(
                        new User(row.ID, row.Name, row.Surname, row.Email, row.Type, row.Password));
                }

                resolve(users);
            });
        })
    }

    storeNewUser(us) {
        let sql = `INSERT INTO User(Name, Surname, Email, Type, Password) 
                   VALUES (?,?,?,?,?)`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword()], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(new User(this.lastID, us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword()));
            });
        })
    }

    updateUser(us) {
        let sql = `UPDATE User 
                   SET Name=?,Surname=?,Email=?,Type=?,Password=? 
                   WHERE ID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [us.getName(), us.getSurname(), us.getEmail(), us.getType(), us.getPassword(), us.getId()], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        })
    }

    deleteUser(id) {
        let sql = `DELETE FROM User 
                   WHERE ID=?`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, [id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        })
    }

    //#region JUST FOR TESTING PURPOSES
    deleteTable(tableName) {
        let sql = `DELETE FROM ${tableName}`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        })
    }
    deleteFromSequence(tableName) {
        let sql = `DELETE FROM SQLITE_SEQUENCE WHERE NAME='${tableName}'`;

        return new Promise((resolve, reject) => {
            this.#db.run(sql, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(this.changes > 0);
            });
        })
    }
    insertSamples(tableName) {
        let table;
        let columns;
        let values;
        let params;
        switch (tableName) {
            case 'InternalOrder':
                table = 'InternalOrder';
                columns = '(CustomerId, State, IssueDate, ID)';
                values = '(?,?,?,?)';
                params = [[1, 'COMPLETED', '2021/11/29 09:33', 1]]
                break;
            case 'InternalOrderSku':
                table = 'InternalOrderSku';
                columns = '(Quantity, Price, Description, SkuId, InternalOrderId)';
                values = '(?,?,?,?,?)';
                params = [[20, 10.99, 'another sku', 5, 1]]
                break;
            case 'InternalOrderSkuItem':
                table = 'InternalOrderSkuItem';
                columns = '(RFID, SkuId, InternalOrderId)';
                values = '(?,?,?)';
                params = [['12345678901234567890123456789015', 5, 1]]
                break;
            case 'Item':
                table = 'Item';
                columns = '(SupplierId, SkuId, Price, Description, ID)';
                values = '(?,?,?,?,?)';
                params = [[1, 1, 10.99, 'a new item', 1], [2, 5, 11.99, 'another item', 2]]
                break;
            case 'Position':
                table = 'Position';
                columns = '(OccupiedVolume, OccupiedWeight, MaxVolume, MaxWeight, Col, Row, Aisle, ID) ';
                values = '(?,?,?,?,?,?,?,?)';
                params = [
                    [0, 0, 1000, 1000, 3415, 3452, 8002, 800234523415],
                    [100, 200, 1000, 1000, 3417, 3452, 8002, 800234523417],
                    [5, 10, 1000, 1000, 3410, 3452, 8002, 800234523410],
                    [0, 0, 600, 1200, 3414, 3452, 8002, 800234523414],
                    [0, 0, 1000, 2000, 3413, 3452, 8002, 800234523413]
                ];
                break;
            case 'RestockOrder':
                table = 'RestockOrder';
                columns = '(TransportNote, SupplierId, State, IssueDate, ID)';
                values = '(?,?,?,?,?)';
                params = [
                    ['delivered on 2021/12/05', 1, 'DELIVERED', '2021/11/29 09:33', 1],
                    [null, 2, 'ISSUED', '2021/11/29 09:33', 8]
                ];
                break;
            case 'RestockOrderSku':
                table = 'RestockOrderSku';
                columns = '(Quantity, Price, Description, SkuId, RestockOrderId)';
                values = '(?,?,?,?,?)';
                params = [
                    [20, 10.99, 'a sku', 1, 1]
                    [30, 10.99, 'a product', 12, 8],
                    [20, 11.99, 'another product', 180, 8]
                ];
                break;
            case 'RestockOrderSkuItem':
                table = 'RestockOrderSkuItem';
                columns = '(RFID, SkuId, RestockOrderId)';
                values = '(?,?,?)';
                params = [
                    ['12345678901234567890123456789011', 1, 1]
                ];
                break;
            case 'ReturnOrder':
                table = 'ReturnOrder';
                columns = '(RestockOrderId, ReturnDate, ID) ';
                values = '(?,?,?)';
                params = [
                    [1, '2021/11/29', 1]
                ];
                break;
            case 'ReturnOrderSkuItem':
                table = 'ReturnOrderSkuItem';
                columns = '(RFID, Price, Description, SkuId, ReturnOrderId)';
                values = '(?,?,?,?,?)';
                params = [
                    ['12345678901234567890123456789011', 10.99, 'a sku', 1, 1],
                    ['12345678901234567890123456789012', 11, 'a sku', 1, 1]
                ];
                break;
            case 'Sku':
                table = 'Sku';
                columns = '(Price,AvailableQuantity,Position,Notes,Volume,Weight,Description,ID)';
                values = '(?,?,?,?,?,?,?,?)';
                params = [
                    [10.99, 2, 800234523417, 'first sku', 50, 100, 'a sku', 1],
                    [10.99, 0, 800234523415, 'third sku', 60, 101, 'another sku', 3]
                    [10.99, 1, 800234523412, 'second sku', 5, 10, 'another sku', 5]
                ];
                break;
            case 'SkuItem':
                table = 'SkuItem';
                columns = '(DateOfStock, Available, SkuId, RFID)';
                values = '(?,?,?,?)';
                params = [
                    ['2021/11/29', 1, 1, '12345678901234567890123456789011'],
                    ['2021/11/29', 1, 1, '12345678901234567890123456789015']
                ];
                break;
            case 'TestDescriptor':
                table = 'TestDescriptor';
                columns = '(SkuId,ProcedureDescription,Name,ID)';
                values = '(?,?,?,?)';
                params = [
                    [1, 'This test is described by...', 'test desc 1', 1],
                    [5, 'This test is described by...', 'test desc 2', 2],
                    [5, 'This test is described by...', 'test desc 3', 3]
                ];
                break;
            case 'TestResult':
                table = 'TestResult';
                columns = '(Result,Date,TestDescriptorId,RFID,ID)';
                values = '(?,?,?,?,?)';
                params = [
                    [1, '2021/11/28', 1, '12345678901234567890123456789011', 1],
                    [0, '03/05/2022', 2, '12345678901234567890123456789015', 2],
                    [1, '05/05/2022', 3, '12345678901234567890123456789015', 3]
                ];
                break;
            case 'User':
                table = 'User';
                columns = '(Password, Type, Email, Surname, Name, ID)';
                values = '(?,?,?,?,?,?)';
                params = [
                    ['$2b$10$DpP7/.UA1BBIJh1HLIzfEuL9i76YtSNRFqxI2jOSzdd7JZjeooBqK', 'supplier', 'e1@gmail.com', 'S1', 'N1', 1],
                    ['$2b$10$scv95TLAb32Q48PEazMzm.D4F7tPskbFuoYQKBDHDdYLvqsIflaw6', 'supplier', 'e2@gmail.com', 'S4', 'N4', 2],
                    ['$2b$10$DpP7/.UA1BBIJh1HLIzfEuL9i76YtSNRFqxI2jOSzdd7JZjeooBqK', 'manager', 'e3@gmail.com', 'S3', 'N3', 3],
                    ['$2b$10$do5Y76EDsWuJGhX71mT/QO5kcSKxLyLZUInZObN9lWhIDm6Ybk/xa', 'customer', 'e5@gmail.com', 'S5', 'N5', 5],
                    ['$2b$10$lXCmmtWjPWUZNOeuDKN4tuCoY2SNyM7pS48CJjZMSPi.oksxH3PhG', 'clerk', 'e6@gmail.com', 'S6', 'N6', 6],
                    ['$2b$10$DpJJBjSIhHrUIeqN6DGjQO6HElIWkW0EUv0M/.eDXehvsnoUH4AWW', 'customer', 'user1@ezwh.com', 'ezwh', 'user1', 10],
                    ['$2b$10$8ifkqdltPnGcmtM1L78.u.d0dadJOfC8Gzo9xO96zo7y09KO7LTM6', 'qualityEmployee', 'qualityEmployee1@ezwh.com', 'ezwh', 'qualityEmployee1', 11],
                    ['$2b$10$Ck3wFm8A1OuRZoWYmUoFd.dbIfzBajcwyPQoeEvRyPY3jboCClbGi', 'clerk', 'clerk1@ezwh.com', 'ezwh', 'clerk1', 12],
                    ['$2b$10$ltVGctpeT1WmH2eDNS4.yeLXYywbOO9RFtiUQyCP8KqXSwwd5MzU.', 'deliveryEmployee', 'deliveryEmployee1@ezwh.com', 'ezwh', 'deliveryEmployee1', 13],
                    ['$2b$10$BuNuZgCIaTdEqK6.5vDVx.TF97zrcyDcRxaEt7BLNEZ9Kze/BlS1y', 'supplier', 'supplier1@ezwh.com', 'ezwh', 'supplier1', 14],
                    ['$2b$10$w6ssb3.pV/HiWEHYr9btM.IA5J..eaHP3JEFBRy2AeCsyUz9N1hp.', 'manager', 'manager1@ezwh.com', 'ezwh', 'manager1', 16]
                ];
                break;
        }

        let query = `INSERT INTO ${table} ${columns} VALUES ${values}`;

        return new Promise((resolve, reject) => {
            let statement = this.#db.prepare(query);
            for (let i = 0; i < params.length; i++) {
                statement.run(params[i], function (err) {
                    if (err || this.changes === 0) {
                        reject(err);
                        return;
                    }
                });
            }

            statement.finalize();
            resolve(true);
        });

    }
    //#endregion
}

module.exports = DbManager.getInstance;
