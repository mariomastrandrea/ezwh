const express = require('express')
const router = express.Router()

const { 
    getAllInternalOrders, getIssuedInternalOrder, 
    getAcceptedInternalOrder, getInternalOrderById,
    createInternalOrder, updateInternalOrder, deleteInternalOrder

} = require('../controller/internalOrders')

router.get('/internalOrders', getAllInternalOrders)
router.get('/internalOrdersIssued', getIssuedInternalOrder)
router.get('/internalOrdersAccepted', getAcceptedInternalOrder)
router.get('/internalOrders/:id', getInternalOrderById)

router.post('/internalOrders', createInternalOrder)
router.put('/internalOrders/:id', updateInternalOrder)
router.delete('/internalOrders/:id', deleteInternalOrder)
module.exports = router