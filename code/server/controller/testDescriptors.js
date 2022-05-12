const TestDescriptor = require('../models/testDescriptor');
const DbManager = require('../db/dbManager2');
const Joi = require('joi');

const DbManagerInstance = new DbManager();

async function getAllTestDescriptors(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const td = await DbManagerInstance.getAllTestDescriptors();
        return res.status(200).json(td);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getTestDescriptor(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Invalid test descriptor id')

        const td = await DbManagerInstance.getTestDescriptor(parseInt(req.params.id));
        if (!td)
            return res.status(404).send('Test descriptor not found');

        return res.status(200).json(td);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

async function createTestDescriptor(req, res) {

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

        //404 no sku

        const td = await DbManagerInstance.storeTestDescriptor(new TestDescriptor(null, req.body.name, req.body.procedureDescription, parseInt(req.body.idSKU)));
        if (!td)
            return res.status(500).send('Could not store test descriptor');

        return res.status(201).send('Created');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

async function updateTestDescriptor(req, res) {

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

        const td = await DbManagerInstance.getTestDescriptor(parseInt(req.params.id));
        if (!td)
            return res.status(404).send('Test descriptor not found');

        //404 no sku

        const count = await DbManagerInstance.updateTestDescriptor(new TestDescriptor(parseInt(req.params.id), req.body.newName, req.body.newProcedureDescription, parseInt(req.body.newIdSKU)));
        if (count === 0)
            return res.status(500).send('Could not update test descriptor');

        return res.status(200).send('Ok');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

async function deleteTestDescriptor(req, res) {

    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Invalid test descriptor id')

        const count = await DbManagerInstance.deleteTestDescriptor(parseInt(req.params.id));
        if (count === 0)
            return res.status(500).send('Could not delete test descriptor');

        return res.status(204).send('Deleted');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

module.exports = {
    getAllTestDescriptors,
    getTestDescriptor,
    createTestDescriptor,
    updateTestDescriptor,
    deleteTestDescriptor
};