const express = require('express');
const Joi = require('joi');
const router = express.Router();

/**
 * Position
 */

const {
    getAllPositions,
    createPosition,
    updatePosition,
    updatePositionId,
    deletePosition
} = require("../services/positionsService.js");

router.get("/positions", (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const {error, code} = await getAllPositions();
        
        if(error) {
            return res.status(code).send(error);
        }

        const allPositions = result.obj;
        return res.status(code).json(allPositions);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
});

router.post("/position", (req, res) => {
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
        const {error, code} = await createPosition(positionID, aisleID, row, col, maxWeight, maxVolume);

        if(error) {
            return res.status(code).send(error);
        }

        return res.status(code).end();  // no response body
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

router.put("/position/:positionID", (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { positionID } = req.params;

        if (Joi.string().min(12).max(12).required().validate(positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const aisleID = positionID.slice(0, 4);
        const row     = positionID.slice(4, 8);
        const col     = positionID.slice(8, 12);

        if(!isInt(aisleID) || !isInt(row) || !isInt(col)) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
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

        const { newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, 
            newOccupiedWeight, newOccupiedVolume } = req.body;

        const {error, code} = await updatePosition(positionID, newAisleID, 
            newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

        if (error) {
            return res.status(code).send(error);
        }
        
        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

router.put("/position/:positionID/changeID", (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { positionID } = req.params;

        if (Joi.string().min(12).max(12).required().validate(positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const aisleID = positionID.slice(0, 4);
        const row     = positionID.slice(4, 8);
        const col     = positionID.slice(8, 12);

        if(!isInt(aisleID) || !isInt(row) || !isInt(col)) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate response body
        const { newPositionID } = req.body;

        if (Joi.string().min(12).max(12).required().validate(newPositionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        // this http method must update also the aisleID, row and col, according to the new PositionID (see API.md)
        const newAisleID = newPositionID.slice(0, 4);
        const newRow     = newPositionID.slice(4, 8);
        const newCol     = newPositionID.slice(8, 12);

        if(!isInt(newAisleID) || !isInt(newRow) || !isInt(newCol)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const {error, code} = await updatePositionId(positionID, newPositionID, newAisleID, newRow, newCol);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

router.delete("/position/:positionID", (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { positionID } = req.params;

        if (Joi.string().min(12).max(12).required().validate(positionID).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const aisleID = positionID.slice(0, 4);
        const row     = positionID.slice(4, 8);
        const col     = positionID.slice(8, 12);

        if(!isInt(aisleID) || !isInt(row) || !isInt(col)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const {error, code} = await deletePosition(positionID);

        return error ? 
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

// module export
module.exports = router;

