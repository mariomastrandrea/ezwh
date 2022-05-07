class SkuItem {
    #rfid;
    #skuId;
    #available;
    #dateOfStock;
    #testResults;

    constructor(rfid, skuId, dateOfStock, available=0, testResults=[] ) {
        this.#rfid = rfid;
        this.#skuId = skuId;
        this.#available = available;
        this.#dateOfStock = dateOfStock;
        this.#testResults = testResults;
    }

    // getters
    getRfid = () => this.#rfid;
    getSkuId = () => this.#skuId;
    getAvailable = () => this.#available;
    getDateOfStock = () => this.#dateOfStock;
    getTestResults = () => this.#testResults;

    // setters
    setRfid = (rfid) => this.#rfid = rfid;
    setAvailable = (available) => this.#available == 1 ? this.#available = 0 : this.#available = 1;
    setDateOfStock = (dateOfStock) => this.#dateOfStock = dateOfStock;
    setTestResults = (testResults) => this.#testResults.push(testResults);


    // toJSON
    toJSON = () => ({
        RFID: this.getRfid(),
        SKUId: this.getSkuId(),
        Available: this.getAvailable(),
        DateOfStock: this.getDateOfStock(),
    });
}

module.exports = SkuItem;