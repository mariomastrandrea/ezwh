const ReturnOrder = require('../models/returnOrder');
const statusCodes = require('../statusCodes');

class ReturnOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

    getAllReturnOrders = async () => {
        try {
            const ros = await this.dao.getAllReturnOrders();
            if (ros && ros.length > 0) {
                for (let ro of ros) {
                    const products = await this.dao.getReturnOrderSkuItems(ro.getId());
                    ro.setProducts(products);
                }
            }
            return statusCodes.OK(ros);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };

    getReturnOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const ro = await this.dao.getReturnOrder(parsedId);
            if (!ro) return statusCodes.NOT_FOUND();
            const products = await this.dao.getReturnOrderSkuItems(ro.getId());
            ro.setProducts(products);
            return statusCodes.OK(ro);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };

    createReturnOrder = async (returnDate, products, restockOrderId) => {
        try {
            const restockId = typeof restockOrderId === 'number' ? restockOrderId : parseInt(restockOrderId);
            const restockOrder = await this.dao.getRestockOrder(restockId);
            if (!restockOrder) return statusCodes.NOT_FOUND();

            const ro = new ReturnOrder(
                returnDate,
                products,
                restockId
            );

            const roFromDb = await this.dao.storeReturnOrder(ro);

            if (!roFromDb) return statusCodes.SERVICE_UNAVAILABLE();

            const productsAdded = await this.dao.storeReturnOrderSkuItems(roFromDb.getId(), roFromDb.getProducts());
            if (!productsAdded) return statusCodes.SERVICE_UNAVAILABLE();

            return statusCodes.CREATED();
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    deleteReturnOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getReturnOrder(parsedId);
            if (!ro) return statusCodes.NOT_FOUND();

            const deleted = await this.dao.deleteReturnOrder(parsedId);
            if (deleted) return statusCodes.NO_CONTENT();
            return statusCodes.SERVICE_UNAVAILABLE();
        }catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };
}

module.exports = ReturnOrderService;