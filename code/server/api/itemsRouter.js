const express = require('express');
const router = express.Router();

// validation
const { isInt } = require("../utilities");
const Joi = require('joi').extend(require('@joi/date'));

// DbManager / DAO
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();

// import Services classes and inject dao

const SkusService = require("../services/skusService");
const skusService = new SkusService(dao);

const SkuItemsService = require("../services/skuItemsService");
const skuItemsService = new SkuItemsService(dao);

const ItemsService = require("../services/itemsService");
const itemsService = new ItemsService(dao);

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


/**
 * SkuItem
 */

router.get('/skuitems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await skuItemsService.getAllSkuItems();

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

        if (Joi.number().integer().required().validate(skuId).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { error, code, obj } = await skuItemsService.getAvailableSkuItemsOf(skuId);

        if(error) {
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

        const { error, code, obj } = await skuItemsService.getSkuItem(rfid);

        if(error) {
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
            SKUId: Joi.number().required(),
            DateOfStock: Joi.date().required()
                    .format(["YYYY/MM/DD", "YYYY/MM/DD HH:mm"]) // permits either YYYY/MM/DD format and YYYY/MM/DD HH:mm format
                    .allow(null)
        });

        const result = schema.validate(req.body);

        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const { RFID, SKUId, DateOfStock } = req.body;
        const { error, code } = await skuItemsService.createSkuItem(RFID, SKUId, DateOfStock);

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
            await skuItemsService.updateSkuItem(rfid, newRFID, newAvailable, newDateOfStock);

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

        const { error, code } = await skuItemsService.deleteSkuItem(rfid);

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

////////////////////////////////////////////////////////////////
// TODO: implement all APIs below

router.get('/items', async (req, res) => {

});

router.get('/items/:id', async (req, res) => {
    
});

router.post('/item', async (req, res) => {
    
});

router.put('/item/:id', async (req, res) => {
    
});

router.delete('/items/:id', async (req, res) => {
    
});

// module export
module.exports = router;