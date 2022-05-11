const Position = require("../models/position");
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();

// GET /api/positions
function getAllPositions(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const allPositions = await dao.getAllPositions();
        return res.status(200).json(allPositions);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

// POST /api/position
function createPosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const newPosObj = req.body;
        
        if(!newPosObj || !newPosObj.positionID || !newPosObj.aisleID || 
            !newPosObj.row || !newPosObj.col || !newPosObj.maxWeight || 
            !newPosObj.maxVolume) {
            // TODO: better validation (for you Kristi <3)
            return res.status(422).send("Unprocessable Entity");
        }

        // check consistency between positionID and (aisleID, row, col)
        if(newPosObj.positionID !== `${newPosObj.aisleID}${newPosObj.row}${newPosObj.col}`) {
            return res.status(400).send("Bad request"); // ?
        }

        const {positionID, aisleID, row, col, maxWeight, maxVolume} = newPosObj;
        const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0);

        const createdPosition = await dao.storePosition(newPosition);
        return res.status(201).send("Created");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// PUT /api/position/:positionID
function updatePosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { positionID } = req.params;

        if(!req.body) {
            return res.status(422).send("Unprocessable Entity");
        }

        const { newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, 
            newOccupiedWeight, newOccupiedVolume } = req.body;
        
        if(!newAisleID || !newRow || !newCol || !newMaxWeight || 
           !newMaxVolume || !newOccupiedWeight || !newOccupiedVolume ||
            positionID.length != 12) {
            // TODO: better validation (for you Kristi <3)
            return res.status(422).send("Unprocessable Entity");
        }

        const oldPosition = await dao.getPosition(positionID);

        if (!oldPosition) { // positionId not found
            return res.status(404).send("Position not found");
        }

        // this method update also the positionID, according to the new provided aisle, row and col (see API.md)
        const newPositionID = `${newAisleID}${newRow}${newCol}`;

        // * Q: Has to be properly checked the case in which the newPosition already exists?
        //      (and it cannot be duplicated) *

        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, 
            newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

        const updatedPosition = await dao.updatePosition(positionID, newPosition);
        return res.status(200).send("Ok");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// PUT /api/position/:positionID/changeID
function updatePositionId(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { positionID } = req.params;

        if(!req.body) {
            return res.status(422).send("Unprocessable Entity");
        }

        const { newPositionID } = req.body;
        
        if(!newPositionID || newPositionID.length != 12) {
            // TODO: better validation for newPositionID's format (for you Kristi <3)
            return res.status(422).send("Unprocessable Entity");
        }

        const oldPosition = await dao.getPosition(positionID);

        if (!oldPosition) { // positionId not found
            return res.status(404).send("Position not found");
        }

        // * Q: Has to be properly checked the case in which the newPosition already exists?
        //      (and it cannot be duplicated) *

        // this method update also the aisleID, row and col, according to the new PositionID (see API.md)
        const newAisleID = newPositionID.slice(0, 4);
        const newRow     = newPositionID.slice(4, 8);
        const newCol     = newPositionID.slice(8, 12);

        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, oldPosition.maxWeight, 
            oldPosition.maxVolume, oldPosition.occupiedWeight, oldPosition.occupiedVolume);

        const updatedPosition = await dao.updatePosition(positionID, newPosition);
        return res.status(200).send("Ok");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// DELETE /api/position/:positionID
function deletePosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { positionID } = req.params;
        
        if(!positionID || positionID.length != 12) {
            // TODO: better validation (for you Kristi <3)
            return res.status(422).send("Unprocessable Entity");
        }

        const deleted = await dao.deletePosition(positionID);

        if(!deleted) 
            return res.status(404).send("Position not found"); // to review
        else
            return res.status(204).send("No content");  // ok
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

module.exports = {
    getAllPositions,
    createPosition,
    updatePosition,
    updatePositionId,
    deletePosition
}