const dayjs = require('dayjs');
const ReturnOrder = require('../models/returnOrder');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

const getAllReturnOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllReturnOrders().then((ros) => {
            if (ros.length > 0) {
                return res.status(200).json(ros);
            } else {
                return res.status(500).send('Internal Server Error');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const getReturnOrderById = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            DbManagerInstance.getReturnOrder(parseInt(req.params.id)).then((ro) => {
                return res.status(200).json(ro);
            }).catch((err) => {
                console.log(err);
                return res.status(404).send('Not Found');
            });
        }else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch(err){
        return res.status(500).send('Internal Server Error');
    }
});

const createReturnOrder = ((req, res) => {
    // todo add login check
    if(!true){
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

            DbManagerInstance.getNextAvailableId('returnOrder').then((id) => {
                const ro = new ReturnOrder(
                    dayjs(req.body.returnDate).format('YYYY/MM/DD HH:mm'),
                    products,
                    req.body.restockOrderId,
                    id
                );
                DbManagerInstance.storeReturnOrder(ro.toJSON()).then((x) => {
                    if (x > 0) {
                        return res.status(201).send('Created');
                    } else {
                        return res.status(404).send('Not Found');
                    }
                })
            }).catch((err) => {
                console.log(err);
                return res.status(503).send('Service Unavailable');
            });
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteReturnOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.deleteReturnOrder(parseInt(req.params.id)).then((x) => {
            if (x > 0) {
                return res.status(200).send('OK');
            } else {
                return res.status(503).send('Service Unavailable');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        });

    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllReturnOrders,
    getReturnOrderById,
    createReturnOrder,
    deleteReturnOrder
}