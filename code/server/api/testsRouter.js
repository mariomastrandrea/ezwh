const express = require('express');
const router = express.Router();

/**
 * TestDescriptor
 */

const {
    getAllTestDescriptors,
    getTestDescriptor,
    createTestDescriptor,
    updateTestDescriptor,
    deleteTestDescriptor
} = require('../controller/testDescriptors');

router.get('/testDescriptors', getAllTestDescriptors);
router.get('/testDescriptors/:id', getTestDescriptor);
router.post('/testDescriptor', createTestDescriptor);
router.put('/testDescriptor/:id', updateTestDescriptor);
router.delete('/testDescriptor/:id', deleteTestDescriptor);

/**
 * TestResult
 */

const {
    getTestResultsBySkuItem,
    getTestResult,
    createTestResult,
    updateTestResult,
    deleteTestResult
} = require('../controller/testResults');

router.get('/skuitems/:rfid/testResults', getTestResultsBySkuItem);
router.get('/skuitems/:rfid/testResults/:id', getTestResult);
router.post('/skuitems/testResult', createTestResult);
router.put('/skuitems/:rfid/testResult/:id', updateTestResult);
router.delete('/skuitems/:rfid/testResult/:id', deleteTestResult);

// module export
module.exports = router