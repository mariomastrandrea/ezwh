const ReturnOrder = require('../models/returnOrder');

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
            return { success: ros, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    getReturnOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const ro = await this.dao.getReturnOrder(parsedId);
            if (!ro) return { error: 'Not Found', code: 404 };
            const products = await this.dao.getReturnOrderSkuItems(ro.getId());
            ro.setProducts(products);
            return { success: ro, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    createReturnOrder = async (returnDate, products, restockOrderId) => {
        try {
            const restockId = typeof restockOrderId === 'number' ? restockOrderId : parseInt(restockOrderId);
            const restockOrder = await this.dao.getRestockOrder(restockId);
            if (!restockOrder) return { error: 'Not Found', code: 404 };

            const ro = new ReturnOrder(
                returnDate,
                products,
                restockId
            );

            const roFromDb = await this.dao.storeReturnOrder(ro);

            if (!roFromDb) return { error: 'Service Unavailable', code: 503 };

            const productsAdded = await this.dao.storeReturnOrderSkuItems(roFromDb.getId(), roFromDb.getProducts());
            if (!productsAdded) return { error: 'Service Unavailable', code: 503 };

            return { success: 'Created', code: 201 };
        } catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };

    deleteReturnOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getReturnOrder(parsedId);
            if (!ro) return { error: 'Not Found', code: 404 };

            const deleted = await this.dao.deleteReturnOrder(parsedId);
            if (deleted) return { success: 'No Content', code: 204 };
            return { error: 'Service Unavailable', code: 503 };
        }catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };
}

module.exports = ReturnOrderService;