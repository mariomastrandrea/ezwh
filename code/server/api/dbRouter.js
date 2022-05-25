const express = require('express');
const router = express.Router();

const { deleteAll, insertSamples } = require('../db/dbUtilities');

router.get('/deleteAll', async (req, res) => {
    try {
        await deleteAll();
        return res.status(200).send();
    }
    catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/insertSamples', async (req, res) => {
    try {
        await insertSamples();
        return res.status(200).send();
    }
    catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

module.exports = router;