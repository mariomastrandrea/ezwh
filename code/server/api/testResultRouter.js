const express = require('express')
const router = express.Router()

const { 
    getTestResultsBySkuItem,
    getTestResult,
    createTestResult,
    updateTestResult,
    deleteTestResult
} = require('../controller/testResults')

router.get('/skuitems/:rfid/testResults', getTestResultsBySkuItem)
router.get('/skuitems/:rfid/testResults/:id', getTestResult)

router.post('/skuitems/testResult', createTestResult)

router.put('/skuitems/:rfid/testResult/:id', updateTestResult)

router.delete('/skuitems/:rfid/testResult/:id', deleteTestResult)


module.exports = router