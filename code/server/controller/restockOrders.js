const RestockOrder = require('../models/restockOrder');
const dayjs = require('dayjs');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();
const restockOrderStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];


const getAllRestockOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        const ro = DbManagerInstance.getAllRestockOrders();
        if (ro.length > 0) {
            return res.status(200).json(ro);
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }

    return res.status(500).send('Internal Server Error');
});

const getIssuedRestockOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        const ro = DbManagerInstance.getRestockOrdersInState('ISSUED');
        if (ro.length > 0) {
            return res.status(200).json(ro);
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }
    return res.status(500).send('Internal Server Error');
});

const getRestockOrderById = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            const ro = DbManagerInstance.getRestockOrder(parseInt(req.params.id));
            if (ro.length > 0) {
                return res.status(200).json(ro);
            }else{
                return res.status(404).send('Not Found');
            }
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }
});

// const getReturnItemsByRestockOrderId = ((req, res) => {
//     // todo add login check
//     if(!true){
//         return res.status(401).send('Unauthorized');
//     }
//     try{
//         if(!isNaN(req.params.id)){
//             const ro = DbManagerInstance.getReturnItemsByRestockOrderId(parseInt(req.params.id));
//             if (ro.length > 0) {
//                 return res.status(200).json(ro);
//                 // todo check order status
//             }else{
//                 return res.status(404).send('Not Found');
//             }
//         }else{
//             return res.status(422).send('Unprocessable Entity');
//         }
//     }catch(err){
//         return res.status(500).send('Internal Server Error');
//     }
// });

const createRestockOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(
            dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm', true).isValid()
            && dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm') <= dayjs()
            && req.body.products
            && !isNaN(req.body.supplierId)){
            
            const id = DbManagerInstance.getNextAvailableRestockOId();
            const restockOrder = new RestockOrder(
                id,
                dayjs(req.body.issueDate).format('YYYY/MM/DD HH:mm'),
                req.body.products,
                parseInt(req.body.supplierId),
            );
            if (restockOrder) {
                newLength = DbManagerInstance.storeRestockOrder(restockOrder);
                if (newLength+1 > id) return res.status(201).json(restockOrder);
                return res.status(503).send('Service Unavailable');
            }
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
    return res.status(500).send('Internal Server Error');
});

const updateRestockOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            const ro = DbManagerInstance.getRestockOrder(parseInt(req.params.id));
            if (ro.length > 0) {
                if (req.body.newState) {
                    if (restockOrderStates.includes(req.body.newState)) {
                        ro[0].setState(req.body.newState);
                    }else{
                        return res.status(422).send('Unprocessable Entity');
                    }
                }

                if(req.body.skuItems) {
                    // todo check delivered
                    if (req.body.skuItems.length > 0) {
                        ro[0].setSkuItems(req.body.skuItems);
                    }else{
                        return res.status(422).send('Unprocessable Entity');
                    }
                }

                if(req.body.transportNote){
                    if (req.body.transportNote.deliveryDate) {
                        if(dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD HH:mm', true).isValid() ){
                        ro[0].setTransportNote(req.body.transportNote);
                        }else {
                            return res.status(422).send('Unprocessable Entity');
                        }
                    }
                }
                DbManagerInstance.updateRestockOrder(ro[0]);
                return res.status(200).send('OK');
            }else{
                return res.status(404).send('Not Found');
            }
        }else {
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteRestockOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            const ro = DbManagerInstance.getRestockOrder(parseInt(req.params.id));
            DbManagerInstance.deleteRestockOrder(ro[0].getId());
            return res.status(204).send('No Content');
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllRestockOrders,
    getIssuedRestockOrders,
    getRestockOrderById,
    // getReturnItemsByRestockOrderId,
    createRestockOrder,
    updateRestockOrder,
    deleteRestockOrder,
}
