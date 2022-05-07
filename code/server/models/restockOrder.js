class RestockOrder{
// variables
    #id;
    #issueDate;
    #state = 'ISSUED';
    #products;
    #supplierId;
    #transportNote;
    #skuItems;
    // constructor
    constructor(id, issueDate, products, supplierId, transportNote){
        this.#id = id;
        this.#issueDate = issueDate;
        this.#products = products;
        this.#supplierId = supplierId;
        this.#transportNote = transportNote;
        this.#skuItems = [];
    };
    // getters
    getId = () => this.#id;
    getIssueDate = () => this.#issueDate;
    getState = () => this.#state;
    getProducts = () => this.#products;
    getSupplierId = () => this.#supplierId;
    getTransportNote = () => this.getState() === 'ISSUED' ? null : this.#transportNote;
    getSkuItems = function() {
        if(this.getState() === 'ISSUED' || this.getState() === 'DELIVERY'){
            return [];
        }
        return this.#skuItems;
    };
    // setters
    setState = (state) => this.#state = state;
    setTransportNote = (transportNote) => this.#transportNote = transportNote;
    setSkuItems = (skuItems) => this.#skuItems.push(skuItems);
    // toJSON
    toJSON = () => ({
        id: this.getId(),
        issueDate: this.getIssueDate(),
        state: this.getState(),
        products: this.getProducts(),
        supplierId: this.getSupplierId(),
        transportNote: this.getTransportNote(),
        skuItems: this.getSkuItems()
    });
}

module.exports = RestockOrder;