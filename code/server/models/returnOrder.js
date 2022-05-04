class ReturnOrder{
    // variables
    #id;
    #returnDate;
    #products;
    #restockOrderId;

    // constructor
    constructor(id, returnDate, products, restockOrderId){
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

    // toJSON
    toJSON = () => ({
        id: this.getId(),
        returnDate: this.getReturnDate(),
        products: this.getProducts(),
        restockOrderId: this.getRestockOrderId()
    });
}