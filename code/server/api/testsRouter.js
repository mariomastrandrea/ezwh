const express = require('express');
const router = express.Router();

// validation
const Joi = require('joi').extend(require('@joi/date'));
const { isInt } = require("../utilities");

// DbManager / DAO
const DbManager = require('../db/dbManager');
const dao = DbManager();

// import Services and inject dao

const TestDescriptorService = require("../services/testDescriptorService");
const testDescriptorService = new TestDescriptorService(dao);

const TestResultService = require("../services/testResultService");
const testResultService = new TestResultService(dao);

//#region TestDescriptor

// GET /api/testDescriptors - getAllTestDescriptors
router.get('/testDescriptors', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        const { code, obj, error } = await testDescriptorService.getAllTestDescriptors();

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// GET /api/testDescriptors/:id - getTestDescriptor
router.get('/testDescriptors/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().min(1).required().validate(id).error) {
            return res.status(422).send('Invalid test descriptor id')
        }

        const { code, obj, error } = await testDescriptorService.getTestDescriptor(id);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// POST /api/testDescriptor - createTestDescriptor
router.post('/testDescriptor', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate request body
        const schema = Joi.object({
            name: Joi.string().required(),
            procedureDescription: Joi.string().required(),
            idSKU: Joi.number().integer().min(1).required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { name, procedureDescription, idSKU } = req.body;
        const { code, error } = 
            await testDescriptorService.createTestDescriptor(name, procedureDescription, idSKU);

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

// PUT /api/testDescriptor/:id - updateTestDescriptor
router.put('/testDescriptor/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().required().validate(id).error)
            return res.status(422).send('Invalid test descriptor id')

        // validate request body 
        const schema = Joi.object({
            newName: Joi.string().required(),
            newProcedureDescription: Joi.string().required(),
            newIdSKU: Joi.number().integer().min(1).required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { newName, newProcedureDescription, newIdSKU } = req.body;
        const { code, error } = 
            await testDescriptorService.updateTestDescriptor(id, newName, newProcedureDescription, newIdSKU);

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

// DELETE /api/testDescriptor/:id - deleteTestDescriptor
router.delete('/testDescriptor/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {   
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().min(1).required().validate(id).error)
            return res.status(422).send('Invalid test descriptor id')

        const { code, error } = 
            await testDescriptorService.deleteTestDescriptor(id);

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

// GET /api/skuitems/:rfid/testResults - getTestResultsBySkuItem
router.get('/skuitems/:rfid/testResults', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // check URL parameter
        const { rfid } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error
            || !isInt(rfid)) {
            return res.status(422).send('Invalid rfid')
        }

        const { code, obj, error } = await testResultService.getTestResultsBySkuItem(rfid);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// GET /api/skuitems/:rfid/testResults/:id - getTestResult
router.get('/skuitems/:rfid/testResults/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate URL parameters
        const { rfid, id } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error || !isInt(rfid)) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().min(1).required().validate(id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const { code, obj, error } = await testResultService.getTestResult(id, rfid);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

// POST /api/skuitems/testResult - createTestResult
router.post('/skuitems/testResult', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {   
        // validate request body
        const schema = Joi.object({
            rfid: Joi.string().min(32).max(32).required(),
            idTestDescriptor: Joi.number().integer().required(),
            Date: Joi.date().required().format("YYYY/MM/DD"), // permits only YYYY/MM/DD date format
            Result: Joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { rfid, idTestDescriptor, Date, Result } = req.body;

        if(!isInt(rfid)) 
            return res.status(422).send("Invalid rfid");

        const { code, error } = await testResultService.createTestResult(rfid, idTestDescriptor, Date, Result);

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

// PUT /api/skuitems/:rfid/testResult/:id - updateTestResult
router.put('/skuitems/:rfid/testResult/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate URL parameters
        const { rfid, id } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error || !isInt(rfid)) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().min(1).required().validate(id).error) {
            return res.status(422).send('Invalid test result id')
        }

        // validate request body
        const schema = Joi.object({
            newIdTestDescriptor: Joi.number().integer().min(1).required(),
            newDate: Joi.date().required().format("YYYY/MM/DD"), // permits only YYYY/MM/DD date format
            newResult: Joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        const { newIdTestDescriptor, newDate, newResult } = req.body;
        const { code, error } = 
            await testResultService.updateTestResult(id, rfid, newIdTestDescriptor, newDate, newResult);

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

// DELETE /api/skuitems/:rfid/testResult/:id - deleteTestResult
router.delete('/skuitems/:rfid/testResult/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try 
    {
        // validate URL parameters
        const { rfid, id } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error || !isInt(rfid)) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().min(1).required().validate(id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const { code, error } = await testResultService.deleteTestResult(id, rfid);

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