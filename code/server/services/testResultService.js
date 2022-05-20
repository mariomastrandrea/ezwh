const TestResult = require("../models/testResult");
const { OK, CREATED, NO_CONTENT, UNAUTHORIZED, NOT_FOUND, CONFLICT, 
        UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE } = require("../statusCodes");
const { int } = require("../utilities");

class TestResultService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/skuitems/:rfid/testResults
    async getTestResultsBySkuItem(rfid){
        const skuitem = await this.#dao.getSkuItemByRfid(rfid);//.catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");
        
        if(!skuitem)
            return NOT_FOUND("Sku item not found");

        const result = await this.#dao.getAllTestResultsBySkuItem(rfid);//.catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");

        return OK(result);
    }

    // GET /api/skuitems/:rfid/testResults/:id 
    async getTestResult(id, rfid){
        id = int(id);
        const skuitem = await this.#dao.getSkuItemByRfid(rfid);//.catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");

        if(!skuitem)
            return NOT_FOUND("Sku item not found");

        const result = await this.#dao.getTestResult(id, rfid);//.catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");

        if(!result)
            return NOT_FOUND("Test result not found");
        
        return OK(result);
    }

    // POST /api/skuitems/testResult 
    async createTestResult(rfid, idTestDescriptor, date, testresult){
        // check sku item existence
        const skuitem = await this.#dao.getSkuItemByRfid(rfid);//.catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") 
            SERVICE_UNAVAILABLE("ErrorDB");

        if(!skuitem)
            return NOT_FOUND("Sku item not found");

        // check test descriptor existence
        const testdesc = await this.#dao.getTestDescriptor(idTestDescriptor);//.catch(err => "ErrorDB");

        if(testdesc === 'ErrorDB')
            return SERVICE_UNAVAILABLE("Error DB"); 

        if(!testdesc)
            return NOT_FOUND("Test descriptor not found");

        // check that test descriptor refers to the right sku
        if(testdesc.getSkuId() !== skuitem.getSkuId())
            return UNPROCESSABLE_ENTITY("Test descriptor does not correspond to sku");

        // * create test result *
        const result = await this.#dao.storeTestResult(
            new TestResult(null, rfid, idTestDescriptor, date, testresult));//.catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return CREATED();
    }

    // PUT /api/skuitems/:rfid/testResult/:id 
    async updateTestResult(id, rfid, newIdTestDescriptor, newDate, newTestresult){
        id = int(id);
        const testres = await this.#dao.getTestResult(id,rfid);//.catch(err => 'ErrorDB');

        if (testres === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");

        if(!testres)
            return NOT_FOUND("Test result not found for rfid");

        const skuitem = await this.#dao.getSkuItemByRfid(rfid);//.catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");

        if(!skuitem)
            return NOT_FOUND("Sku item not found");

        const testdesc = await this.#dao.getTestDescriptor(newIdTestDescriptor);//.catch(err => "ErrorDB");

        if(testdesc === 'ErrorDB')
            return SERVICE_UNAVAILABLE("Error DB");

        if(!testdesc)
            return NOT_FOUND("Test descriptor not found");

        if(testdesc.getSkuId() !== skuitem.getSkuId())
            return UNPROCESSABLE_ENTITY("Test descriptor does not correspond to sku");

        const result = await this.#dao.updateTestResult(
            new TestResult(id, rfid, newIdTestDescriptor, newDate, newTestresult));//.catch(err => "ErrorDB");

        if (result === "ErrorDB" || !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return OK();
    }

    // DELETE /api/skuitems/:rfid/testResult/:id  
    async deleteTestResult(id, rfid){
        id = int(id);
        const testres = await this.#dao.getTestResult(id, rfid);//.catch(err => 'ErrorDB');

        if (testres === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");

        if(!testres)
            return UNPROCESSABLE_ENTITY("Test result not found for rfid");

        const result = await this.#dao.deleteTestResult(id, rfid);//.catch(err => "ErrorDB");

        if (result === "ErrorDB" || !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return NO_CONTENT();
    }
}

module.exports = TestResultService;