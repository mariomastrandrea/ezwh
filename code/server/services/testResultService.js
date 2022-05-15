const TestResult = require("../models/testResult");

class TestResultService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    //GET /api/skuitems/:rfid/testResults
    async getTestResultsBySkuItem(rfid){
        const skuitem = await this.#dao.getSkuItem(rfid).catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if(!skuitem){
            return {
                code: 404,
                error: "Sku item not found"
            };
        }

        const result = await this.#dao.getAllTestResultsBySkuIem(rfid).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 200,
            object: result
        };
    }

    //GET /api/skuitems/:rfid/testResults/:id 
    async getTestResult(id,rfid){
        const skuitem = await this.#dao.getSkuItem(rfid).catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if(!skuitem){
            return {
                code: 404,
                error: "Sku item not found"
            };
        }

        const result = await this.#dao.getTestResult(id,rfid).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if(!result){
            return {
                code: 404,
                error: "Test result not found"
            };
        }
        
        return {
            code: 200,
            object: result
        };
    }

    //POST /api/skuitems/testResult 
    async createTestResult(rfid, idTestDescriptor, date, testresult){
        const skuitem = await this.#dao.getSkuItem(rfid).catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!skuitem){
            return {
                code: 404,
                error: "Sku item not found"
            };
        }

        const testdesc = await this.#dao.getTestDescriptor(idTestDescriptor).catch(err => "ErrorDB");

        if(testdesc === 'ErrorDb'){
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!testdesc){
            return {
                code: 404,
                error: "Test descriptor not found"
            };
        }

        if(testdesc.getSkuId() !== skuitem.getSkuId()){
            return {
                code: 422,
                error: "Test descriptor does not correspond to sku"
            };
        }

        const result = await this.#dao.storeTestResult(new TestResult(null, rfid, idTestDescriptor, date, testresult)).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 201
        };
    }

    //PUT /api/skuitems/:rfid/testResult/:id 
    async updateTestResult(id,rfid, newIdTestDescriptor, newDate, newTestresult){
        const testres = await this.#dao.getTestResult(id,rfid).catch(err => 'ErrorDB');
        if (testres === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!testres){
            return {
                code: 404,
                error: "Test result not found for rfid"
            };
        }

        const skuitem = await this.#dao.getSkuItem(rfid).catch(err => "ErrorDB");

        if (skuitem === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!skuitem){
            return {
                code: 404,
                error: "Sku item not found"
            };
        }

        const testdesc = await this.#dao.getTestDescriptor(newIdTestDescriptor).catch(err => "ErrorDB");

        if(testdesc === 'ErrorDb'){
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!testdesc){
            return {
                code: 404,
                error: "Test descriptor not found"
            };
        }

        if(testdesc.getSkuId() !== skuitem.getSkuId()){
            return {
                code: 422,
                error: "Test descriptor does not correspond to sku"
            };
        }

        const result = await this.#dao.updateTestResult(new TestResult(id, rfid, newIdTestDescriptor, newDate, newTestresult)).catch(err => "ErrorDB");

        if (result === "ErrorDB" || result === 0) {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 200
        };
    }

    //DELETE /api/skuitems/:rfid/testResult/:id  
    async deleteTestResult(id,rfid){
        const testres = await this.#dao.getTestResult(id,rfid).catch(err => 'ErrorDB');
        if (testres === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!testres){
            return {
                code: 422,
                error: "Test result not found for rfid"
            };
        }

        const result = await this.#dao.deleteTestResult(id,rfid).catch(err => "ErrorDB");

        if (result === "ErrorDB" || result === 0) {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 204,
        };
    }
}

module.exports = TestResultService;