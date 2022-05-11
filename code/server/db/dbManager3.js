const { db } = require("./dbUtilities");
const Position = require("../models/position");

let instance;  // singleton instance

class DbManager3 {
    #db;

    constructor() {
        this.#db = db;
    }

    static getInstance() {
        if(!instance)
            instance = new DbManager3();

        return instance;
    }

    // returns the required position, or 'null' if it is not found
    getPosition(positionId) {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM position
                              WHERE id=?`;
            
            db.get(sqlQuery, [positionId], (err, row) => {
                if (err)
                    reject(err);
                else if (!row)  // position not found
                    resolve(null);
                else 
                    resolve(new Position(row.id, row.aisle, row.row, row.col, row.maxWeight, 
                        row.maxVolume, row.occupiedWeight, row.occupiedVolume));   
            });
        });
    }

    // returns an array containing all the existing positions
    getAllPositions() {
        return new Promise((resolve, reject) => {
            const sqlQuery = `SELECT *
                              FROM position`;
            
            db.all(sqlQuery, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows.map(row => 
                        new Position(row.id, row.aisle, row.row, row.col, row.maxWeight, 
                            row.maxVolume, row.occupiedWeight, row.occupiedVolume)));
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
            `INSERT INTO position (id, aisle, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sqlStatement, [positionId, aisle, row, col, maxWeight, maxVolume, 
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
            const sqlStatement = `UPDATE position
                                  SET    id=?, aisle=?, row=?, col=?, maxWeight=?, 
                                         maxVolume=?, occupiedWeight=?, occupiedVolume=?
                                  WHERE  id=?`;
            
            db.run(sqlStatement, [positionId, aisle, row, col, maxWeight, maxVolume, 
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
            const sqlStatement = `DELETE FROM position
                                  WHERE id=?`;
            
            db.run(sqlStatement, [positionId], function(err) {
                if(err)
                    reject(err);
                else 
                    resolve(this.changes > 0)
            })
        });
    }
}

module.exports = DbManager3.getInstance;