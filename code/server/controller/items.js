const Item = require('../models/item');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

const getAllItems = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllItems().then((items) => {
            if (items.length > 0) {
                return res.status(200).json(items);
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

const getItemById = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) return res.status(422).send('Unprocessable Entity');
        DbManagerInstance.getItem(parseInt(req.params.id)).then((item) => {
            return res.status(200).json(item);
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createItem = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (
            req.body.description && !isNaN(req.body.price)
            && !isNaN(req.body.SKUId) && !isNaN(req.body.supplierId)
            && !isNaN(req.body.id)
        ) {
            DbManagerInstance.getSku(parseInt(req.body.SKUId)).then((sku) => {
                if (sku) {
                    const item = new Item(
                        parseInt(req.body.id),
                        req.body.description,
                        parseFloat(req.body.price),
                        parseInt(req.body.SKUId),
                        parseInt(req.body.supplierId)
                    );
                    DbManagerInstance.storeItem(item.toJSON()).then((item) => {
                        return res.status(201).send('Created');
                    }).catch((err) => {
                        console.log(err);
                        return res.status(503).send('Service Unavailable');
                    });
                } else {
                    return res.status(404).send('Not Found');
                }
            }).catch((err) => {
                console.log(err);
                return res.status(500).send('Internal Server Error');
            });
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateItem = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) return res.status(422).send('Unprocessable Entity');
        DbManagerInstance.getItem(parseInt(req.params.id)).then((item) => {
            if (item) {
                if (req.body.newDescription) {
                    item.setDescription(req.body.newDescription);
                }
                if (req.body.newPrice) {
                    if (isNaN(req.body.newPrice)) return res.status(422).send('Unprocessable Entity');
                    item.setPrice(parseFloat(req.body.newPrice));
                }
                DbManagerInstance.updateItem(item.toJSON()).then((item) => {
                    return res.status(200).send('OK');
                }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
            } else {
                return res.status(404).send('Not Found');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteItem = ((req, res) => {
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) return res.status(422).send('Unprocessable Entity');
        DbManagerInstance.deleteItem(parseInt(req.params.id)).then((item) => {
            return res.status(200).send('No Content');
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
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
}