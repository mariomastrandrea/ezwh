const { db } = require("./dbUtilities");
const Position = require("../models/position");

class DbManager3 {
    #db;
    instance;  // singleton instance

    constructor() {
        this.#db = db;
    }

    static getInstance() {
        if(!instance)
            instance = new DbManager3();

        return instance;
    }

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

    storePosition(newPosition) {
        const { positionId, aisle, row, col, maxWeight, maxVolume, 
            occupiedWeight, occupiedVolume } = newPosition;

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

    updatePosition(oldPositionId, newPosition) {
        const { positionId, aisle, row, col, maxWeight, maxVolume, 
            occupiedWeight, occupiedVolume } = newPosition;
            
        return new Promise((resolve, reject) => {
            const sqlStatement = `UPDATE position
                                  SET    id=?, aisle=?, row=?, col=?, maxWeight=?, 
                                         maxVolume=?, occupiedWeight=?, occupiedVolume=?
                                  WHERE  id=?`;
            
            db.run(sqlStatement, [positionId, aisle, row, col, maxWeight, maxVolume, 
                    occupiedWeight, occupiedVolume, oldPositionId], function (err) {
                if (err) 
                    reject(err);
                else if (!this.changes)   // positionId not found
                    resolve(null);
                else
                    resolve(new Position(this.lastID, aisle, row, col, maxWeight, maxVolume, 
                        occupiedWeight, occupiedVolume));
            });
        });
    }

    deletePosition(positionId) {
        return new Promise((resolve, reject) => {
            const sqlStatement = `DELETE FROM position
                                  WHERE id=?`;
            
            db.run(sqlStatement, [positionId], function(err) {
                if(err)
                    reject(err);
                else 
                    resolve(!!this.changes)
            })
        });
    }
}

module.exports = DbManager3.getInstance;