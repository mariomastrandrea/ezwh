const dayjs = require('dayjs');

class TestResult {
    #id;
    #rfid;
    #testDescriptorId;
    #date;
    #result;

    constructor(id, rfid, testDescriptorId, date, result) {
        this.#id = id;
        this.#rfid = rfid;
        this.#testDescriptorId = testDescriptorId;
        this.#date = dayjs(date).format('YYYY/MM/DD');
        this.#result = result;
    }

    // getters
    getId = () => this.#id;
    getRfid = () => this.#rfid;
    getTestDescriptorId = () => this.#testDescriptorId;
    getDate = () => this.#date;
    getResult = () => this.#result;

    // setters
    setTestDescriptorId = (testDescriptorId) => this.#testDescriptorId = testDescriptorId;
    setDate = (date) => this.#date = dayjs(date).format('YYYY/MM/DD');
    setResult = (result) => this.#result = result;

    // to serialize object in JSON format
    toJSON = () => ({
        id: this.getId(),
        //rfid: this.getRfid(),
        idTestDescriptor: this.getTestDescriptorId(),
        Date: this.getDate(),
        Result: this.getResult()
    });
}

module.exports = TestResult;