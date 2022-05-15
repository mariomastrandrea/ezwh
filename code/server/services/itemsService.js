const Item = require('../models/item');
const { int } = require('../utilities');

const {
    OK,
    CREATED,
    NO_CONTENT,
    NOT_FOUND,
    UNPROCESSABLE_ENTITY,
    INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE
} = require("../statusCodes");


class ItemsService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    async getAllItems() {
        const allItems = await this.#dao.getAllItems();
        return OK(allItems);
    };

    async getItemById(itemId) {
        // check item existence
        const item = await this.#dao.getItemById(skuId);

        if (!item)
            return NOT_FOUND(`item ${itemId} not found`);

        return OK(item);
    };

    async createItem(itemId, description, price, skuId, supplierId) {
        // check if id already present
        let tempItem = await this.#dao.getItemById(itemId);

        if (tempItem) 
            return UNPROCESSABLE_ENTITY(`item ${itemId} already exists`);

        // check sku existence
        const sku = await this.#dao.getSkuById(skuId);

        if (!sku)
            return NOT_FOUND(`sku ${skuId} not found`);

        // check supplier existence
        const supplier = this.#dao.getUser(supplierId, 'SUPPLIER');

        if (!supplier) 
            return NOT_FOUND(`supplier ${supplierId} not found`);

        // check if supplier already sells this sku
        tempItem = await this.#dao.getItemBySkuIdAndSupplier(skuId, supplierId);

        if (tempItem) 
            return UNPROCESSABLE_ENTITY(`supplier ${supplierId} already sells sku ${skuId}`);

        // * create item *
        const newItem = new Item(itemId, description, price, skuId, supplierId);
        const itemWasCreated = await this.#dao.storeItem(newItem);

        if (!itemWasCreated)    // generic error during creation
            SERVICE_UNAVAILABLE();

        return CREATED();
    };

    ////////////////////////////////////////////////////////////////

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