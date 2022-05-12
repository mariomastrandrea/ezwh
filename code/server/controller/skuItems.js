const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const DbManager = require('../db/dbManager');
const dayjs = require('dayjs');
const DbManagerInstance = DbManager.getInstance();
const Joi = require('joi');

const getAllSkuItems = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllSkuItems().then((skuItems) => {
            if (skuItems.length > 0) {
                return res.status(200).json(skuItems);
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

const getAvailableSkuItems = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        DbManagerInstance.getAvailableSkuItems(parseInt(req.params.id)).then((skuItems) => {
            if (skuItems.length > 0) {
                return res.status(200).json(skuItems);
            } else {
                return res.status(404).send('Not Found');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')
        }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const getSkuItem = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSkuItem(req.params.rfid).then((skuItem) => {
            if (skuItem) {
                return res.status(200).json(skuItem);
            }
            return res.status(404).send('Not Found');
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found')
        }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createSkuItem = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const schema = Joi.object({
            RFID: Joi.string().required(),
            SKUId: Joi.number().required(),
            DateOfStock: Joi.date().allow('',null)
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }
        const skuItem = new SkuItem(
            req.body.RFID,
            parseInt(req.body.SKUId),
            req.body.DateOfStock ? dayjs(req.body.DateOfStock).format('YYYY/MM/DD HH:mm') : null,
        );
        DbManagerInstance.storeSkuItem(skuItem.toJSON()).then(() => {
            return res.status(201).send('Created');
        }
        ).catch((err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable')
        }
        );
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateSkuItem = ((req, res) => {
    // todo update 
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const schema = Joi.object({
            newRFID: Joi.string().required(),
            newAvailable: Joi.number().integer().valid(0,1).required(),
            newDateOfStock: Joi.date().allow('',null)
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        DbManagerInstance.getSkuItem(req.params.rfid).then((skuItem) => {
            skuItem.setRfid(req.body.newRFID);
            skuItem.setAvailable(parseInt(req.body.newAvailable));
            skuItem.setDateOfStock(dayjs(req.body.newDateOfStock).format('YYYY/MM/DD HH:mm'));

            DbManagerInstance.updateSkuItem(skuItem.toJSON()).then((x) => {
                if (x > 0) {
                    return res.status(200).send('OK');
                } else {
                    return res.status(503).send('Service Unavailable');
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

const deleteSkuItem = ((req, res) => {
    // todo update
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.string().required().validate(req.params.rfid).error) {
            return res.status(422).send('Unprocessable Entity');
        }
        
        DbManagerInstance.getSkuItem(req.params.rfid).then((skuItem) => {
            if (skuItem) {
                DbManagerInstance.deleteSkuItem(skuItem.getRfid()).then((x) => {
                    if (x > 0) {
                        return res.status(200).send('OK');
                    }
                    return res.status(503).send('Service Unavailable');
                }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                }
                );
            } else {
                return res.status(404).send('Not Found');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        }
        );
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllSkuItems,
    getAvailableSkuItems,
    getSkuItem,
    createSkuItem,
    updateSkuItem,
    deleteSkuItem
};

