const express = require('express');
const Joi = require('joi');
const router = express.Router();

/**
 * InternalOrder
 */

const {
    getAllInternalOrders,
    getIssuedInternalOrder,
    getAcceptedInternalOrder,
    getInternalOrderById,
    createInternalOrder,
    updateInternalOrder,
    deleteInternalOrder
} = require('../controller/internalOrders');

// internal orders routes
router.get('/internalOrders', getAllInternalOrders);
router.get('/internalOrdersIssued', getIssuedInternalOrder);
router.get('/internalOrdersAccepted', getAcceptedInternalOrder);
router.get('/internalOrders/:id', getInternalOrderById);
router.post('/internalOrders', createInternalOrder);
router.put('/internalOrders/:id', updateInternalOrder);
router.delete('/internalOrders/:id', deleteInternalOrder);


/**
 * ReturnOrder
 */

const {
    getAllReturnOrders,
    getReturnOrderById,
    createReturnOrder,
    deleteReturnOrder
}
    = require('../controller/returnOrders');

// return orders routes
router.get('/returnOrders', getAllReturnOrders);
router.get('/returnOrders/:id', getReturnOrderById);
router.post('/returnOrder', createReturnOrder);
router.delete('/returnOrder/:id', deleteReturnOrder);


/**
 * RestockOrder
 */

const {
    getAllRestockOrders,
    getRestockOrderById,
    getIssuedRestockOrders,
    createRestockOrder,
    updateRestockOrder,
    deleteRestockOrder
} = require('../controller/restockOrders');

// restock orders routes
router.get('/restockOrders', getAllRestockOrders);
router.get('/restockOrders/:id', getRestockOrderById);
router.get('/restockOrdersIssued', getIssuedRestockOrders);
//router.get('/restockOrders/:id/returnitems', getReturnItemsByRestockOrderId)
router.post('/restockOrder', createRestockOrder);
router.put('/restockOrder/:id', updateRestockOrder);
router.put('/restockOrder/:id/skuItems', updateRestockOrder);
router.put('/restockOrder/:id/transportNote', updateRestockOrder);
router.delete('/restockOrder/:id', deleteRestockOrder);

// module export
module.exports = router;