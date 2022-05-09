class Item {
    #id;
    #description;
    #price;
    #skuId;
    #supplierId;

    constructor(id, description, price, skuId, supplierId) {
        this.#id = id;
        this.#description = description;
        this.#price = price;
        this.#skuId = skuId;
        this.#supplierId = supplierId;
    }

    getId = () => this.#id;
    getDescription = () => this.#description;
    getPrice = () => this.#price;
    getSkuId = () => this.#skuId;
    getSupplierId = () => this.#supplierId;

    setDescription = (description) => this.#description = description;
    setPrice = (price) => this.#price = price;
    setSkuId = (skuId) => this.#skuId = skuId;

    toJSON = () => ({
        id: this.getId(),
        description: this.getDescription(),
        price: this.getPrice(),
        skuId: this.getSkuId(),
        supplierId: this.getSupplierId()
    });
}

module.exports = Item;