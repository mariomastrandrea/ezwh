const express = require('express');
const router = express.Router();

const DbManager = require('../db/dbManager');
const dao = DbManager();

const tables = ['InternalOrderSkuItem',
    'InternalOrderSku',
    'InternalOrder',
    'Item',
    'ReturnOrderSkuItem',
    'ReturnOrder',
    'RestockOrderSkuItem',
    'RestockOrderSku',
    'RestockOrder',
    'TestResult',
    'TestDescriptor',
    'SkuItem',
    'Sku',
    'Position',
    'User'];

router.get('/deleteAll', async (req, res) => {
    try {
        for (let t of tables) {
            await dao.deleteTable(t);
            await dao.deleteFromSequence(t);
        }

        return res.status(200).send();
    }
    catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/insertSamples', async (req, res) => {
    try {
        for (let t of tables.reverse()) {
            await dao.insertSamples(t);
        }

        return res.status(200).send();
    }
    catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

module.exports = router;