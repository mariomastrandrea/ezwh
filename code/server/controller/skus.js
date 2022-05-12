const Sku = require('../models/sku');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();
const Joi = require('joi');

const getAllSkus = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllSkus().then((skus) => {
            if (skus.length > 0) {
                return res.status(200).json(skus);
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

const getSkuById = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {
            return res.status(200).json(sku);
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createSku = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
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

        const sku = new Sku(
            req.body.description,
            parseFloat(req.body.weight),
            parseFloat(req.body.volume),
            req.body.notes,
            parseFloat(req.body.price),
            parseInt(req.body.availableQuantity)
        );
        console.log(sku.toJSON());
        DbManagerInstance.storeSku(sku.toJSON()).then((x) => {
            if (x > 0) {
                return res.status(201).send('Created');
            } else {
                return res.status(503).send('Service Unavailable');
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateSku = ((req, res) => {
    // todo update 
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        const schema = Joi.object({
            newDescription: Joi.string().required(),
            newWeight: Joi.number().required(),
            newVolume: Joi.number().required(),
            newNotes: Joi.string().required(),
            newPrice: Joi.number().required(),
            newAvailableQuantity: Joi.number().integer().required()
        })

        const result = schema.validate(req.body);
        if (result.error) {
            return res.status(422).send('Unprocessable Entity');
        }

        DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {

            sku.setDescription(req.body.newDescription);
            sku.setWeight(parseFloat(req.body.newWeight));
            sku.setVolume(parseFloat(req.body.newVolume));
            sku.setNotes(req.body.newNotes);
            sku.setPrice(parseFloat(req.body.newPrice));
            sku.setAvailableQuantity(parseInt(req.body.newAvailableQuantity));


            DbManagerInstance.updateSku(sku.toJSON()).then((x) => {
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

const updateSkuPosition = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        if (Joi.string().required().validate(req.body.position).error) {
            return res.status(422).send('Unprocessable Entity');
        }

        DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {
            sku.setPosition(req.body.position);

            DbManagerInstance.updateSku(sku.toJSON()).then((x) => {
                if (x > 0) {
                    return res.status(200).send('OK');
                } else {
                    return res.status(503).send('Service Unavailable');
                }

                // todo update position
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
    };
});

const deleteSku = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (Joi.number().integer().required().validate(req.params.id).error) {
            return res.status(422).send('Unprocessable Entity');
        }
        
        DbManagerInstance.deleteSku(parseInt(req.params.id)).then((x) => {
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
    getAllSkus,
    getSkuById,
    createSku,
    updateSku,
    updateSkuPosition,
    deleteSku,

};