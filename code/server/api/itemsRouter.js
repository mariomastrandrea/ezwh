const express = require('express');
const router = express.Router();

/**
 * Sku
 */

const {
    getAllSkus,
    getSkuById,
    createSku,
    updateSkuPosition,
    updateSku,
    deleteSku
} = require('../controller/skus');

router.get('/skus', getAllSkus);
router.get('/skus/:id', getSkuById);
router.post('/sku', createSku);
router.put('/sku/:id', updateSku);
router.put('/sku/:id/position', updateSkuPosition);
router.delete('/skus/:id', deleteSku);


/**
 * SkuItem
 */

const {
    getAllSkuItems,
    getAvailableSkuItems,
    getSkuItem,
    createSkuItem,
    updateSkuItem,
    deleteSkuItem
} = require('../controller/skuItems');

router.get('/skuitems', getAllSkuItems);
router.get('/skuitems/sku/:id', getAvailableSkuItems);
router.get('/skuitems/:rfid', getSkuItem);
router.post('/skuitem', createSkuItem);
router.put('/skuitems/:rfid', updateSkuItem);
router.delete('/skuitems/:rfid', deleteSkuItem);

/**
 * Item
 */

const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controller/items');

router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/item', createItem);
router.put('/item/:id', updateItem);
router.delete('/items/:id', deleteItem);

// module export
module.exports = router;