class RestockOrder{
    #restockOrderStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];
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
    getTransportNote = () => this.#transportNote;
    getSkuItems = () => this.#skuItems;
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