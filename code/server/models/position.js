
class Position {
    #positionId;
    #aisle;
    #row;
    #col;
    #maxWeight;
    #maxVolume;
    #occupiedWeight;
    #occupiedVolume;

    constructor(positionId, aisle, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
        this.#positionId = positionId;
        this.#aisle = aisle;
        this.#row = row;
        this.#col = col;
        this.#maxWeight = maxWeight;
        this.#maxVolume = maxVolume;
        this.#occupiedWeight = occupiedWeight;
        this.#occupiedVolume = occupiedVolume;
    }

    // getters
    getPositionId = () => this.#positionId;
    getAisle = () => this.#aisle;
    getRow = () => this.#row;
    getCol = () => this.#col;
    getMaxWeight = () => this.#maxWeight;
    getMaxVolume = () => this.#maxVolume;
    getOccupiedWeight = () => this.#occupiedWeight;
    getOccupiedVolume = () => this.#occupiedVolume;

    // setters
    setPositionId = (positionId) => this.#positionId = positionId;
    setAisle = (aisle) => this.#aisle = aisle;
    setRow = (row) => this.#row = row;
    setCol = (col) => this.#col = col;
    setMaxWeight = (maxWeight) => this.#maxWeight = maxWeight;
    setMaxVolume = (maxVolume) => this.#maxVolume = maxVolume;
    setOccupiedWeight = (occupiedWeight) => this.#occupiedWeight = occupiedWeight;
    setOccupiedVolume = (occupiedVolume) => this.#occupiedVolume = occupiedVolume;

    canHold = (newAvailableQuantity, newWeight, newVolume) => {
        const newOccupiedWeight = newAvailableQuantity * newWeight;
        const newOccupiedVolume = newAvailableQuantity * newVolume;

        return newOccupiedWeight <= this.#maxWeight && newOccupiedVolume <= this.#maxVolume;
    }

    toJSON = () => ({
        positionID: this.#positionId,
        aisleID: this.#aisle, 
        row: this.#row,
        col: this.#col,
        maxWeight: this.#maxWeight,
        maxVolume: this.#maxVolume,
        occupiedWeight: this.#occupiedWeight,
        occupiedVolume: this.#occupiedVolume
    });
}

module.exports = Position;