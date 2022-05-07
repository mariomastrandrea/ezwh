const Sku = require('../models/sku');
const SkuItem = require('../models/skuItem');
const DbManager = require('../db/dbManager');
const dayjs = require('dayjs');
const DbManagerInstance = DbManager.getInstance();

const getAllSkuItems = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        DbManagerInstance.getAllSkuItems().then((skuItems) => {
            if (skuItems.length > 0) {
                return res.status(200).json(skuItems);
            }else{
                return res.status(500).send('Internal Server Error');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')});
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const getAvailableSkuItems = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(isNaN(req.params.id)){
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getAvailableSkuItems(parseInt(req.params.id)).then((skuItems) => {
            if (skuItems.length > 0) {
                return res.status(200).json(skuItems);
            }else{
                return res.status(404).send('Not Found');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')}
        );
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const getSkuItem = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        console.log(typeof req.params.rfid);
        if(isNaN(req.params.rfid)){
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSkuItem(req.params.rfid).then((skuItem) => {
            if (skuItem) {
                return res.status(200).json(skuItem);
            }
            return res.status(404).send('Not Found');
        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found')}
        );
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createSkuItem = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(
            !isNaN(req.body.RFID)
            && !isNaN(req.body.SKUId)
            && dayjs(req.body.DateOfStock).isValid()
            && dayjs() >= dayjs(req.body.DateOfStock)
        ){
            const skuItem = new SkuItem(
                req.body.RFID,
                parseInt(req.body.SKUId),
                dayjs(req.body.DateOfStock).format('YYYY/MM/DD HH:mm'),
            );
            DbManagerInstance.storeSkuItem(skuItem.toJSON()).then(() => {
                return res.status(201).send('Created');
            }
            ).catch((err) => {
                console.log(err);
                return res.status(503).send('Service Unavailable')}
            );
        }else{
            console.log();
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateSkuItem = ((req, res) => {
    // todo update 
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(isNaN(req.params.rfid)){
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSkuItem(req.params.rfid).then( (skuItem) => {
            if(req.body.newRFID){
                skuItem.setRfid(req.body.newRFID);
            }
            if(req.body.newAvailable){
                if(
                    !isNaN(req.body.newAvailable)
                    && parseInt(req.body.newAvailable) >= 0 
                    && parseInt(req.body.newAvailable) <= 1
                    ) skuItem.setAvailable(parseInt(req.body.newAvailable));
                else return res.status(422).send('Unprocessable Entity');
            }
            if(req.body.newDateOfStock){
                if(
                    dayjs(req.body.newDateOfStock).isValid()
                    && dayjs() >= dayjs(req.body.newDateOfStock)
                ) skuItem.setDateOfStock(dayjs(req.body.newDateOfStock).format('YYYY/MM/DD HH:mm'));
                else return res.status(422).send('Unprocessable Entity');
            }
            DbManagerInstance.updateSkuItem(skuItem.toJSON()).then( (x) => {
                if(x>0){
                    return res.status(200).send('OK');
                }else {
                    return res.status(503).send('Service Unavailable');
                }
            }).catch( (err) => {
                console.log(err);
                return res.status(503).send('Service Unavailable');
            });

        }).catch( (err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });

    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteSkuItem = ((req, res) => {
    // todo update
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(isNaN(req.params.rfid)){
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getSkuItem(req.params.rfid).then( (skuItem) => {
            if(skuItem){
                DbManagerInstance.deleteSkuItem(skuItem.getRfid()).then( (x) => {
                    if(x>0){
                        return res.status(200).send('OK');
                    }
                    return res.status(503).send('Service Unavailable');
                }).catch( (err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                }
                );
            }else{
                return res.status(404).send('Not Found');
            }
        }).catch( (err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        }
        );
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllSkuItems,
    getAvailableSkuItems,
    getSkuItem,
    createSkuItem,
    updateSkuItem,
    deleteSkuItem
};

