const SkuItem = require('../models/skuItem');
const { int } = require("../utilities");

const {
    OK,
    CREATED,
    NO_CONTENT,
    NOT_FOUND,
    UNPROCESSABLE_ENTITY,
    INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE
} = require("../statusCodes");


class SkuItemService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    async getAllSkuItems() {
        const allSkuItems = await this.#dao.getAllSkuItems();
        return OK(allSkuItems);
    };

    async getAvailableSkuItemsOf(skuId) {
        // check sku existence
        const sku = await this.#dao.getSkuById(skuId);

        if (!sku)
            return NOT_FOUND(`sku ${skuId} not present`);

        const availableSkuItems = await this.#dao.getAvailableSkuItemsOf(skuId);

        // return only required properties
        return OK(availableSkuItems.map(skuItem => skuItem.toObjWithoutAvailable()));
    };

    async getSkuItem(rfid) {
        // check rfid existence
        const skuItem = await this.#dao.getSkuItemByRfid(rfid);

        if (!skuItem) 
            return NOT_FOUND(`rfid ${rfid} does not exist`);

        return OK(skuItem);
    };

    async createSkuItem(rfid, skuId, dateOfStock) {
        // check if rfid already exists
        const tempSkuItem = await this.#dao.getSkuItemByRfid(rfid);

        if (tempSkuItem)
            return UNPROCESSABLE_ENTITY(`rfid ${rfid} already present`);

        // check if exist the sku
        skuId = int(skuId);
        const sku = await this.#dao.getSkuById(skuId);

        if (!sku)
            return NOT_FOUND(`sku ${skuId} does not exist`);

        // * create skuItem * 
        const skuItem = new SkuItem(rfid, skuId, dateOfStock);
        const skuItemWasCreated = await this.#dao.storeSkuItem(skuItem);

        if (!skuItemWasCreated)  // generic error during skuItem creation
            return SERVICE_UNAVAILABLE();

        return CREATED();
    };

    async updateSkuItem(oldRfid, newRfid, newAvailable, newDateOfStock) {
        // check skuItem existence
        const skuItem = await this.#dao.getSkuItemByRfid(oldRfid);

        if (!skuItem)
            return NOT_FOUND(`skuItem ${oldRfid} does not exist`);

        // check if newRfid is available
        const tempSkuItem = oldRfid !== newRfid && await this.#dao.getSkuItemByRfid(newRfid);

        if (tempSkuItem)
            return UNPROCESSABLE_ENTITY(`rfid ${newRfid} is already present`);

        // * update skuItem *
        const newSkuItem = new SkuItem(newRfid, skuItem.getSkuId(), newDateOfStock, newAvailable);
        const skuItemWasUpdated = await this.#dao.updateSkuItem(oldRfid, newSkuItem);

        // * cascading updates on TestResults made by sqlite * 
        // * cascading updates on Orders' tables * ???

        if (!skuItemWasUpdated) // generic error during creation
            return SERVICE_UNAVAILABLE();

        return OK();
    }

    async deleteSkuItem(rfid) {
        // check skuItem existence
        const skuItem = await this.#dao.getSkuItemByRfid(rfid);

        if (!skuItem) 
            return NOT_FOUND(`rfid ${rfid} not found`);

        // * delete sku item *
        const skuItemWasDeleted = await this.#dao.deleteSkuItem(rfid);

        // * cascading deletion of associated test results made by sqlite *
        
        if (!skuItemWasDeleted)     // generic error during deletion
            return SERVICE_UNAVAILABLE(); 
        
        return NO_CONTENT();
    };
};

module.exports = SkuItemService;

