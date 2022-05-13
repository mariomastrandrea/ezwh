const { dbConnection } = require("./dbUtilities");
const Position = require("../models/position");
const Sku = require("../models/sku");

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
}

module.exports = DbManager3.getInstance;