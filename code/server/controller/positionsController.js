const Position = require("../models/position");
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();
const Joi = require('joi');

// GET /api/positions
async function getAllPositions(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const allPositions = await dao.getAllPositions();
        console.log(allPositions);
        return res.status(200).json(allPositions);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};

// POST /api/position
async function createPosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const schema = Joi.object({
            positionID: Joi.string().min(12).max(12).required().valid(req.body.aisleID+req.body.row+req.body.col),
            aisleID: Joi.string().min(4).max(4).required(),
            row: Joi.string().min(4).max(4).required(),
            col: Joi.string().min(4).max(4).required(),
            maxWeight: Joi.number().required(),
            maxVolume: Joi.number().required()
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }
        
        const {positionID, aisleID, row, col, maxWeight, maxVolume} = req.body;

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = await dao.getPosition(positionID);

        if (tempPosition) 
            return res.status(409).send("Conflict");  // already exist a position with that ID

        // store the new position
        const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0);
        const positionWasCreated = await dao.storePosition(newPosition);

        if(!positionWasCreated) // generic mistake during object creation
            return res.status(500).send("Internal server error"); 
        
        return res.status(201).send("Created");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// PUT /api/position/:positionID
async function updatePosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().min(12).max(12).required().validate(req.params.positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const schema = Joi.object({
            newAisleID: Joi.string().min(4).max(4).required(),
            newRow: Joi.string().min(4).max(4).required(),
            newCol: Joi.string().min(4).max(4).required(),
            newMaxWeight: Joi.number().required(),
            newMaxVolume: Joi.number().required(),
            newOccupiedWeight: Joi.number().required(),
            newOccupiedVolume: Joi.number().required()
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { positionID } = req.params;
        const { newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, 
            newOccupiedWeight, newOccupiedVolume } = req.body;


        // check if the required Position exists
        const oldPosition = await dao.getPosition(positionID);

        if (!oldPosition) { // positionId not found
            return res.status(404).send("Position not found");
        }

        // this http method must update also the positionID, according to 
        // the new provided aisle, row and col (see API.md)
        const newPositionID = `${newAisleID}${newRow}${newCol}`;

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = positionID !== newPositionID && await dao.getPosition(newPositionID);

        if (tempPosition) 
            return res.status(409).send("Conflict");  // already exist a position with that ID

        // update the position
        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, 
            newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

        const positionWasUpdated = await dao.updatePosition(positionID, newPosition);

        if(!positionWasUpdated) // generic mistake during object update
            return res.status(500).send("Internal server error"); 

        return res.status(200).send("Ok");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// PUT /api/position/:positionID/changeID
async function updatePositionId(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().min(12).max(12).required().validate(req.params.positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        if (Joi.string().min(12).max(12).required().validate(req.body.newPositionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { positionID } = req.params;
        const { newPositionID } = req.body;

        // check if already exist the specific position
        const oldPosition = await dao.getPosition(positionID);

        if (!oldPosition) { // positionId not found
            return res.status(404).send("Position not found");
        }

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = positionID !== newPositionID && await dao.getPosition(newPositionID);

        if (tempPosition) 
            return res.status(409).send("Conflict");  // already exist a position with that ID

        // update the positionId

        // this http method must update also the aisleID, row and col, according to the new PositionID (see API.md)
        const newAisleID = newPositionID.slice(0, 4);
        const newRow     = newPositionID.slice(4, 8);
        const newCol     = newPositionID.slice(8, 12);

        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, oldPosition.getMaxWeight(), 
            oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight(), oldPosition.getOccupiedVolume());

        const positionWasUpdated = await dao.updatePosition(positionID, newPosition);

        if(!positionWasUpdated)     // generic mistake during object update
            return res.status(409).send("Conflict"); 

        return res.status(200).send("Ok");
    }
    catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable");
    }
}

// DELETE /api/position/:positionID
async function deletePosition(req, res) {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().min(12).max(12).required().validate(req.params.positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { positionID } = req.params;

        const positionWasDeleted = await dao.deletePosition(positionID);

        if(!positionWasDeleted) 
            return res.status(404).send("Position not found"); 
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