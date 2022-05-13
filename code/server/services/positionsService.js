const Position = require("../models/position");

class PositionService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/positions
    async getAllPositions() {
        const allPositions = await this.#dao.getAllPositions();

        return {
            obj: allPositions,
            code: 200
        };
    };

    // POST /api/position
    async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = await this.#dao.getPosition(positionID);

        if (tempPosition) return {  // already exist a position with that ID
            error: `Unprocessable Entity - ${positionID} already present`,
            code: 422
        };

        // * store the new position *
        const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0);
        const positionWasCreated = await this.#dao.storePosition(newPosition);

        if (!positionWasCreated) return { // generic mistake during object creation
            error: "Service Unavailable",
            code: 503
        }

        return {  // position successfully created
            code: 201
        }
    }

    // PUT /api/position/:positionID
    async updatePosition(oldPositionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume,
        newOccupiedWeight, newOccupiedVolume) {

        // check if the required Position exists
        const oldPosition = await this.#dao.getPosition(oldPositionID);

        if (!oldPosition) return { // positionId not found
            error: "Position not found",
            code: 404
        }

        // this http method must update also the positionID, according to 
        // the new provided aisle, row and col (see API.md)
        const newPositionID = `${newAisleID}${newRow}${newCol}`;

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = oldPositionID !== newPositionID && await this.#dao.getPosition(newPositionID);

        if (tempPosition) return { // already exist a position with that ID
            error: `Unprocessable Entity - ${newPositionID} already present`,
            code: 422
        }

        // check weight and volume
        if (newOccupiedWeight > newMaxWeight || newOccupiedVolume > newMaxVolume) return {
            error: "Unprocessable Entity - no enough volume/weight",
            code: 422
        }

        // check if the occupied weight and volume are consistent with the already present SkuItems (?)
        const { weight, volume } = await this.#dao.getOccupiedCapacitiesOf(oldPositionID);

        if (weight !== newOccupiedWeight || volume !== newOccupiedVolume) return {
            error: "Unprocessable Entity - new capacities are inconsistent with the existing SkuItems",
            code: 422
        }

        // * update the position *
        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol,
            newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

        const positionWasUpdated = await this.#dao.updatePosition(oldPositionID, newPosition);  // update Position table

        if (!positionWasUpdated) return { // generic mistake during object update
            error: "Service Unavailable",
            code: 503
        }

        if (oldPositionID !== newPositionID) { // cascading update on Sku(Position) ?
            this.#dao.updateSkuPosition(oldPositionID, newPositionID); // update Sku table
        }
    
        return { // position successfully updated
            code: 200
        }
    }

    // PUT /api/position/:positionID/changeID
    async updatePositionId(oldPositionID, newPositionID, newAisleID, newRow, newCol) {

        // check if already exist the specific position
        const oldPosition = await this.#dao.getPosition(oldPositionID);

        if (!oldPosition) return { // positionId not found
            error: "Position not found",
            code: 404
        }

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = oldPositionID !== newPositionID && await this.#dao.getPosition(newPositionID);

        if (tempPosition) return { // already exist a position with that ID
            error: `Unprocessable Entity - ${newPositionID} already present`,
            code: 422
        }

        // * update the positionId *

        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, oldPosition.getMaxWeight(),
            oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight(), oldPosition.getOccupiedVolume());

        // update Position table -> Sku(Position) cascading update?
        const positionWasUpdated = await this.#dao.updatePosition(oldPositionID, newPosition);     

        if (!positionWasUpdated) return { // generic mistake during object update
            error: "Service Unavailable",
            code: 503
        }

        await this.#dao.updateSkuPosition(oldPositionID, newPositionID); // update Sku table

        return {  // positionId successfully updated
            code: 200
        }
    }

    // DELETE /api/position/:positionID
    async deletePosition(positionID) {
        const position = await this.#dao.getPosition(positionID);

        if (!position) return {
            error: "Position not found",
            code: 404
        }

        // cannot delete a position that is not free
        if (position.getOccupiedWeight() > 0 || position.getOccupiedVolume() > 0) return {
            error: "Unprocessable Entity - Position is not free",
            code: 422
        }

        // check if there is an existing Sku associated to that Position
        const tempSku = await this.#dao.getSkuOfPosition(positionID);

        if (tempSku) return {
            error: `Unprocessable Entity - Existing sku associated to ${positionID}`,
            code: 422
        }

        // * delete the Position *
        const positionWasDeleted = await this.#dao.deletePosition(positionID);

        if (!positionWasDeleted) return {
            error: "Service Unavailable",    // generic error during deletion
            code: 503
        }

        return {
            code: 204   // position successfully deleted
        }
    }
}

module.exports = PositionService