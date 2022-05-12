const {isInt} = require("../utilities");
const Position = require("../models/position");
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();
const Joi = require('joi');

// GET /api/positions
async function getAllPositions() {
    const allPositions = await dao.getAllPositions();

    return {
        obj: allPositions,
        code: 200
    };
};

// POST /api/position
async function createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
    // * Q: Has to be properly checked the case in which the new positionId already exists?
    //      (and it cannot be duplicated) *
    const tempPosition = await dao.getPosition(positionID);

    if (tempPosition) return {  // already exist a position with that ID
        error: "Conflict",
        code: 409
    };  

    // * store the new position *
    const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0);
    const positionWasCreated = await dao.storePosition(newPosition);

    if(!positionWasCreated) return { // generic mistake during object creation
        error: "Internal server error",
        code: 500    
    }
         
    return {  // position successfully created
        code: 201
    }
}

// PUT /api/position/:positionID
async function updatePosition(oldPositionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, 
    newOccupiedWeight, newOccupiedVolume) {

    // check if the required Position exists
    const oldPosition = await dao.getPosition(oldPositionID);

    if (!oldPosition) return { // positionId not found
        error: "Position not found",
        code: 404
    } 

    // this http method must update also the positionID, according to 
    // the new provided aisle, row and col (see API.md)
    const newPositionID = `${newAisleID}${newRow}${newCol}`;
    
    // * Q: Has to be properly checked the case in which the new positionId already exists?
    //      (and it cannot be duplicated) *
    const tempPosition = oldPositionID !== newPositionID && await dao.getPosition(newPositionID);

    if (tempPosition) return { // already exist a position with that ID
        error: "Conflict",
        code: 409
    }

    // * update the position *
    const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, 
        newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

    const positionWasUpdated = await dao.updatePosition(oldPositionID, newPosition);

    if(!positionWasUpdated) return { // generic mistake during object update
        error: "Internal server error",
        code: 500
    }
     
    return { // position successfully updated
        code: 200
    }
}

// PUT /api/position/:positionID/changeID
async function updatePositionId(oldPositionID, newPositionID, newAisleID, newRow, newCol) {
    
    // check if already exist the specific position
    const oldPosition = await dao.getPosition(oldPositionID);

    if (!oldPosition) return { // positionId not found
        error: "Position not found",
        code: 404    
    }

    // * Q: Has to be properly checked the case in which the new positionId already exists?
    //      (and it cannot be duplicated) *
    const tempPosition = oldPositionID !== newPositionID && await dao.getPosition(newPositionID);

    if (tempPosition) return { // already exist a position with that ID
        error: "Conflict",
        code: 409
    }
        
    // * update the positionId *

    const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, oldPosition.getMaxWeight(), 
        oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight(), oldPosition.getOccupiedVolume());

    const positionWasUpdated = await dao.updatePosition(oldPositionID, newPosition);

    if(!positionWasUpdated) return { // generic mistake during object update
        error: "Conflict",
        code: 409
    }

    return {  // positionId successfully updated
        code: 200
    }
}

// DELETE /api/position/:positionID
async function deletePosition(positionID) {
    const position = await dao.getPosition(positionID);

    if(!position) return {
        error: "Position not found",
        code: 404
    }

    // cannot delete a position that is not free
    if (position.getOccupiedWeight() > 0 || position.getOccupiedVolume() > 0) return {
        error: "Bad request",
        code: 400
    }

    const positionWasDeleted = await dao.deletePosition(positionID);

    if(!positionWasDeleted) return {
        error: "Service unavailable",    // generic error during deletion
        code: 503
    }
    
    return {
        code: 204   // position successfully deleted
    }
}

module.exports = {
    getAllPositions,
    createPosition,
    updatePosition,
    updatePositionId,
    deletePosition
}