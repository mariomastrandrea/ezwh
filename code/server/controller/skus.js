const Sku = require('../models/sku');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

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
        if (!isNaN(req.params.id)) {
            DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {
                return res.status(200).json(sku);
            }).catch((err) => {
                console.log(err);
                return res.status(404).send('Not Found');
            });
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
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
        if (
            req.body.description
            && !isNaN(req.body.weight)
            && !isNaN(req.body.volume)
            && !isNaN(req.body.price)
            && req.body.notes
            && !isNaN(req.body.availableQuantity)
        ) {
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
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
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
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {
            if (req.body.newDescription) {
                sku.setDescription(req.body.newDescription);
            }
            if (req.body.newWeight) {
                if (!isNaN(req.body.newWeight)) sku.setWeight(parseFloat(req.body.newWeight));
                else return res.status(422).send('Unprocessable Entity');
            }
            if (req.body.newVolume) {
                if (!isNaN(req.body.newVolume)) sku.setVolume(parseFloat(req.body.newVolume));
                else return res.status(422).send('Unprocessable Entity');
            }
            if (req.body.newNotes) {
                sku.setNotes(req.body.newNotes);
            }
            if (req.body.newPrice) {
                if (!isNaN(req.body.newPrice)) sku.setPrice(parseFloat(req.body.newPrice));
                else return res.status(422).send('Unprocessable Entity');
            }
            if (req.body.newAvailableQuantity) {
                if (!isNaN(req.body.newAvailableQuantity)) sku.setAvailableQuantity(parseInt(req.body.newAvailableQuantity));
                else return res.status(422).send('Unprocessable Entity');
            }
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
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSku(parseInt(req.params.id)).then((sku) => {
            if (req.body.position) {
                sku.setPosition(req.body.position);
            } else return res.status(422).send('Unprocessable Entity');

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
        if (isNaN(req.params.id)) {
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