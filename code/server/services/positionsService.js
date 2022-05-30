const Position = require("../models/position");

const {
    OK,
    CREATED,
    NO_CONTENT,
    NOT_FOUND,
    UNPROCESSABLE_ENTITY,
    INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE
} = require("../statusCodes");


class PositionsService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/positions
    async getAllPositions() {
        const allPositions = await this.#dao.getAllPositions();
        return OK(allPositions);
    };

    // POST /api/position
    async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = await this.#dao.getPosition(positionID);

        if (tempPosition)   // already exist a position with that ID
            return UNPROCESSABLE_ENTITY(`${positionID} already present`);

        // * store the new position *
        const newPosition = new Position(positionID, aisleID, row, col, maxWeight, maxVolume, 0, 0);
        const positionWasCreated = await this.#dao.storePosition(newPosition);

        if (!positionWasCreated)
            return SERVICE_UNAVAILABLE();  // generic mistake during object creation

        return CREATED();  // position successfully created
    }

    // PUT /api/position/:positionID
    async updatePosition(oldPositionID, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume,
        newOccupiedWeight, newOccupiedVolume) {

        // check if the required Position exists
        const oldPosition = await this.#dao.getPosition(oldPositionID);

        if (!oldPosition)
            return NOT_FOUND("Position not found");

        // this http method must update also the positionID, according to 
        // the new provided aisle, row and col (see API.md)
        const newPositionID = `${newAisleID}${newRow}${newCol}`;

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = oldPositionID !== newPositionID && await this.#dao.getPosition(newPositionID);

        if (tempPosition)   // already exist a position with that ID
            return UNPROCESSABLE_ENTITY(`${newPositionID} already present`);

        // check weight and volume
        if (newOccupiedWeight > newMaxWeight || newOccupiedVolume > newMaxVolume)
            return UNPROCESSABLE_ENTITY("no enough volume/weight");

        /*
        // check if the occupied weight and volume are consistent with the already present SkuItems (?)
        const { weight, volume } = await this.#dao.getOccupiedCapacitiesOf(oldPositionID);

        if (weight !== newOccupiedWeight || volume !== newOccupiedVolume)
            return UNPROCESSABLE_ENTITY("new capacities are inconsistent with the existing SkuItems");
        */
        
        // * update the position *
        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol,
            newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume);

        const positionWasUpdated = await this.#dao.updatePosition(oldPositionID, newPosition);  // update Position table

        if (!positionWasUpdated)  // generic mistake during object update
            return SERVICE_UNAVAILABLE();

        // * cascading updates on Sku(Position) made by sqlite *
        return OK(); // position successfully updated
    }

    // PUT /api/position/:positionID/changeID
    async updatePositionId(oldPositionID, newPositionID, newAisleID, newRow, newCol) {

        // check if already exist the specific position
        const oldPosition = await this.#dao.getPosition(oldPositionID);

        if (!oldPosition) 
            return NOT_FOUND(`position ${oldPositionID} is not found`);

        // * Q: Has to be properly checked the case in which the new positionId already exists?
        //      (and it cannot be duplicated) *
        const tempPosition = oldPositionID !== newPositionID && await this.#dao.getPosition(newPositionID);

        if (tempPosition)   // already exist a position with that ID
            return UNPROCESSABLE_ENTITY(`${newPositionID} already present`);

        // * update the positionId *

        const newPosition = new Position(newPositionID, newAisleID, newRow, newCol, oldPosition.getMaxWeight(),
            oldPosition.getMaxVolume(), oldPosition.getOccupiedWeight(), oldPosition.getOccupiedVolume());

        // update Position table -> Sku(Position) cascading update?
        const positionWasUpdated = await this.#dao.updatePosition(oldPositionID, newPosition);

        if (!positionWasUpdated)  // generic mistake during object update
            return SERVICE_UNAVAILABLE();

        await this.#dao.updateSkuPosition(oldPositionID, newPositionID); // update Sku table
        return OK();  // positionId successfully updated
    }

    // DELETE /api/position/:positionID
    async deletePosition(positionID) {
        const position = await this.#dao.getPosition(positionID);

        if (!position)  // position not found
            return UNPROCESSABLE_ENTITY(`position ${positionID} is not found`);

        /*
        // cannot delete a position that is not free
        if (position.getOccupiedWeight() > 0 || position.getOccupiedVolume() > 0)
            return UNPROCESSABLE_ENTITY("Position is not free");

        // check if there is an existing Sku associated to that Position
        const tempSku = await this.#dao.getSkuOfPosition(positionID);

        if (tempSku)
            return UNPROCESSABLE_ENTITY(`Existing sku associated to ${positionID}`);
        */

        // * delete the Position *
        const positionWasDeleted = await this.#dao.deletePosition(positionID);

        if (!positionWasDeleted)  // generic error during deletion
            return SERVICE_UNAVAILABLE();

        return NO_CONTENT(); // position successfully deleted
    }
}

module.exports = PositionsService