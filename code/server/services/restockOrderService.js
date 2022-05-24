const RestockOrder = require('../models/restockOrder');
const statusCodes = require('../statusCodes');
const { int } = require("../utilities");
const dayjs = require('dayjs');

class RestockOrderService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    getAllRestockOrders = async () => {
        const ros = await this.#dao.getAllRestockOrders();

        if (ros && ros.length > 0) {
            for (let ro of ros) {
                const products = await this.#dao.getRestockOrderSku(ro.getId());
                ro.setProducts(products);

                if (ro.getState() !== 'ISSUED' && ro.getState() !== 'DELIVERY') {
                    const skuItems = await this.#dao.getRestockOrderSkuItems(ro.getId());
                    ro.setSkuItems(skuItems);
                }
            }
        }

        return statusCodes.OK(ros);
    };

    getIssuedRestockOrders = async () => {
        const ros = await this.#dao.getRestockOrdersInState('ISSUED');

        if (ros && ros.length > 0) {
            for (let ro of ros) {
                const products = await this.#dao.getRestockOrderSku(ro.getId());
                ro.setProducts(products);
            }
        }

        return statusCodes.OK(ros);
    };

    getRestockOrderById = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);
        const ro = await this.#dao.getRestockOrder(parsedId);
        if (!ro) return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);

        const products = await this.#dao.getRestockOrderSku(ro.getId());
        ro.setProducts(products);
        if (ro.getState() !== 'ISSUED' && ro.getState() !== 'DELIVERY') {
            const skuItems = await this.#dao.getRestockOrderSkuItems(ro.getId());
            ro.setSkuItems(skuItems);
        }
        return statusCodes.OK(ro);
    };

    getReturnItemsByRestockOrderId = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);
        const ro = await this.#dao.getRestockOrder(parsedId);
        let ris = [];

        if (!ro)
            return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);
        if (ro.getState() !== 'COMPLETEDRETURN')
            return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not in COMPLETED RETURN state`);
        if (ro.getState() === 'COMPLETEDRETURN')
            ris = await this.#dao.getReturnItemsByRestockOrderId(parsedId);

        return statusCodes.OK(ris);
    };

    createRestockOrder = async (issueDate, products, supplierId) => {
        // check existence of all SKUs in products
        for (let product of products) {
            const skuId = product.SKUId;
            const sku = await this.#dao.getSkuById(skuId);

            if (!sku) // an SKU id was not found
                return statusCodes.UNPROCESSABLE_ENTITY(`sku ${skuId} is not found`);
        }

        // check existence of the supplier
        const supplier = await this.#dao.getUserByIdAndType(supplierId, 'supplier');

        if (!supplier) 
            return statusCodes.UNPROCESSABLE_ENTITY(`supplier ${supplierId} is not found`);

        // * create the restock order *
        const ro = new RestockOrder(
            issueDate,
            products,
            supplierId
        );

        // first create the restock order in the table of restock orders
        const roFromDb = await this.#dao.storeRestockOrder(ro);

        // then create the restock order skus in the table of restock order skus
        const result = await this.#dao.storeRestockOrderSku(roFromDb.getId(), products);

        if (result)
            return statusCodes.CREATED();

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error creating the restock order`);
    };

    updateRestockOrder = async (type, id, body) => {
        // manage different api calls
        // type is an api identifier
        const parsedId = typeof id === 'number' ? id : int(id);
        const ro = await this.#dao.getRestockOrder(parsedId);

        if (!ro)
            return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);

        let result = 0;
        switch (type) {
            case 'skuItems':
                if (ro.getState() !== 'DELIVERED')
                    return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not DELIVERED state`);

                // check existence of Skus and SkuItems
                for (let s of body.skuItems) {
                    const skuId = s.SKUId;
                    const rfid = s.rfid;

                    const sku = await this.#dao.getSkuById(skuId);
                    if (!sku) return statusCodes.UNPROCESSABLE_ENTITY(`sku ${skuId} not found`);

                    const skuItem = await this.#dao.getSkuItemByRfid(rfid);
                    if (!skuItem) return statusCodes.UNPROCESSABLE_ENTITY(`skuItem ${rfid} not found`);
                }

                result = await this.#dao.storeRestockOrderSkuItems(ro.getId(), body.skuItems);
                break;
            case 'state':
                ro.setState(body.newState);
                result = await this.#dao.updateRestockOrder(ro);
                break;
            case 'transportNote':
                if (
                    ro.getState() !== 'DELIVERY' ||
                    dayjs(body.transportNote.deliveryDate) < dayjs(ro.getIssueDate())
                )
                return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not in DELIVERY state or delivery date is before issue date`);

                ro.setTransportNote(body.transportNote);
                result = await this.#dao.updateRestockOrder(ro);
                break;
        }

        if (result)
            return statusCodes.OK(true);

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error updating the restock order with id: ${id}`);
    };

    deleteRestockOrder = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);

        const ro = await this.#dao.getRestockOrder(parsedId);
        if (!ro) return statusCodes.UNPROCESSABLE_ENTITY(`No restock order found with id: ${id}`);

        /*
        if (ro.getState() !== 'ISSUED')
            return statusCodes.SERVICE_UNAVAILABLE(`Restock order with id: ${id} is not ISSUED state, 
                cannot delete because it will cause data inconsistency`);
        */

        let result = await this.#dao.deleteRestockOrderSku(ro.getId());
        result += await this.#dao.deleteRestockOrder(ro.getId());
        result += await this.#dao.deleteRestockOrderSkuItems(ro.getId());

        if (result) 
            return statusCodes.NO_CONTENT();

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error deleting the restock order with id: ${id}`);
    };
}

module.exports = RestockOrderService;