const express = require('express');
const router = express.Router();

// validation
const { isInt } = require("../utilities");
const Joi = require('joi');

// DbManager / DAO
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();

// import Services classes and inject dao
const SkusService = require("../services/skusService");
const skusService = new SkusService(dao);

/**
 * Sku
 */

router.get('/skus', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await skusService.getAllSkus();

        if (error) {
            return res.status(code).send(error);
        }

        const allSkus = obj;
        return res.status(code).json(allSkus);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/skus/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code, obj } = await skusService.getSkuById(id);

        if (error) {
            return res.status(code).send(error);
        }

        const sku = obj;
        return res.status(code).json(sku);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/sku', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate request body
        const schema = Joi.object({
            description: Joi.string().required(),
            weight: Joi.number().required(),
            volume: Joi.number().required(),
            notes: Joi.string().required(),
            price: Joi.number().required(),
            availableQuantity: Joi.number().integer().required()
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { description, weight, volume, notes, price, availableQuantity } = req.body;
        const { error, code } =
            await skusService.createSku(description, weight, volume, notes, price, availableQuantity);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).end(); s
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.put('/sku/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
        const schema = Joi.object({
            newDescription: Joi.string().required(),
            newWeight: Joi.number().required(),
            newVolume: Joi.number().required(),
            newNotes: Joi.string().required(),
            newPrice: Joi.number().required(),
            newAvailableQuantity: Joi.number().integer()    // not required
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity } = req.body;

        const { error, code } = await skusService.updateSku(id,
            newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.put('/sku/:id/position', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const skuId = req.params.id;

        if (Joi.number().integer().required().validate(skuId).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
        const newPositionId = req.body.position;

        if (Joi.string().min(12).max(12).required().validate(newPositionId).error
            || !isInt(newPositionId)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code } = await skusService.updateSkuPosition(skuId, newPositionId);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    };
});

router.delete('/skus/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code } = await skusService.deleteSku(id);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

////////////////////////////////////////////////////////////////

/**
 * SkuItem
 */

const {
    getAllSkuItems,
    getAvailableSkuItems,
    getSkuItem,
    createSkuItem,
    updateSkuItem,
    deleteSkuItem
} = require('../controller/skuItems');

router.get('/skuitems', getAllSkuItems);
router.get('/skuitems/sku/:id', getAvailableSkuItems);
router.get('/skuitems/:rfid', getSkuItem);
router.post('/skuitem', createSkuItem);
router.put('/skuitems/:rfid', updateSkuItem);
router.delete('/skuitems/:rfid', deleteSkuItem);

/**
 * Item
 */

const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controller/items');

router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/item', createItem);
router.put('/item/:id', updateItem);
router.delete('/items/:id', deleteItem);

// module export
module.exports = router;