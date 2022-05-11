const dayjs = require('dayjs');
const ReturnOrder = require('../models/returnOrder');

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
        if (!isNaN(req.params.id)) {
            const ro = await DbManagerInstance.getReturnOrderById(parseInt(req.params.id));
            if (!ro) return res.status(404).send('Not Found');
            const products = await DbManagerInstance.getReturnOrderProducts(ro.getId());
            ro.setProducts(products);
            res.status(200).send(ro);
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
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
        if (
            dayjs(req.body.returnDate, 'YYYY/MM/DD HH:mm', true).isValid()
            && dayjs() >= dayjs(req.body.returnDate, 'YYYY/MM/DD HH:mm')
            && req.body.products.length > 0
            && !isNaN(req.body.restockOrderId)
        ) {

            const products = req.body.products.map((p) => {
                if (!isNaN(p.SKUId) && !isNaN(p.price)
                    && p.description && p.price > 0
                ) {
                    return {
                        SKUId: p.SKUId,
                        description: p.description,
                        price: p.price,
                        RFID: p.RFID,
                    };
                } else return res.status(422).send('Unprocessable Entity');
            });

            const ro = new ReturnOrder(
                dayjs(req.body.returnDate).format('YYYY/MM/DD HH:mm'),
                products,
                req.body.restockOrderId
            );

            const roFromDb = await DbManagerInstance.createReturnOrder(ro);
            // TODO write correct error code
            if (!roFromDb) return res.status(404).send('Not Found');
            const productsAdded = await DbManagerInstance.storeReturnOrderSkuItems(roFromDb.getId(), roFromDb.getProducts());
            if (!productsAdded) return res.status(404).send('Not Found');
            res.status(201).send('Created');
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
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
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        const deleted = await DbManagerInstance.deleteReturnOrder(ro.getId());
        if (deleted) return res.status(204).send('No Content');

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