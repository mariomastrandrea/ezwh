class TestResult{

    #id;
    #rfid;
    #testDescriptorId;
    #date;
    #result;

    constructor(id,rfid,testDescriptorId,date,result){
        this.#id=id;
        this.#rfid=rfid;
        this.#testDescriptorId=testDescriptorId;
        this.#date=date;
        this.#result=result;
    }

    getId = () => this.#id;
    getRfid = () => this.#rfid;
    getTestDescriptorId = () => this.#testDescriptorId;
    getDate = () => this.#date;
    getResult = () => this.#result;

    setTestDescriptorId = (testDescriptorId) => this.#testDescriptorId=testDescriptorId;
    setDate = (date) => this.#date=date;
    setResult = (result) => this.#result=result;

    toJSON = () => ({
        id:this.getId(),
        rfid:this.getRfid(),
        testDescriptorId:this.getTestDescriptorId(),
        date:this.getDate(),
        result:this.getResult()
    });
}

module.exports = TestResult;