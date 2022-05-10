
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
}

module.exports = Position;