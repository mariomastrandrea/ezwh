const express = require('express');
const router = express.Router();

// validation
const Joi = require('joi');

// DbManager / DAO
const DbManager = require('../db/dbManager');
const dao = new DbManager();

// import Services and inject dao

const TestDescriptorService = require("../services/testDescriptorService");
const testDescriptorService = new TestDescriptorService(dao);

const TestResultService = require("../services/testResultService");
const testResultService = new TestResultService(dao);

//#region TestDescriptor

//GET /api/testDescriptors - getAllTestDescriptors
router.get('/testDescriptors', async function (req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { code, object, error } = await testDescriptorService.getAllTestDescriptors();

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(object);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

//GET /api/testDescriptors/:id - getTestDescriptor
router.get('/testDescriptors/:id', async function (req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test descriptor id')
        }

        const { code, object, error } = await testDescriptorService.getTestDescriptor(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(object);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

//POST /api/testDescriptor - createTestDescriptor
router.post('/testDescriptor', async function (req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            procedureDescription: Joi.string().required(),
            idSKU: Joi.number().integer().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { code, error } = await testDescriptorService.createTestDescriptor(req.body.name, req.body.procedureDescription, parseInt(req.body.idSKU));

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }

});

//PUT /api/testDescriptor/:id - updateTestDescriptor
router.put('/testDescriptor/:id', async function (req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const schema = Joi.object({
            newName: Joi.string().required(),
            newProcedureDescription: Joi.string().required(),
            newIdSKU: Joi.number().integer().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Invalid test descriptor id')

        const { code, error } = await testDescriptorService.updateTestDescriptor(parseInt(req.params.id), req.body.newName, req.body.newProcedureDescription, parseInt(req.body.newIdSKU));

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }

});

//DELETE /api/testDescriptor/:id - deleteTestDescriptor
router.delete('/testDescriptor/:id', async function (req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Invalid test descriptor id')

            const { code, error } = await testDescriptorService.deleteTestDescriptor(parseInt(req.params.id));

            if (error) {
                return res.status(code).send(error);
            }
    
            return res.status(code).send();
    } 
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }

});

//#endregion

//#region TestResult

//GET /api/skuitems/:rfid/testResults - getTestResultsBySkuItem
router.get('/skuitems/:rfid/testResults', async function(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().min(32).max(32).required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        const { code, object, error } = await testResultService.getTestResultsBySkuItem(req.params.rfid);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(object);
    } 
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

});

//GET /api/skuitems/:rfid/testResults/:id - getTestResult
router.get('/skuitems/:rfid/testResults/:id', async function(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().min(32).max(32).required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const { code, object, error } = await testResultService.getTestResult(parseInt(req.params.id),req.params.rfid);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(object);
    } 
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});


//POST /api/skuitems/testResult - createTestResult
router.post('/skuitems/testResult', async function(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const schema = Joi.object({
            rfid: Joi.string().min(32).max(32).required(),
            idTestDescriptor: Joi.number().integer().required(),
            Date: Joi.date().required(),
            Result: Joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { code, error } = await testResultService.createTestResult(req.body.rfid, parseInt(req.body.idTestDescriptor), req.body.Date, req.body.Result);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    } 
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

//PUT /api/skuitems/:rfid/testResult/:id - updateTestResult
router.put('/skuitems/:rfid/testResult/:id', async function(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const schema = Joi.object({
            newIdTestDescriptor: Joi.number().integer().required(),
            newDate: Joi.date().required(),
            newResult: Joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        if (Joi.string().min(32).max(32).required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const { code, error } = await testResultService.updateTestResult(parseInt(req.params.id), req.params.rfid, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    } 
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

//DELETE /api/skuitems/:rfid/testResult/:id - deleteTestResult
router.delete('/skuitems/:rfid/testResult/:id', async function(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.string().min(32).max(32).required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const { code, error } = await testResultService.deleteTestResult(parseInt(req.params.id), req.params.rfid);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).send();
    } 
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

//#endregion

// module export
module.exports = router