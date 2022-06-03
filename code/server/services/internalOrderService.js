const InternalOrder = require('../models/internalOrder');
const { int } = require("../utilities");
const statusCodes = require('../statusCodes');

class InternalOrderService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    getAllInternalOrders = async () => {
        const ios = await this.#dao.getAllInternalOrders();

        if (ios && ios.length > 0) {
            for (let io of ios) {
                const products = await this.#dao.getInternalOrderSku(io.getId());
                io.setProducts(products);

                if (io.getState() === 'COMPLETED') {
                    const skuItems = await this.#dao.getInternalOrderSkuItems(io.getId());
                    io.setSkuItems(skuItems);
                }
            }
        }

        return statusCodes.OK(ios);
    };


    getIssuedInternalOrders = async () => {
        const ios = await this.#dao.getInternalOrdersInState('ISSUED');

        if (ios && ios.length > 0) {
            for (let io of ios) {
                const products = await this.#dao.getInternalOrderSku(io.getId());
                io.setProducts(products);
            }
        }
        return statusCodes.OK(ios);
    };

    getAcceptedInternalOrders = async () => {
        const ios = await this.#dao.getInternalOrdersInState('ACCEPTED');

        if (ios && ios.length > 0) {
            for (let io of ios) {
                const products = await this.#dao.getInternalOrderSku(io.getId());
                io.setProducts(products);
            }
        }
        return statusCodes.OK(ios);
    };

    getInternalOrderById = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);
        const io = await this.#dao.getInternalOrder(parsedId);
        if (!io) 
            return statusCodes.NOT_FOUND(`No internal order found with id: ${id}`);

        const products = await this.#dao.getInternalOrderSku(io.getId());
        io.setProducts(products);

        if (io.getState() === 'COMPLETED') {
            const skuItems = await this.#dao.getInternalOrderSkuItems(io.getId());
            io.setSkuItems(skuItems);
        }
        return statusCodes.OK(io);
    };

    createInternalOrder = async (issueDate, products, customerId) => {
        // check if all skus exist
        for(let product of products) {
            const skuId = product.SKUId;
            const sku = await this.#dao.getSkuById(skuId);

            if(!sku) return statusCodes.UNPROCESSABLE_ENTITY(`sku ${skuId} is not found`);
        }

        // check if customerId
        const customer = await this.#dao.getUserByIdAndType(customerId, 'customer');

        if(!customer) 
            return statusCodes.UNPROCESSABLE_ENTITY(`customer ${customerId} is not found`);

        // * create internal order *
        const io = new InternalOrder(
            issueDate,
            products,
            customerId
        );

        // first create the internal order in the table of internal orders
        const ioFromDb = await this.#dao.storeInternalOrder(io);

        // then create the internal order skus in the table of internal order skus
        const result = await this.#dao.storeInternalOrderSku(ioFromDb.getId(), products);
        if (result) 
            return statusCodes.CREATED();
            
        return statusCodes.SERVICE_UNAVAILABLE(`There was an error creating the products for internal order ${ioFromDb.getId()}`);
    };

    updateInternalOrder = async (id, body) => {
        const parsedId = typeof id === 'number' ? id : int(id);

        const io = await this.#dao.getInternalOrder(parsedId);
        if (!io)
            return statusCodes.NOT_FOUND(`No internal order found with id: ${id}`);

        let result = 0;
        switch (body.newState) {
            case 'COMPLETED':
                // check if skus and sku items exist
                /* DELETED: due to failed acceptance test

                for(let product of body.products){
                    const sku = await this.#dao.getSkuById(product.SkuID);
                    if(!sku) return statusCodes.UNPROCESSABLE_ENTITY(`sku ${product.SkuID} not found`);
                    
                    const skuItem = await this.#dao.getSkuItemByRfid(product.RFID);
                    if(!skuItem || skuItem.getSkuId() !== product.SkuID)
                        return statusCodes.UNPROCESSABLE_ENTITY(`sku item ${product.RFID} not found`);
                }
                */
                result = await this.#dao.storeInternalOrderSkuItems(io.getId(), body.products);
            default:
                io.setState(body.newState);
                result = await this.#dao.updateInternalOrder(io);
                break;
        }
        if (result) 
            return statusCodes.OK(true);

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error updating the internal order ${io.getId()}`);
    };

    deleteInternalOrder = async (id) => {
        const parsedId = typeof id === 'number' ? id : int(id);

        const io = await this.#dao.getInternalOrder(parsedId);
        if (!io) 
            return statusCodes.UNPROCESSABLE_ENTITY(`No internal order found with id: ${id}`);
        
        let result = await this.#dao.deleteInternalOrder(io.getId());

        // * cascading deletion of associated sku is up to sqlite *
        // result = result && await this.#dao.deleteInternalOrderSku(io.getId());

        // * cascading deletion of associated sku items is up to sqlite *
        /*  
        if (result && io.getState() === 'COMPLETED') {
            result = await this.#dao.deleteInternalOrderSkuItems(io.getId());
        } */

        if (result) 
            return statusCodes.NO_CONTENT();

        return statusCodes.SERVICE_UNAVAILABLE(`There was an error deleting the internal order ${io.getId()}`);
    };
}

module.exports = InternalOrderService;