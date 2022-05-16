const TestDescriptor = require("../models/testDescriptor");
const { OK, CREATED } = require("../statusCodes");
const { int } = require("../utilities");

class TestDescriptorService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/testDescriptors 
    async getAllTestDescriptors() {
        const result = await this.#dao.getAllTestDescriptors().catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");

        return OK(result);
    };

    // GET /api/testDescriptors/:id
    async getTestDescriptor(id) {
        id = int(id);
        const result = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return INTERNAL_SERVER_ERROR("ErrorDB");

        if(!result)
            return NOT_FOUND("Test descriptor not found");
        
        return OK(result);
    };

    // POST /api/testDescriptor 
    async createTestDescriptor(name, procedureDescription, idSKU){
        const sku = await this.#dao.getSkuById(idSKU).catch(err => "ErrorDB");

        if (sku === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");

        if(!sku)
            return NOT_FOUND("Sku not found");

        const result = await this.#dao.storeTestDescriptor(
            new TestDescriptor(null, name, procedureDescription, idSKU)).catch(err => "ErrorDB");

        if (result === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return CREATED();
    };

    // PUT /api/testDescriptor/:id 
    async updateTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
        id = int(id);
        const testdesc = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

        if(testdesc === 'ErrorDB')
            return SERVICE_UNAVAILABLE("Error DB");

        if(!testdesc)
            return NOT_FOUND("Test descriptor not found");

        const sku = await this.#dao.getSkuById(newIdSKU).catch(err => "ErrorDB");

        if (sku === "ErrorDB") 
            return SERVICE_UNAVAILABLE("Error DB");

        if(!sku)
            return NOT_FOUND("Sku not found");

        const result = await this.#dao.updateTestDescriptor(
            new TestDescriptor(id, newName, newProcedureDescription, newIdSKU)).catch(err => "ErrorDB");

        if (result === "ErrorDB" || !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return OK();
    };

    // DELETE /api/testDescriptor/:id 
    async deleteTestDescriptor(id){
        id = int(id);
        const testdesc = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

        if(testdesc === 'ErrorDB')
            return SERVICE_UNAVAILABLE("Error DB");

        if(!testdesc)
            return UNPROCESSABLE_ENTITY("Test descriptor not found");s

        const result = await this.#dao.deleteTestDescriptor(id).catch(err => "ErrorDB");

        if (result === "ErrorDB" || !result) 
            return SERVICE_UNAVAILABLE("Error DB");
        
        return NO_CONTENT();
    }
}

module.exports = TestDescriptorService;