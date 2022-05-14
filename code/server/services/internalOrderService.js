const InternalOrder = require('../models/internalOrder');

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
                        const skuItems = await this.dao.getInternalOrderSku(ro.getId());
                        io.setSkuItems(skuItems);
                    }
                }
            }
            return { success: ios, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };


    getIssuedInternalOrder = async () => {
        try {
            const ios = await this.dao.getInternalOrderInState('ISSUED');
            if (ios && ios.length > 0) {
                for (let io of ios) {
                    const products = await this.dao.getInternalOrderSku(io.getId());
                    io.setProducts(products);
                }
            }
            return { success: ios, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    getAcceptedInternalOrder = async () => {
        try {
            const ios = await this.dao.getInternalOrderInState('ACCEPTED');
            if (ios && ios.length > 0) {
                for (let io of ios) {
                    const products = await this.dao.getInternalOrderSku(io.getId());
                    io.setProducts(products);
                }
            }
            return { success: ios, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
        }
    };

    getInternalOrderById = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);
            const io = await this.dao.getInternalOrder(parsedId);
            if (!io) return { error: 'Not Found', code: 404 };

            const products = await this.dao.getInternalOrderSku(io.getId());
            ro.setProducts(products);
            if (io.getState() === 'COMPLETED') {
                const skuItems = await this.dao.getInternalOrderSkuItems(ro.getId());
                io.setSkuItems(skuItems);
            }
            return { success: io, code: 200 };
        } catch (err) {
            console.log(err);
            return { error: "Internal Server Error", code: 500 };
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
            if (result) return { success: 'Created', code: 201 };
            return { error: "Service Unavailable", code: 503 };
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
                return { error: 'Not Found', code: 404 };

            let result = 0;
            switch (body.newState) {
                case 'COMPLETED':
                    result = await this.dao.storeInternalOrderSkuItems(io.getId(), body.skuItems);
                case 'ACCEPTED':
                    io.setState(body.newState);
                    result = await this.dao.updateInternalOrder(ro);
                    break;
            }
            if (result) return { success: true, code: 200 };
            return { error: "Service Unavailable", code: 503 };
        } catch (err) {
            console.log(err);
            return { error: "Service Unavailable", code: 503 };
        }
    };

    deleteInternalOrder = async (id) => {
        try {
            const parsedId = typeof id === 'number' ? id : parseInt(id);

            const io = await this.dao.getInternalOrder(parsedId);
            if (!io) return { error: 'Not Found', code: 404 };

            if (io.getState() !== 'ISSUED')
                return { error: 'Service Unavailable', code: 503 };

            const skuItems = await this.dao.getInternalOrderSkuItems(io.getId());
            if (skuItems && skuItems.length > 0) {
                // there are sku items with this io id
                // cannot delete
                return { error: 'Service Unavailable', code: 503 };
            }
            let result = await this.dao.deleteInternalOrderSku(io.getId());
            result += await this.dao.deleteInternalOrder(io.getId());
            if (result > 0) return { success: "No Content", code: 204 };
            return { error: 'Service Unavailable', code: 503 };
        } catch (err) {
            console.log(err);
            return { error: 'Service Unavailable', code: 503 };
        }
    };

}

module.exports = InternalOrderService;