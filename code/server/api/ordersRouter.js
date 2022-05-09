const express = require('express')
const router = express.Router()

const { 
    getAllInternalOrders, getIssuedInternalOrder, 
    getAcceptedInternalOrder, getInternalOrderById,
    createInternalOrder, updateInternalOrder, deleteInternalOrder

} = require('../controller/internalOrders')

const {
    getAllReturnOrders, getReturnOrderById,
    createReturnOrder, updateReturnOrder, deleteReturnOrder
}
= require('../controller/returnOrders')

const {
    getAllRestockOrders, getRestockOrderById, getIssuedRestockOrders,
    createRestockOrder, updateRestockOrder, deleteRestockOrder
} = require('../controller/restockOrders')

// internal orders routes
router.get('/internalOrders', getAllInternalOrders)
router.get('/internalOrdersIssued', getIssuedInternalOrder)
router.get('/internalOrdersAccepted', getAcceptedInternalOrder)
router.get('/internalOrders/:id', getInternalOrderById)

router.post('/internalOrders', createInternalOrder)
router.put('/internalOrders/:id', updateInternalOrder)
router.delete('/internalOrders/:id', deleteInternalOrder)

// return orders routes
router.get('/returnOrders', getAllReturnOrders)
router.get('/returnOrders/:id', getReturnOrderById)

router.post('/returnOrder', createReturnOrder)
router.delete('/returnOrder/:id', deleteReturnOrder)

// restock orders routes
router.get('/restockOrders', getAllRestockOrders)
router.get('/restockOrders/:id', getRestockOrderById)
router.get('/restockOrdersIssued', getIssuedRestockOrders)
//router.get('/restockOrders/:id/returnitems', getReturnItemsByRestockOrderId)

router.post('/restockOrder', createRestockOrder)
router.put('/restockOrder/:id', updateRestockOrder)
router.put('/restockOrder/:id/skuItems', updateRestockOrder)
router.put('/restockOrder/:id/transportNote', updateRestockOrder)
router.delete('/restockOrder/:id', deleteRestockOrder)


module.exports = router