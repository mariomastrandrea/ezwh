const Item = require('../models/item');

class ItemsService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // TODO: implement all methods below

    async getAllItems() {
        // todo add login check
        if (!true) {
            return res.status(401).send('Unauthorized');
        }
        try {
            this.#dao.getAllItems().then((items) => {
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
    };
    
    async getItemById() {
        if (!true) {
            return res.status(401).send('Unauthorized');
        }
        try {
            if (Joi.number().integer().required().validate(req.params.id).error)
                return res.status(422).send('Unprocessable entity');
    
            this.#dao.getItem(parseInt(req.params.id)).then((item) => {
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
    };
    
    async createItem() {
        if (!true) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const schema = Joi.object({
                id: Joi.number().integer().required(),
                description: Joi.string().required(),
                price: Joi.number().required(),
                SKUId: Joi.number().integer().required(),
                supplierId: Joi.number().integer().required()
            });
    
            const result = schema.validate(req.body);
            if (result.error) {
                return res.status(422).send('Unprocessable Entity')
            }
    
            this.#dao.getSku(parseInt(req.body.SKUId)).then((sku) => {
                if (sku) {
                    const item = new Item(
                        parseInt(req.body.id),
                        req.body.description,
                        parseFloat(req.body.price),
                        parseInt(req.body.SKUId),
                        parseInt(req.body.supplierId)
                    );
                    this.#dao.storeItem(item.toJSON()).then((item) => {
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
        } catch (err) {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        }
    };
    
    async updateItem() {
        if (!true) {
            return res.status(401).send('Unauthorized');
        }
        try {
            if (Joi.number().integer().required().validate(req.params.id).error)
                return res.status(422).send('Unprocessable entity');
    
            const schema = Joi.object({
                newDescription: Joi.string().required(),
                newPrice: Joi.number().required()
            });
    
            const result = schema.validate(req.body);
            if (result.error) {
                return res.status(422).send('Unprocessable Entity')
            }
    
            this.#dao.getItem(parseInt(req.params.id)).then((item) => {
                if (item) {
                    item.setDescription(req.body.newDescription);
                    item.setPrice(parseFloat(req.body.newPrice));
    
                    this.#dao.updateItem(item.toJSON()).then((item) => {
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
    };
    
    async deleteItem() {
        if (!true) {
            return res.status(401).send('Unauthorized');
        }
        try {
            if (Joi.number().integer().required().validate(req.params.id).error)
                return res.status(422).send('Unprocessable entity');
    
            this.#dao.deleteItem(parseInt(req.params.id)).then((item) => {
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
    };
}

module.exports = ItemsService;