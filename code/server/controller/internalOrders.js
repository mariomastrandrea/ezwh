const InternalOrder = require('../models/internalOrder');
const dayjs = require('dayjs');
const Joi = require('joi');
// todo - verify params id
const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

const internalOrderStates = ['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'];


const getAllInternalOrders = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllInternalOrders().then((ios) => {
            if (ios.length > 0) {
                return res.status(200).json(ios);
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

const getIssuedInternalOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getInternalOrderInState('ISSUED').then((ios) => {
            if (ios.length > 0) {
                return res.status(200).json(ios);
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

const getAcceptedInternalOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getInternalOrderInState('ACCEPTED').then((ios) => {
            if (ios.length > 0) {
                return res.status(200).json(ios);
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

const getInternalOrderById = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        DbManagerInstance.getInternalOrder(parseInt(req.params.id)).then((io) => {
            let ioToReturn;
            if (io.getState() === 'COMPLETED') {
                DbManagerInstance.getInternalOrderSkuItems(io.getId()).then((skuItems) => {
                    io.setSkuItems(skuItems);
                }).catch((err) => {
                    console.log(err);
                });
            }
            ioToReturn = io;
            return res.status(200).json(ioToReturn);
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createInternalOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const subschema = Joi.object({
            SKUId: Joi.number().integer().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            qty: Joi.number().integer().required()
        })
        const schema = Joi.object({
            issueDate: Joi.date().required(),
            products: Joi.array().items(subschema).required(),
            customerId: Joi.number().integer().required()
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
                quantity: p.qty,
            };
        });

        DbManagerInstance.getNextAvailableId('internalOrder').then((id) => {


            const io = new InternalOrder(
                dayjs(req.body.issueDate).format('YYYY/MM/DD HH:mm'),
                products,
                req.body.customerId,
                state = 'ISSUED',
                id
            );
            DbManagerInstance.storeInternalOrder(io.toJSON()).then((x) => {
                if (x > 0) {
                    return res.status(201).send('Created');
                } else {
                    return res.status(503).send('Service Unavailable');
                }
            })
        }).catch((err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        });
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateInternalOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        const subschema = Joi.object({
            SkuID: Joi.number().integer().required(),
            RFID: Joi.string().required()
        })
        const schema = Joi.object({
            newState: Joi.string().valid('ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED').required(),
            products: Joi.alternatives().conditional('newState', { is: 'COMPLETED', then: Joi.array().items(subschema).required(), otherwise: Joi.optional() })
        });

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity')
        }

        DbManagerInstance.getInternalOrder(parseInt(req.params.id)).then((io) => {
            DbManagerInstance.updateInternalOrder({ id: io.getId(), state: req.body.newState }).then((x) => {
                if (x > 0) {
                    let returnValues = { status: 200, message: 'OK' };
                    if (req.body.newState === 'COMPLETED') {
                        
                        DbManagerInstance.storeInternalOrderSkuItems(io.getId(), req.body.products).then((x) => {
                            if (x <= 0) {
                                returnValues = { status: 503, message: 'Service Unavailable' };
                            }
                        }).catch((err) => {
                            console.log(err);
                            returnValues = { status: 503, message: 'Service Unavailable' };
                        });
                    }
                    return res.status(returnValues.status).send(returnValues.message);
                }
            }).catch((err) => {
                console.log(err);
                return res.status(503).send('Service Unavailable');
            });
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteInternalOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error)
            return res.status(422).send('Unprocessable entity');

        DbManagerInstance.deleteInternalOrder(parseInt(req.params.id)).then((x) => {
            if (x > 0) {
                DbManagerInstance.deleteInternalOrderSkuItems(parseInt(req.params.id)).then((y) => { }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
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
    getAllInternalOrders, getIssuedInternalOrder,
    getAcceptedInternalOrder, getInternalOrderById,
    createInternalOrder, updateInternalOrder, deleteInternalOrder
};