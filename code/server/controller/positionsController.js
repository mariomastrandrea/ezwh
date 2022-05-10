const Position = require("../models/position");
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();

function getAllPositions(req, res) {
    // todo add login check
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

function createPosition(req, res) {
    // todo add login check
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

        const {positionID, aisleID, row, col, maxWeight, maxVolume} = newPosObj;
        const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);

        const createdPosition = await dao.storePosition(newPosition);
        return res.status(201).send("Created");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// TODO: to implement
function updatePosition(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
}

// TODO: to implement
function updatePositionId(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
}

// TODO: to implement
function deletePosition(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
}

module.exports = {
    getAllPositions,
    createPosition,
    updatePosition,
    updatePositionId,
    deletePosition
}