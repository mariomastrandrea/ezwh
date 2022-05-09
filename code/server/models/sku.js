Number.prototype.pad = function(size) {
    return new Array(size).join('0').slice((size || 2)*-1) + this;
}

class Sku {
    // variables
    #id;
    #description;
    #weight;
    #volume;
    #notes;
    #position;
    #availableQuantity;
    #price;
    #testDescriptors;

    constructor(description, weight, volume, notes, price, availableQuantity, position="", testDescriptors=[], id=null) {
        this.#id = id.pad(12);
        this.#description = description;
        this.#weight = weight;
        this.#volume = volume;
        this.#notes = notes;
        this.#availableQuantity = availableQuantity;
        this.#price = price;
        this.#testDescriptors = testDescriptors;
        this.#position = position;
    }

    // getters
    getId = () => this.#id;
    getDescription = () => this.#description;
    getWeight = () => this.#weight;
    getVolume = () => this.#volume;
    getNotes = () => this.#notes;
    getPosition = () => this.#position;
    getAvailableQuantity = () => this.#availableQuantity;
    getPrice = () => this.#price;
    getTestDescriptors = () => this.#testDescriptors;

    // setters
    setDescription = (description) => this.#description = description;
    setWeight = (weight) => this.#weight = weight;
    setVolume = (volume) => this.#volume = volume;
    setNotes = (notes) => this.#notes = notes;
    setPosition = (position) => this.#position = position;
    setAvailableQuantity = (availableQuantity) => this.#availableQuantity = availableQuantity;
    setPrice = (price) => this.#price = price;
    setTestDescriptors = (testDescriptors) => this.#testDescriptors.push(testDescriptors);

    // toJSON
    toJSON = () => ({
        id: this.getId(),
        description: this.getDescription(),
        weight: this.getWeight(),
        volume: this.getVolume(),
        notes: this.getNotes(),
        position: this.getPosition(),
        availableQuantity: this.getAvailableQuantity(),
        price: this.getPrice(),
        testDescriptors: this.getTestDescriptors()
    });
}

module.exports = Sku;