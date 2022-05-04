class InternalOrder{
    // variables
    #id;
    #issueDate;
    #state = 'ISSUED';
    #products;
    #customerId;
    constructor(id, issueDate, products, customerId) {
        this.#id = id;
        this.#issueDate = issueDate;
        this.#products = products;
        this.#customerId = customerId;
    }

    // getters
    getId = () => this.#id;
    getIssueDate = () => this.#issueDate;
    getState = () => this.#state;
    getProducts = () => this.#products;
    getCustomerId = () => this.#customerId;
    
    // setters
    setState = (state) => this.#state = state;
    setProducts = (products) => this.#products = products;

    // toJSON
    toJSON = () => ({
        id: this.getId(),
        issueDate: this.getIssueDate(),
        state: this.getState(),
        products: this.getProducts(),
        customerId: this.getCustomerId()
    });
}

module.exports = InternalOrder;