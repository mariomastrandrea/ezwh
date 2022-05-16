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
            if (!io) return statusCodes.NOT_FOUND();

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
            return statusCodes.SERVICE_UNAVAILABLE();
        } catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };

    updateInternalOrder = async (id, body) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const io = await this.dao.getInternalOrder(parsedId);
            if (!io)
                return statusCodes.NOT_FOUND();

            let result = 0;
            switch (body.newState) {
                case 'COMPLETED':
                    result = await this.dao.storeInternalOrderSkuItems(io.getId(), body.products);
                case 'ACCEPTED':
                    io.setState(body.newState);
                    result = await this.dao.updateInternalOrder(io);
                    break;
            }
            if (result) return statusCodes.OK(true);
            return statusCodes.SERVICE_UNAVAILABLE();
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

    deleteInternalOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const io = await this.dao.getInternalOrder(parsedId);
            if (!io) return statusCodes.NOT_FOUND();

            if (io.getState() !== 'ISSUED')
                return statusCodes.SERVICE_UNAVAILABLE();

            const skuItems = await this.dao.getInternalOrderSkuItems(io.getId());
            if (skuItems && skuItems.length > 0) {
                // there are sku items with this io id
                // cannot delete
                return statusCodes.SERVICE_UNAVAILABLE();
            }
            let result = await this.dao.deleteInternalOrderSku(io.getId());
            result += await this.dao.deleteInternalOrder(io.getId());
            if (result > 0) return statusCodes.NO_CONTENT();
            return statusCodes.SERVICE_UNAVAILABLE();
        } catch (err) {
            console.log(err);
            return statusCodes.SERVICE_UNAVAILABLE();
        }
    };

}

module.exports = InternalOrderService;