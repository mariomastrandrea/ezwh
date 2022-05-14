const RestockOrder = require('../models/restockOrder');

class RestockOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

    getAllRestockOrders = async () => {
        try {
            const ros = await this.dao.getAllRestockOrders();
            if (ros && ros.length > 0) {
                for (let ro of ros) {
                    const products = await this.dao.getRestockOrderSku(ro.getId());
                    ro.setProducts(products);

                    if (ro.getState() != 'ISSUED' || ro.getState() != 'DELIVERY') {
                        const skuItems = await this.dao.getRestockOrderSkuItems(ro.getId());
                        ro.setSkuItems(skuItems);
                    }
                }
            }
            return { success: ros, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    getIssuedRestockOrders = async () => {
        try {
            const ros = await this.dao.getRestockOrdersInState('ISSUED');
            if (ros && ros.length > 0) {
                for (let ro of ros) {
                    const products = await this.dao.getRestockOrderSku(ro.getId());
                    ro.setProducts(products);
                }
            }
            return { success: ros, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }

    };

    getRestockOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro) return { error: 'Not Found', code: 404 };

            const products = await this.dao.getRestockOrderSku(ro.getId());
            ro.setProducts(products);
            if (ro.getState() != 'ISSUED' || ro.getState() != 'DELIVERY') {
                const skuItems = await this.dao.getRestockOrderSkuItems(ro.getId());
                ro.setSkuItems(skuItems);
            }
            return { success: ro, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }

    };

    getReturnItemsByRestockOrderId = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            let ris = [];
            if (!ro) return { error: 'Not Found', code: 404 };
            if (ro.getState() != 'COMPLETEDRETURN') return { error: 'Unprocessable Entity', code: 422 };
            if (ro.getState() == 'COMPLETEDRETURN') {
                ris = await this.dao.getReturnItemsByRestockOrderId(parsedId);
            }
            return { success: ris, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    createRestockOrder = async (issueDate, products, supplierId) => {
        try {
            const ro = new RestockOrder(
                issueDate,
                products,
                supplierId
            );
            // first create the restock order in the table of restock orders
            const roFromDb = await this.dao.storeRestockOrder(ro);
            // then create the restock order skus in the table of restock order skus
            const result = await this.dao.storeRestockOrderSku(roFromDb.getId(), products);
            if (result) return { success: 'Created', code: 201 };
            return { error: "Service Unavailable", code: 503 };
        } catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };

    updateRestockOrder = async (type, id, body) => {
        try {
            // manage different api calls
            // type is an api identifier
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro)
                return { error: 'Not Found', code: 404 };

            let result = 0;
            switch (type) {
                case 'skuItems':
                    result = await this.dao.storeRestockOrderSkuItems(ro.getId(), body.skuItems);
                    break;
                case 'state':
                    ro.setState(body.newState);
                    result = await this.dao.updateRestockOrder(ro);
                    break;
                case 'transportNote':
                    ro.setTransportNote(body.transportNote);
                    result = await this.dao.updateRestockOrder(ro);
                    break;
            }
            if (result) return { success: true, code: 200 };
            return { error: "Service Unavailable", code: 503 };
        } catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };

    deleteRestockOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro) return { error: 'Not Found', code: 404 };

            if (ro.getState() !== 'ISSUED')
                return { error: 'Service Unavailable', code: 503 };

            const skuItems = await this.dao.getRestockOrderSkuItems(ro.getId());
            if (skuItems && skuItems.length > 0) {
                // there are sku items with this ro id
                // cannot delete
                return { error: 'Service Unavailable', code: 503 };
            }
            let result = await this.dao.deleteRestockOrderSku(ro.getId());
            result += await this.dao.deleteRestockOrder(ro.getId());
            if (result > 0) return { success: "No Content", code: 204 };
            return { error: 'Service Unavailable', code: 503 };
        } catch (err) {
            console.log(err);
            return { error: 'Service Unavailable', code: 503 };
        }
    };
}

module.exports = RestockOrderService;