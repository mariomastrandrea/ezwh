const RestockOrder = require('../models/restockOrder');
const dayjs = require('dayjs');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();
const restockOrderStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];

async function getAllRestockOrders(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const ros = await DbManagerInstance.getAllRestockOrders();
        for (let ro of ros) {
            const products = await DbManagerInstance.getRestockOrderSku(ro.getId());
            ro.setProducts(products);

            if (ro.getState() != 'ISSUED' || ro.getState() != 'DELIVERY') {
                const skuItems = await DbManagerInstance.getRestockOrderSkuItems(ro.getId());
                ro.setSkuItems(skuItems);
            }
        }
        res.status(200).json(ros);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getIssuedRestockOrders(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const ros = await DbManagerInstance.getRestockOrdersInState('ISSUED');
        for (let ro of ros) {
            const products = await DbManagerInstance.getRestockOrderSku(ro.getId());
            ro.setProducts(products);
        }
        res.status(200).json(ros);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getRestockOrderById(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (!isNaN(req.params.id)) {
            const ro = await DbManagerInstance.getRestockOrder(parseInt(req.params.id));
            if (ro) {
                const products = await DbManagerInstance.getRestockOrderSku(ro.getId());
                ro.setProducts(products);
                if (ro.getState() != 'ISSUED' || ro.getState() != 'DELIVERY') {
                    const skuItems = await DbManagerInstance.getRestockOrderSkuItems(ro.getId());
                    ro.setSkuItems(skuItems);
                }
                return res.status(200).json(ro);
            }
            return res.status(404).send('Not Found');
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

async function getReturnItemsByRestockOrderId(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (!isNaN(req.params.id)) {
            const ro = await DbManagerInstance.getRestockOrder(parseInt(req.params.id));
            if (!ro)
                return res.status(404).send('Not Found');
            if (ro.getState() != 'COMPLETEDRETURN')
                return res.status(422).send('Unprocessable Entity');
            const ris = await DbManagerInstance.getReturnItemsByRestockOrderId(req.params.id);
            return res.status(200).json(ris);
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }
};

async function createRestockOrder(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (
            // first validate the request body
            dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm', true).isValid()
            && dayjs() >= dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm')
            && req.body.products.length > 0
            && !isNaN(req.body.supplierId)
        ) {
            // then validate request body products
            const products = req.body.products.map((p) => {
                if (!isNaN(p.SKUId) && !isNaN(p.qty) && !isNaN(p.price)
                    && p.qty > 0 && p.description && p.price > 0
                ) {
                    return {
                        SKUId: p.SKUId,
                        description: p.description,
                        price: p.price,
                        quantity: p.qty,
                    };
                } else return res.status(422).send('Unprocessable Entity');
            });

            const ro = new RestockOrder(
                dayjs(req.body.issueDate).format('YYYY/MM/DD HH:mm'),
                products,
                req.body.supplierId
            );
            // first create the restock order in the table of restock orders
            const roFromDb = await DbManagerInstance.storeRestockOrder(ro);
            // then create the restock order skus in the table of restock order skus
            const result = await DbManagerInstance.storeRestockOrderSku(roFromDb.getId(), products);
            if (result) return res.status(201).send('Created');
            // todo if result = false ?
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
};

async function updateRestockOrder(req, res) {
    // manage different api calls
    // type is an api identifier
    let type;

    if (req.route.path.includes('skuItems'))
        type = 'skuItems';
    else if (req.route.path.includes('transportNote'))
        type = 'transportNote';
    else type = 'state';
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        const ro = await DbManagerInstance.getRestockOrder(parseInt(req.params.id));
        if (!ro) return res.status(404).send('Not Found');

        let result = 0;
        switch (type) {
            case 'skuItems':
                if (
                    // todo validator
                    req.body.skuItems &&
                    req.body.skuItems.length > 0
                    && ro.getState() != 'DELIVERED'
                ) {
                    result = await DbManagerInstance.storeRestockOrderSkuItems(ro.getId(), req.body.skuItems);
                } else {
                    return res.status(422).send('Unprocessable Entity');
                }
                break;
            case 'state':
                if (
                    // todo validator
                    req.body.newState &&
                    restockOrderStates.includes(req.body.newState)
                ) {
                    ro.setState(req.body.newState);
                    result = await DbManagerInstance.updateRestockOrder(ro);
                } else {
                    return res.status(422).send('Unprocessable Entity');
                }
                break;
            case 'transportNote':
                if (
                    // todo validator
                    req.body.transportNote &&
                    req.body.transportNote.length > 0
                    && req.body.transportNote.deliveryDate
                    && dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD HH:mm', true).isValid()
                    && dayjs(ro.getIssueDate()) <= dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD HH:mm')
                    && ro.getState() != 'DELIVERY'
                ) {
                    ro.setTransportNote(req.body.transportNote);
                    result = await DbManagerInstance.updateRestockOrder(ro);
                } else {
                    return res.status(422).send('Unprocessable Entity');
                }
                break;
        }
        if (result) return res.status(200).send('OK');
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
};

async function deleteRestockOrder(req, res) {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        const ro = await DbManagerInstance.getRestockOrder(parseInt(req.params.id));
        if (!ro) return res.status(404).send('Not Found');

        const skuItems = await DbManagerInstance.getRestockOrderSkuItems(ro.getId());
        const sku = await DbManagerInstance.getRestockOrderSku(ro.getId());
        if ( skuItems || sku ) {
            // there are sku items or sku with this ro id
            // cannot delete
            //return res.status(409).send('Conflict');
            return res.status(503).send('Service Unavailable');
        }
        const result = await DbManagerInstance.deleteRestockOrder(ro.getId());
        if (result) return res.status(204).send('No Content');

    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
};

module.exports = {
    getAllRestockOrders,
    getIssuedRestockOrders,
    getRestockOrderById,
    getReturnItemsByRestockOrderId,
    createRestockOrder,
    updateRestockOrder,
    deleteRestockOrder,
}
