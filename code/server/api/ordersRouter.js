const express = require('express');
const router = express.Router();

//dayjs is a date library for javascript
const dayjs = require('dayjs');
// validation
const Joi = require('joi');
// DbManager / DAO
const DbManagerFactory = require('../db/dbManager3');
const dao = DbManagerFactory();

// import Services classes and inject dao

const InternalOrderService = require("../services/internalOrderService");
const internalService = new InternalOrderService(dao);
const RestockOrderService = require("../services/restockOrderService");
const restockService = new RestockOrderService(dao);
const ReturnOrderService = require("../services/returnOrderService");
const returnService = new ReturnOrderService(dao);

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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
    }
});

router.get('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await internalService.getInternalOrderById(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
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
            SKUId: Joi.number().integer().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            qty: Joi.number().integer().required()
        })
        const schema = Joi.object({
            issueDate: Joi.date().required(),
            products: Joi.array().items(productSchema).required(),
            customerId: Joi.number().integer().required()
        });

        const issueDate = dayjs(req.body.issueDate);

        const result = schema.validate(req.body);
        if (result.error || dayjs().diff(issueDate, 'day') > 3) {
            return res.status(422).send('Unprocessable Entity')
        }

        const { error, code, obj } = await internalService
            .createInternalOrder(
                issueDate.format('YYYY/MM/DD HH:mm'), req.body.products, req.body.customerId);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

router.put('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        const productSchema = Joi.object({
            SkuID: Joi.number().integer().required(),
            RFID: Joi.string().required()
        })
        const schema = Joi.object({
            newState: Joi.string().valid(...internalStates).required(),
            products: Joi.alternatives().conditional('newState', { is: 'COMPLETED', then: Joi.array().items(productSchema).required(), otherwise: Joi.optional() })
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } = await internalService.updateInternalOrder(parseInt(req.params.id), req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

router.delete('/internalOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await internalService.deleteInternalOrder(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
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
        res.status(500).send("Internal Server Error");
    }
});

router.get('/returnOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await returnService.getReturnOrderById(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
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
            SKUId: Joi.number().integer().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            RFID: Joi.string().regex(/^[0-9]{32}$/).required()
        })
        const schema = Joi.object({
            returnDate: Joi.date().required(),
            products: Joi.array().items(productSchema).required(),
            restockOrderId: Joi.number().integer().required()
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
        res.status(503).send("Service Unavailable");
    }
});

router.delete('/returnOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await returnService.deleteReturnOrder(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});


/** Restock Order
 * routes for restocking orders
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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
    }
});

router.get('/restockOrders/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await restockService.getRestockOrderById(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/restockOrders/:id/returnitems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await restockService.getReturnItemsByRestockOrderId(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
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
            SKUId: Joi.number().integer().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            qty: Joi.number().integer().required()
        })
        const schema = Joi.object({
            issueDate: Joi.date().required(),
            products: Joi.array().items(productSchema).required(),
            supplierId: Joi.number().integer().required()
        });

        const issueDate = dayjs(req.body.issueDate);

        const result = schema.validate(req.body);
        if (result.error || dayjs().diff(issueDate, 'day') > 3) {
            return res.status(422).send('Unprocessable Entity')
        }

        const { error, code, obj } = await restockService
            .createRestockOrder(
                issueDate.format('YYYY/MM/DD HH:mm'), req.body.products, req.body.supplierId);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});
router.put('/restockOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        const schema = Joi.object({
            newState: Joi.string().valid(...restockStates).required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } = await restockService.updateRestockOrder(restockUpdateType.state, parseInt(req.params.id), req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});
router.put('/restockOrder/:id/skuItems', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        const productSchema = Joi.object({
            SKUId: Joi.number().integer().required(),
            RFID: Joi.string().regex(/^[0-9]{32}$/).required()
        })
        const schema = Joi.object({
            skuItems: Joi.array().items(productSchema).required(),
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } = await restockService.updateRestockOrder(restockUpdateType.skuItems, parseInt(req.params.id), req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});
router.put('/restockOrder/:id/transportNote', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');
        // validate body
        if (!req.body.transportNote || !req.body.transportNote.deliveryDate ||
            !dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD HH:mm', true).isValid()) {
            return res.status(422).send('Unprocessable Entity')
        }
        const { error, code, obj } = await restockService.updateRestockOrder(restockUpdateType.transportNote, parseInt(req.params.id), req.body);

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});
router.delete('/restockOrder/:id', async (req, res) => {
    // TODO: add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // validate id
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const { error, code, obj } = await restockService.deleteRestockOrder(parseInt(req.params.id));

        if (error) {
            return res.status(code).send(error);
        }
        return res.status(code).json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(503).send("Service Unavailable");
    }
});

// module export
module.exports = router;