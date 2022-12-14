const express = require('express');
const router = express.Router();

// validation
const { isInt } = require("../utilities");
const Joi = require('joi').extend(require('@joi/date'));

// DbManager / DAO
const DbManagerFactory = require('../db/dbManager');
const dao = DbManagerFactory();

// import Services classes and inject dao

const SkuService = require("../services/skuService");
const skuService = new SkuService(dao);

const SkuItemService = require("../services/skuItemService");
const skuItemService = new SkuItemService(dao);

const ItemService = require("../services/itemService");
const itemService = new ItemService(dao);

/**
 * Sku
 */

router.get('/skus', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await skuService.getAllSkus();

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

        if (Joi.number().integer().min(1).required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code, obj } = await skuService.getSkuById(id);

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
            weight: Joi.number().min(0).required(),
            volume: Joi.number().min(0).required(),
            notes: Joi.string().min(1).required(),
            price: Joi.number().min(0).required(),
            availableQuantity: Joi.number().integer().min(0).required()
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { description, weight, volume, notes, price, availableQuantity } = req.body;
        const { error, code } =
            await skuService.createSku(description, weight, volume, notes, price, availableQuantity);

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

router.put('/sku/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id } = req.params;

        if (Joi.number().integer().min(0).required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
        const schema = Joi.object({
            newDescription: Joi.string().required(),
            newWeight: Joi.number().min(0).required(),
            newVolume: Joi.number().min(0).required(),
            newNotes: Joi.string().required(),
            newPrice: Joi.number().min(0).required(),
            newAvailableQuantity: Joi.number().integer().min(0)    // not required
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity } = req.body;

        const { error, code } = await skuService.updateSku(id,
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

        if (Joi.number().integer().min(0).required().validate(skuId).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
        const newPositionId = req.body.position;

        if (Joi.string().min(12).max(12).required().validate(newPositionId).error
            || !isInt(newPositionId)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code } = await skuService.updateSkuPosition(skuId, newPositionId);

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

        // modified min 1 to 0 due to failed acceptance tests   
        if (Joi.number().integer().min(0).required().validate(id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code } = await skuService.deleteSku(id);

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


/**
 * SkuItem
 */

router.get('/skuitems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await skuItemService.getAllSkuItems();

        if (error) {
            return res.status(code).send(error);
        }

        const allSkuItems = obj;
        return res.status(code).json(allSkuItems);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/skuitems/sku/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const skuId = req.params.id;

        if (Joi.number().integer().min(1).required().validate(skuId).error)
            return res.status(422).send('Unprocessable Entity');

        const { error, code, obj } = await skuItemService.getAvailableSkuItemsOf(skuId);

        if (error) {
            return res.status(code).send(error);
        }

        const availableSkuItems = obj;
        return res.status(code).json(availableSkuItems);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/skuitems/:rfid', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { rfid } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error
            || !isInt(rfid)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code, obj } = await skuItemService.getSkuItem(rfid);

        if (error) {
            return res.status(code).send(error);
        }

        const skuItem = obj;
        return res.status(code).json(skuItem);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/skuitem', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate response body
        const schema = Joi.object({
            RFID: Joi.string().min(32).max(32).required(),
            SKUId: Joi.number().min(0).required(),
            DateOfStock: Joi.date().required()
                .format(["YYYY/MM/DD", "YYYY/MM/DD HH:mm"]) // permits either YYYY/MM/DD format and YYYY/MM/DD HH:mm format
                .allow(null)
        });

        const result = schema.validate(req.body);

        if (result.error || !isInt(req.body.RFID)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { RFID, SKUId, DateOfStock } = req.body;
        const { error, code } = await skuItemService.createSkuItem(RFID, SKUId, DateOfStock);

        return error ?
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.put('/skuitems/:rfid', async (req, res) => {
    // TODO: add login check 
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { rfid } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error
            || !isInt(rfid)) {
            return res.status(422).send('Unprocessable Entity');
        }

        // validate request body
        const schema = Joi.object({
            newRFID: Joi.string().min(32).max(32).required(),
            newAvailable: Joi.number().integer().valid(0, 1).required(),
            newDateOfStock: Joi.date().required()
                .format(["YYYY/MM/DD", "YYYY/MM/DD HH:mm"]) // permits either YYYY/MM/DD format and YYYY/MM/DD HH:mm format
                .allow(null)
        })

        const result = schema.validate(req.body);

        if (result.error || !isInt(req.body.newRFID)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { newRFID, newAvailable, newDateOfStock } = req.body;
        const { error, code } =
            await skuItemService.updateSkuItem(rfid, newRFID, newAvailable, newDateOfStock);

        return error ?
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.delete('/skuitems/:rfid', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { rfid } = req.params;

        if (Joi.string().min(32).max(32).required().validate(rfid).error
            || !isInt(rfid)) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code } = await skuItemService.deleteSkuItem(rfid);

        return error ?
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

/**
 * Item
 */

router.get('/items', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await itemService.getAllItems();

        if (error) {
            return res.status(code).send(error);
        }

        const allItems = obj;
        return res.status(code).json(allItems);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/items/:id/:supplierId', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id, supplierId } = req.params;

        if (Joi.number().integer().min(0).required().validate(id).error ||
            Joi.number().integer().min(0).required().validate(supplierId).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await itemService.getItemById(id, supplierId);

        if (error)
            return res.status(code).send(error);

        const item = obj;
        return res.status(code).json(item);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/item', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate request body
        const schema = Joi.object({
            id: Joi.number().integer().min(0).required(),
            description: Joi.string().required(),
            price: Joi.number().min(0).required(),
            SKUId: Joi.number().integer().min(0).required(),
            supplierId: Joi.number().integer().min(0).required()
        });

        const result = schema.validate(req.body);

        if (result.error)
            return res.status(422).send('Unprocessable Entity')

        const { id, description, price, SKUId, supplierId } = req.body;

        const { error, code } =
            await itemService.createItem(id, description, price, SKUId, supplierId);

        if (error)
            return res.status(code).send(error);

        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.put('/item/:id/:supplierId', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id, supplierId } = req.params;

        if (Joi.number().integer().min(0).required().validate(id).error ||
            Joi.number().integer().min(0).required().validate(supplierId).error)
            return res.status(422).send('Unprocessable entity');

        const schema = Joi.object({
            newDescription: Joi.string().required(),
            newPrice: Joi.number().min(0).required()
        });

        const result = schema.validate(req.body);

        if (result.error)
            return res.status(422).send('Unprocessable Entity')

        const { newDescription, newPrice } = req.body;
        const { error, code } = await itemService.updateItem(id, supplierId, newDescription, newPrice);

        return error ?
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

router.delete('/items/:id/:supplierId', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate URL parameter
        const { id, supplierId } = req.params;

        if (Joi.number().integer().min(0).required().validate(id).error ||
            Joi.number().integer().min(0).required().validate(supplierId).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code } = await itemService.deleteItem(id, supplierId);

        return error ?
            res.status(code).send(error) :
            res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

// module export
module.exports = router;