class InternalOrder {
    #id;
    #issueDate;
    #state;
    #products;
    #customerId;
    
    constructor(issueDate, products, customerId, state = 'ISSUED', id = null) {
        this.#id = id;
        this.#issueDate = issueDate;
        this.#state = state;
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
    setSkuItems = (skuItems) => {
        let products = [];

        this.#products.forEach(product => {
            skuItems.filter(skuItem => skuItem.SKUId === product.SKUId)
                    .forEach(skuItem => {
                        products.push({
                            SKUId: product.SKUId, 
                            description: product.description, 
                            price: product.price, 
                            RFID: skuItem.RFID
                    });
            })
        });
        
        this.#products = products;
    };

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