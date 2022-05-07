const express = require('express')
const router = express.Router()

const { 
    getAllTestDescriptors,
    getTestDescriptor,
    createTestDescriptor,
    updateTestDescriptor,
    deleteTestDescriptor
} = require('../controller/testDescriptors')

router.get('/testDescriptors', getAllTestDescriptors)
router.get('/testDescriptors/:id', getTestDescriptor)

router.post('/testDescriptor', createTestDescriptor)

router.put('/testDescriptor/:id', updateTestDescriptor)

router.delete('/testDescriptor/:id', deleteTestDescriptor)


module.exports = router