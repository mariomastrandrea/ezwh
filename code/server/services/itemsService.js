const Item = require('../models/item');

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
        const item = await this.#dao.getItemById(itemId);

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

    async updateItem(itemId, newDescription, newPrice) {
        // check item existence
        const item = await this.#dao.getItemById(itemId);

        if (!item)
            return NOT_FOUND(`item ${itemId} not found`);

        // * update item *
        const newItem = new Item(itemId, newDescription, newPrice, item.getSkuId(), item.getSupplierId());
        const itemWasUpdated = await this.#dao.updateItem(newItem);

        if (!itemWasUpdated) // a generic error occurred during update
            return SERVICE_UNAVAILABLE();

        return OK();
    };

    async deleteItem(itemId) {
        // check item existence
        const item = await this.#dao.getItemById(itemId);

        if (!item)
            return NOT_FOUND(`item ${itemId} not found`);

        // * delete item *
        const itemWasDeleted = await this.#dao.deleteItem(itemId);

        if (!itemWasDeleted) // a generic error occurred during delete
            return SERVICE_UNAVAILABLE();
        
        return NO_CONTENT();
    }
}

module.exports = ItemsService;