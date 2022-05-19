const ReturnOrder = require('../models/returnOrder');
const statusCodes = require('../statusCodes');
const { int } = require("../utilities");
const dayjs = require('dayjs');

class ReturnOrderService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    getAllReturnOrders = async () => {
        const ros = await this.#dao.getAllReturnOrders();
        if (ros && ros.length > 0) {
            for (let ro of ros) {
                const products = await this.#dao.getReturnOrderSkuItems(ro.getId());
                ro.setProducts(products);
            }
        }
        return statusCodes.OK(ros);
    };

    getReturnOrderById = async (id) => {
        const parsedId = typeof id === 'number' ? id : parseInt(id);

        const ro = await this.#dao.getReturnOrder(parsedId);
        if (!ro)
            return statusCodes.NOT_FOUND(`No return order found with id: ${id}`);

        const products = await this.#dao.getReturnOrderSkuItems(ro.getId());
        ro.setProducts(products);
        return statusCodes.OK(ro);
    };

    createReturnOrder = async (returnDate, products, restockOrderId) => {
        const restockId = typeof restockOrderId === 'number' ? restockOrderId : int(restockOrderId);
        const restockOrder = await this.#dao.getRestockOrder(restockId);

        if (!restockOrder)
            return statusCodes.NOT_FOUND(`No restock order found with id: ${restockOrderId}`);

        if (dayjs(returnDate) < dayjs(restockOrder.getIssueDate()))
            return statusCodes.UNPROCESSABLE_ENTITY(`Return date must be after issue date`);

        // check existence of skus and sku items
        for (let product of products) {
            const skuId = product.SKUId;
            const rfid = product.RFID;

            const sku = await this.#dao.getSkuById(skuId);
            if (!sku) return statusCodes.NOT_FOUND(`sku ${skuId} was not found`);

            const skuItem = await this.#dao.getSkuItemByRfid(rfid);
            if (!skuItem) return statusCodes.NOT_FOUND(`sku item ${rfid} not found`);

            // check if that skuItem has at least one negative test result associated
            const negativeTestResults = await this.#dao.getNegativeTestResultsOf(rfid);

            if (!negativeTestResults || negativeTestResults.length === 0)
                return statusCodes.UNPROCESSABLE_ENTITY(`skuItem ${rfid} has not any negative test results`);
        }

        // * create return order *
        const ro = new ReturnOrder(
            returnDate,
            products,
            restockId
        );

        const roFromDb = await this.#dao.storeReturnOrder(ro);
        if (!roFromDb)
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error creating the return order`);

        const productsAdded = await this.#dao.storeReturnOrderSkuItems(roFromDb.getId(), roFromDb.getProducts());
        if (!productsAdded)
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error adding the products to the return order`);

        return statusCodes.CREATED();
    };

    deleteReturnOrder = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);

        const ro = await this.#dao.getReturnOrder(parsedId);
        if (!ro) 
            return statusCodes.NOT_FOUND(`No return order found with id: ${id}`);

        let deleted = await this.#dao.deleteReturnOrder(parsedId);
        // * cascading delete of restock order's sku items made by sqlite *
        
        if (deleted) return statusCodes.NO_CONTENT();

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error deleting the return order`);
    };
}

module.exports = ReturnOrderService;