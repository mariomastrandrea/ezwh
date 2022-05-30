class ReturnOrder {
    #id;
    #returnDate;
    #products;
    #restockOrderId;

    // constructor
    constructor(returnDate, products, restockOrderId, id = null) {
        this.#id = id;
        this.#returnDate = returnDate;
        this.#products = products;
        this.#restockOrderId = restockOrderId;
    }

    // getters
    getId = () => this.#id;
    getReturnDate = () => this.#returnDate;
    getProducts = () => this.#products;
    getRestockOrderId = () => this.#restockOrderId;

    // setters
    setProducts = (products) => this.#products = products;
    
    // to serialize object in JSON format
    toJSON = () => ({
        id: this.getId(),
        returnDate: this.getReturnDate(),
        products: this.getProducts(),
        restockOrderId: this.getRestockOrderId()
    });
}

module.exports = ReturnOrder;