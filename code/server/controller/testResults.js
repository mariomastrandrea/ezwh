const TestResult = require('../models/testResult');
const DbManager = require('../db/dbManager2');
const Joi = require('joi');

const DbManagerInstance = new DbManager();

async function getTestResultsBySkuItem(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        //404 no sku for rfid

        const tr = await DbManagerInstance.getAllTestResultsBySkuIem(req.params.rfid);
        const testResults = [];
        for (let t of tr) {
            testResults.push({
                id: t.getId(),
                idTestDescriptor: t.getTestDescriptorId(),
                Date: t.getDate(),
                Result: t.getResult()
            })
        }
        return res.status(200).send(testResults);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

async function getTestResult(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        //404 no sku for rfid

        const tr = await DbManagerInstance.getTestResult(req.params.id, req.params.rfid);
        if (!tr) {
            return res.status(404).send('Test result id not found for rfid');
        }

        return res.status(200).send({
            id: tr.getId(),
            idTestDescriptor: tr.getTestDescriptorId(),
            Date: tr.getDate(),
            Result: tr.getResult()
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

async function createTestResult(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        const schema = Joi.object({
            rfid: Joi.string().required(),
            idTestDescriptor: Joi.number().integer().required(),
            Date: Joi.date().required(),
            Result: Joi.boolean().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Invalid request body')
        }

        //404 no sku

        const td = await DbManagerInstance.getTestDescriptor(parseInt(req.body.idTestDescriptor));
        if (!td)
            return req.status(404).send('Test descriptor not found');

        const tr = await DbManagerInstance.storeTestResult(new TestResult(null, req.body.rfid, parseInt(req.body.idTestDescriptor), req.body.Date, req.body.Result));
        if (!tr)
            return res.status(500).send('Could not store test descriptor');

        return res.status(201).send('Created');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function updateTestResult(req, res) {
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

        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const td = await DbManagerInstance.getTestDescriptor(parseInt(req.body.newIdTestDescriptor));
        if (!td)
            return res.status(404).send('Test descriptor not found');

        const tr = await DbManagerInstance.getTestResult(parseInt(req.params.id), req.params.rfid);
        if (!tr)
            return res.status(404).send('Test result not found for rfid');
        //404 no sku

        const count = await DbManagerInstance.updateTestResult(new TestResult(parseInt(req.params.id), req.params.rfid, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult));
        if (count === 0)
            return res.status(500).send('Could not update test result');

        return res.status(200).send('Ok');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function deleteTestResult(req, res) {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {

        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Invalid rfid')
        }

        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Invalid test result id')
        }

        const count = await DbManagerInstance.deleteTestResult(parseInt(req.params.id), req.params.rfid);
        if (count === 0)
            return res.status(500).send('Could not delete test result');

        return res.status(200).send('Deleted tested result');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

module.exports = {
    getTestResultsBySkuItem,
    getTestResult,
    createTestResult,
    updateTestResult,
    deleteTestResult
};