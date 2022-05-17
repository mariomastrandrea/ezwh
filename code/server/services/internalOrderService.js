const InternalOrder = require('../models/internalOrder');
const statusCodes = require('../statusCodes');

class InternalOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

    getAllInternalOrders = async () => {
        try {
            const ios = await this.dao.getAllInternalOrders();
            if (ios && ios.length > 0) {
                for (let io of ios) {
                    const products = await this.dao.getInternalOrderSku(io.getId());
                    io.setProducts(products);

                    if (io.getState() === 'COMPLETED') {
                        const skuItems = await this.dao.getInternalOrderSkuItems(io.getId());
                        io.setSkuItems(skuItems);
                    }
                }
            }
            return statusCodes.OK(ios);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };


    getIssuedInternalOrders = async () => {
        try {
            const ios = await this.dao.getInternalOrdersInState('ISSUED');
            if (ios && ios.length > 0) {
                for (let io of ios) {
                    const products = await this.dao.getInternalOrderSku(io.getId());
                    io.setProducts(products);
                }
            }
            return statusCodes.OK(ios);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR;
        }
    };

    getAcceptedInternalOrders = async () => {
        try {
            const ios = await this.dao.getInternalOrdersInState('ACCEPTED');
            if (ios && ios.length > 0) {
                for (let io of ios) {
                    const products = await this.dao.getInternalOrderSku(io.getId());
                    io.setProducts(products);
                }
            }
            return statusCodes.OK(ios);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };

    getInternalOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const io = await this.dao.getInternalOrder(parsedId);
            if (!io) return statusCodes.NOT_FOUND(`No internal order found with id: ${id}`);

            const products = await this.dao.getInternalOrderSku(io.getId());
            io.setProducts(products);
            if (io.getState() === 'COMPLETED') {
                const skuItems = await this.dao.getInternalOrderSkuItems(io.getId());
                io.setSkuItems(skuItems);
            }
            return statusCodes.OK(io);
        } catch (err) {
            console.log(err);
            return statusCodes.INTERNAL_SERVER_ERROR();
        }
    };

    createInternalOrder = async (issueDate, products, customerId) => {
        try {
            const io = new InternalOrder(
                issueDate,
                products,
                customerId
            );
            // first create the internal order in the table of internal orders
            const ioFromDb = await this.dao.storeInternalOrder(io);
            // then create the internal order skus in the table of internal order skus
            const result = await this.dao.storeInternalOrderSku(ioFromDb.getId(), products);
            if (result) return statusCodes.CREATED();
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error creating the products for internal order ${ioFromDb.getId()}`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    updateInternalOrder = async (id, body) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const io = await this.dao.getInternalOrder(parsedId);
            if (!io)
                return statusCodes.NOT_FOUND(`No internal order found with id: ${id}`);

            let result = 0;
            switch (body.newState) {
                case 'COMPLETED':
                    result = await this.dao.storeInternalOrderSkuItems(io.getId(), body.products);
                default:
                    io.setState(body.newState);
                    result = await this.dao.updateInternalOrder(io);
                    break;
            }
            if (result) return statusCodes.OK(true);
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error updating the internal order ${io.getId()}`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    deleteInternalOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const io = await this.dao.getInternalOrder(parsedId);
            if (!io) return statusCodes.NOT_FOUND(`No internal order found with id: ${id}`);
            if (io.getState() !== 'ISSUED')
                return statusCodes.SERVICE_UNAVAILABLE(`Internal order ${id} is not in the ISSUED state, you can't delete an order that is not in the ISSUED state because it will cause inconsistencies`);

            const skuItems = await this.dao.getInternalOrderSkuItems(io.getId());
            if (skuItems && skuItems.length > 0) {
                // there are sku items with this io id
                // cannot delete
                return statusCodes.SERVICE_UNAVAILABLE(`There are sku items associated to internal order ${id}, you can't delete an order that has sku items associated to it`);
            }
            let result = await this.dao.deleteInternalOrderSku(io.getId());
            result += await this.dao.deleteInternalOrder(io.getId());
            
            if (result > 0) return statusCodes.NO_CONTENT();
            return statusCodes.SERVICE_UNAVAILABLE(`There was an error deleting the internal order ${io.getId()}`);
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

}

module.exports = InternalOrderService;