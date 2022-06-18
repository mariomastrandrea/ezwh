const express = require('express');
const router = express.Router();

//dayjs is a date library for javascript
const dayjs = require('dayjs');

// validation
const Joi = require('joi').extend(require('@joi/date'));

// DbManager / DAO
const DbManagerFactory = require('../db/dbManager');
const dao = DbManagerFactory();

// import Services classes and inject dao

const InternalOrderService = require("../services/internalOrderService");
const internalService = new InternalOrderService(dao);

const RestockOrderService = require("../services/restockOrderService");
const restockService = new RestockOrderService(dao);

const ReturnOrderService = require("../services/returnOrderService");
const returnService = new ReturnOrderService(dao);

// enums
const internalStates = ['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'];
const restockStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];
const restockUpdateType = { skuItems: 'skuItems', state: 'state', transportNote: 'transportNote' }

/** Internal Order
 * routes for internal order
 */
router.get('/internalOrders', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await internalService.getAllInternalOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/internalOrdersIssued', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await internalService.getIssuedInternalOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/internalOrdersAccepted', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await internalService.getAcceptedInternalOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await internalService.getInternalOrderById(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/internalOrders', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate body
        const productSchema = Joi.object({
            SKUId: Joi.number().integer().min(1).required(),
            description: Joi.string().required(),
            price: Joi.number().min(0).required(),
            qty: Joi.number().integer().min(0).required()
        })

        const schema = Joi.object({
            issueDate: Joi.date().required().format("YYYY/MM/DD HH:mm"),
            products: Joi.array().items(productSchema).required(),
            customerId: Joi.number().integer().min(1).required()
        });
        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } =
            await internalService.createInternalOrder(req.body.issueDate, req.body.products, req.body.customerId);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.put('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        // validate body
        const productSchema = Joi.object({
            SkuID: Joi.number().integer().required(),
            RFID: Joi.string().regex(/^[0-9]{32}$/).required()
        })

        const schema = Joi.object({
            newState: Joi.string().valid(...internalStates).required(),
            products: Joi.alternatives().conditional('newState', { is: 'COMPLETED', then: Joi.array().items(productSchema).required(), otherwise: Joi.optional() })
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        const { error, code, obj } = await internalService.updateInternalOrder(req.params.id, req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.delete('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await internalService.deleteInternalOrder(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});


/** Return Order
 *  routes for returning orders
 */

router.get('/returnOrders', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await returnService.getAllReturnOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/returnOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } =
            await returnService.getReturnOrderById(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/returnOrder', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate body
        const productSchema = Joi.object({
            SKUId: Joi.number().integer().min(1).required(),
            itemId: Joi.number().integer().min(0).required(),
            description: Joi.string().required(),
            price: Joi.number().min(0).required(),
            RFID: Joi.string().regex(/^[0-9]{32}$/).required()
        })
        const schema = Joi.object({
            returnDate: Joi.date().required().format("YYYY/MM/DD HH:mm"),
            products: Joi.array().items(productSchema).required(),
            restockOrderId: Joi.number().integer().min(1).required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        const returnDate = dayjs(req.body.returnDate).format('YYYY/MM/DD HH:mm');

        const { error, code, obj } = await returnService
            .createReturnOrder(
                returnDate, req.body.products, req.body.restockOrderId);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.delete('/returnOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code } = await returnService.deleteReturnOrder(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).end();
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});


/** Restock Order
 * routes for restock orders
 */

router.get('/restockOrders', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await restockService.getAllRestockOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/restockOrdersIssued', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const { error, code, obj } = await restockService.getIssuedRestockOrders();

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/restockOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await restockService.getRestockOrderById(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/restockOrders/:id/returnitems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        const { error, code, obj } = await restockService.getReturnItemsByRestockOrderId(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/restockOrder', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate body
        const productSchema = Joi.object({
            SKUId: Joi.number().integer().min(1).required(),
            itemId: Joi.number().integer().min(1).required(),
            description: Joi.string().required(),
            price: Joi.number().min(0).required(),
            qty: Joi.number().integer().min(0).required()
        })
        const schema = Joi.object({
            issueDate: Joi.date().required().format("YYYY/MM/DD HH:mm"),
            products: Joi.array().items(productSchema).required(),
            supplierId: Joi.number().integer().min(1).required()
        });

        const issueDate = dayjs(req.body.issueDate);

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        const { error, code, obj } = await restockService
            .createRestockOrder(
                issueDate.format('YYYY/MM/DD HH:mm'), req.body.products, req.body.supplierId);

        if (error) {
            console.log(error);
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.put('/restockOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        const schema = Joi.object({
            newState: Joi.string().valid(...restockStates).required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } =
            await restockService.updateRestockOrder(restockUpdateType.state, req.params.id, req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.put('/restockOrder/:id/skuItems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        const productSchema = Joi.object({
            SKUId: Joi.number().integer().min(1).required(),
            itemId: Joi.number().integer().min(1).required(),
            rfid: Joi.string().regex(/^[0-9]{32}$/).required()
        })
        const schema = Joi.object({
            skuItems: Joi.array().items(productSchema).required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        const { error, code, obj } =
            await restockService.updateRestockOrder(restockUpdateType.skuItems, req.params.id, req.body);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.put('/restockOrder/:id/transportNote', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        // validate body
        if (!req.body.transportNote || !req.body.transportNote.deliveryDate ||
            !dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD', true).isValid()) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } =
            await restockService.updateRestockOrder(restockUpdateType.transportNote, req.params.id, req.body);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

router.delete('/restockOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().min(1).required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await restockService.deleteRestockOrder(req.params.id);

        if (error) {
            return res.status(code).send(error);
        }

        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        return res.status(503).send("Service Unavailable");
    }
});

//#region TESTING API ROUTES
const delete_tables = [
    "ReturnOrderSkuItem",
    "ReturnOrder",
    "RestockOrderSkuItem",
    "RestockOrderSku",
    "RestockOrder",
    "InternalOrderSkuItem",
    "InternalOrderSku",
    "InternalOrder"
]
const add_tables = [
    "InternalOrder",
    "InternalOrderSku",
    "InternalOrderSkuItem",
    "RestockOrder",
    "RestockOrderSku",
    "RestockOrderSkuItem",
    "ReturnOrder",
    "ReturnOrderSkuItem",
]

router.delete('/allOrders', async (req, res) => {
    try {
        for (const table of delete_tables) {
            await dao.deleteTable(table);
            await dao.deleteFromSequence(table);
        }
        return res.status(204).send();
    } catch (err) {
        console.log(err);
        return res.status(503).send();
    }
});

router.post('/allOrders', async (req, res) => {
    try {
        for (const table of add_tables) {
            await dao.insertSamples(table);
        }
        return res.status(201).send();
    } catch (err) {
        console.log(err);
        return res.status(503).send();
    }
})

// module export
module.exports = router;