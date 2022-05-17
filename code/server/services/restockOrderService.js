const RestockOrder = require('../models/restockOrder');
const statusCodes = require('../statusCodes');
const { int } = require("../utilities");
const dayjs = require('dayjs');

class RestockOrderService {
    #dao;

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

                    if (ro.getState() !== 'ISSUED' && ro.getState() !== 'DELIVERY') {
                        const skuItems = await this.dao.getRestockOrderSkuItems(ro.getId());
                        ro.setSkuItems(skuItems);
                    }
                }
            }
            return statusCodes.OK(ros);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
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
            return statusCodes.OK(ros);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }

    };

    getRestockOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : int(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro) return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);

            const products = await this.dao.getRestockOrderSku(ro.getId());
            ro.setProducts(products);
            if (ro.getState() !== 'ISSUED' && ro.getState() !== 'DELIVERY') {
                const skuItems = await this.dao.getRestockOrderSkuItems(ro.getId());
                ro.setSkuItems(skuItems);
            }
            return statusCodes.OK(ro);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };

    getReturnItemsByRestockOrderId = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : int(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            let ris = [];
            if (!ro) return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);
            if (ro.getState() !== 'COMPLETEDRETURN') return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not COMPLETED RETURN state`);
            if (ro.getState() === 'COMPLETEDRETURN') {
                ris = await this.dao.getReturnItemsByRestockOrderId(parsedId);
            }
            return statusCodes.OK(ris);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
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
            if (result) return statusCodes.CREATED();
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error creating the restock order`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    updateRestockOrder = async (type, id, body) => {
        try {
            // manage different api calls
            // type is an api identifier
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro)
                return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);

            let result = 0;
            switch (type) {
                case 'skuItems':
                    if (ro.getState() != 'DELIVERED') return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not DELIVERED state`);
                    result = await this.dao.storeRestockOrderSkuItems(ro.getId(), body.skuItems);
                    break;
                case 'state':
                    ro.setState(body.newState);
                    result = await this.dao.updateRestockOrder(ro);
                    break;
                case 'transportNote':
                    if (
                        ro.getState() != 'DELIVERY' ||
                        dayjs(body.transportNote.deliveryDate) < dayjs(ro.getIssueDate())
                    )
                        return statusCodes.UNPROCESSABLE_ENTITY(`Restock order with id: ${id} is not DELIVERY state or delivery date is before issue date`);
                    ro.setTransportNote(body.transportNote);
                    result = await this.dao.updateRestockOrder(ro);
                    break;
            }
            if (result) return statusCodes.OK(true);
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error updating the restock order with id: ${id}`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    deleteRestockOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const ro = await this.dao.getRestockOrder(parsedId);
            if (!ro) return statusCodes.NOT_FOUND(`No restock order found with id: ${id}`);

            if (ro.getState() !== 'ISSUED')
                return statusCodes.SERVICE_UNAVAILABLE(`Restock order with id: ${id} is not ISSUED state, cannot delete because it will cause data inconsistency`);

            let result = await this.dao.deleteRestockOrderSku(ro.getId());
            result += await this.dao.deleteRestockOrder(ro.getId());
            if (result > 0) return statusCodes.NO_CONTENT();
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error deleting the restock order with id: ${id}`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };
}

module.exports = RestockOrderService;