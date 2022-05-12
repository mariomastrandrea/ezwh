const dayjs = require('dayjs');
const ReturnOrder = require('../models/returnOrder');
const Joi = require('joi');
const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

async function getAllReturnOrders(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const ros = await DbManagerInstance.getAllReturnOrders();
        for (let ro of ros) {
            const products = await DbManagerInstance.getReturnOrderProducts(ro.getId());
            ro.setProducts(products);
        }
        res.status(200).send(ros);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getReturnOrderById(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity')

        const ro = await DbManagerInstance.getReturnOrderById(parseInt(req.params.id));
        if (!ro) return res.status(404).send('Not Found');
        const products = await DbManagerInstance.getReturnOrderProducts(ro.getId());
        ro.setProducts(products);
        res.status(200).send(ro);
    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }
};

async function createReturnOrder(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const subschema = Joi.object({
            SKUId: Joi.number().integer().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            RFID: Joi.string().required()
        })
        const schema = Joi.object({
            returnDate: Joi.date().required(),
            products: Joi.array().items(subschema).required(),
            restockOrderId: Joi.number().integer().required()
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        const products = req.body.products.map((p) => {
            return {
                SKUId: p.SKUId,
                description: p.description,
                price: p.price,
                RFID: p.RFID,
            };
        });

        const ro = new ReturnOrder(
            dayjs(req.body.returnDate).format('YYYY/MM/DD HH:mm'),
            products,
            req.body.restockOrderId
        );

        const roFromDb = await DbManagerInstance.storeReturnOrder(ro);
        // TODO write correct error code
        if (!roFromDb) return res.status(404).send('Not Found');
        const productsAdded = await DbManagerInstance.storeReturnOrderSkuItems(roFromDb.getId(), roFromDb.getProducts());
        if (!productsAdded) return res.status(404).send('Not Found');
        res.status(201).send('Created');
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
};

async function deleteReturnOrder(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity')

        const deleted = await DbManagerInstance.deleteReturnOrder(ro.getId());
        if (deleted) return res.status(204).send('No Content');
        return res.status(404).send('Not Found');
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
};

module.exports = {
    getAllReturnOrders,
    getReturnOrderById,
    createReturnOrder,
    deleteReturnOrder
}