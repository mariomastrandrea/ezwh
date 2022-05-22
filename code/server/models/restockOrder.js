
class RestockOrder {
    #id;
    #issueDate;
    #state;
    #products;
    #supplierId;
    #transportNote;
    #skuItems;

    constructor(issueDate, products, supplierId, transportNote = "", id = null, skuItems = [], state = 'ISSUED') {
        this.#id = id;
        this.#issueDate = issueDate;
        this.#products = products;
        this.#supplierId = supplierId;
        if (typeof transportNote === 'string') {
            this.transportNote = { deliveryDate: transportNote.split(' ')[1] };
        } else {
            this.transportNote = transportNote;
        }
        this.#skuItems = skuItems;
        this.#state = state;
    };

    // getters
    getId = () => this.#id;
    getIssueDate = () => this.#issueDate;
    getState = () => this.#state;
    getProducts = () => this.#products;
    getSupplierId = () => this.#supplierId;
    getTransportNote = () => this.transportNote;
    getTransportNoteString = () => {
        if (this.transportNote.deliveryDate) {
            return `deliveryDate: ${this.transportNote.deliveryDate}`;
        }
    };
    getSkuItems = () => [this.#skuItems];

    // setters
    setState = (state) => this.#state = state;
    setTransportNote = (transportNote) => this.transportNote = transportNote;
    setProducts = (products) => this.#products = products;
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
        let map = {
            id: this.getId(),
            issueDate: this.getIssueDate(),
            state: this.getState(),
            products: this.getProducts(),
            supplierId: this.getSupplierId(),
        };
        if (this.getState() !== 'ISSUED') {
            map["transportNote"] = this.getTransportNote();
        }
        if (this.getState() === 'DELIVERY' || this.getState() === 'ISSUED') {
            map["skuItems"] = []

        } else {
            map["skuItems"] = this.getSkuItems()

        };
        return map;
    }



}

module.exports = RestockOrder;