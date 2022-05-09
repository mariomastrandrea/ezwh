class RestockOrder {
    // variables
    #id;
    #issueDate;
    #state;
    #products;
    #supplierId;
    #transportNote;
    #skuItems;
    // constructor
    constructor(issueDate, products, supplierId, transportNote = "", id = null, skuItems = [], state = 'ISSUED') {
        this.#id = id;
        this.#issueDate = issueDate;
        this.#products = products;
        this.#supplierId = supplierId;
        this.#transportNote = transportNote;
        this.#skuItems = skuItems;
        this.#state = state;
    };
    // getters
    getId = () => this.#id;
    getIssueDate = () => this.#issueDate;
    getState = () => this.#state;
    getProducts = () => this.#products;
    getSupplierId = () => this.#supplierId;
    getTransportNote = () => this.#transportNote;
    getSkuItems = () => {
        let array = [];
        array.push(...this.#skuItems);
        return array;
    };
    // setters
    setState = (state) => this.#state = state;
    setTransportNote = (transportNote) => this.#transportNote = transportNote;
    setSkuItems = (skuItems) => {
        let array = [];
        array.push(...this.#skuItems, ...skuItems);
        this.#skuItems = array;
    };

    toDatabase = () => ({
        id: this.getId(),
        issueDate: this.getIssueDate(),
        state: this.getState(),
        products: this.getProducts(),
        supplierId: this.getSupplierId(),
        transportNote: this.getTransportNote(),
        skuItems: this.getSkuItems()
    });

    toJSON = function () {
        let map = [];
        map.push({
            id: this.getId(),
            issueDate: this.getIssueDate(),
            state: this.getState(),
            products: this.getProducts(),
            supplierId: this.getSupplierId(),
        });
        if (this.getState() !== 'ISSUED') {
            map.push({
                transportNote: this.getTransportNote(),
            });
        }
        if (this.getState() === 'DELIVERY' || this.getState() === 'ISSUED') {
            map.push({
                skuItems: []
            });
        } else {
            map.push({
                skuItems: this.getSkuItems()
            })
        };
        return map;
    }



}

module.exports = RestockOrder;