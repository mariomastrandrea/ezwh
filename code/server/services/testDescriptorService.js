const TestDescriptor = require("../models/testDescriptor");

class TestDescriptorService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    //GET /api/testDescriptors 
    async getAllTestDescriptors() {
        const result = await this.#dao.getAllTestDescriptors().catch(err => "ErrorDB");

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
    };

    //GET /api/testDescriptors/:id
    async getTestDescriptor(id) {
        const result = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 500,
                error: "ErrorDB"
            };
        }

        if(!result){
            return {
                code: 404,
                error: "Test descriptor not found"
            };
        }
        
        return {
            code: 200,
            object: result
        };
    };

    //POST /api/testDescriptor 
    async createTestDescriptor(name,procedureDescription,idSKU){
        const sku = await this.#dao.getSku(idSKU).catch(err => "ErrorDB");

        if (sku === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!sku){
            return {
                code: 404,
                error: "Sku not found"
            };
        }

        const result = await this.#dao.storeTestDescriptor(new TestDescriptor(null,name,procedureDescription,idSKU)).catch(err => "ErrorDB");

        if (result === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 201
        };
    };

    //PUT /api/testDescriptor/:id 
    async updateTestDescriptor(id,newName,newProcedureDescription,newIdSKU){
        const testdesc = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

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

        const sku = await this.#dao.getSku(newIdSKU).catch(err => "ErrorDB");

        if (sku === "ErrorDB") {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!sku){
            return {
                code: 404,
                error: "Sku not found"
            };
        }

        const result = await this.#dao.updateTestDescriptor(new TestDescriptor(id,newName,newProcedureDescription,newIdSKU)).catch(err => "ErrorDB");

        if (result === "ErrorDB" || result === 0) {
            return {
                code: 503,
                error: "ErrorDB"
            };
        }
        
        return {
            code: 200,
        };
    };

    //DELETE /api/testDescriptor/:id 
    async deleteTestDescriptor(id){
        const testdesc = await this.#dao.getTestDescriptor(id).catch(err => "ErrorDB");

        if(testdesc === 'ErrorDb'){
            return {
                code: 503,
                error: "ErrorDB"
            };
        }

        if(!testdesc){
            return {
                code: 422,
                error: "Test descriptor not found"
            };
        }

        const result = await this.#dao.deleteTestDescriptor(id).catch(err => "ErrorDB");

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

module.exports = TestDescriptorService;