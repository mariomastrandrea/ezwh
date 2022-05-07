const dayjs = require('dayjs');
const ReturnOrder = require('../models/returnOrder');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();
const getAllReturnOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        // todo add sqlite3 query
        const ros = DbManagerInstance.getAllReturnOrders();
        if(ros.length > 0) {
            return res.status(200).json(ros);
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }
    return res.status(500).send('Internal Server Error');
});

const getReturnOrderById = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            // todo add sqlite3 query
            const returnOrder = DbManagerInstance.getReturnOrder(parseInt(req.params.id));

            if(returnOrder.length > 0) {
                return res.status(200).json(returnOrder);
            }else{
                return res.status(404).send('Not Found');
            }
        }else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch(err){
        return res.status(500).send('Internal Server Error');
    }
});

const createReturnOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(
            dayjs(req.body.returnDate, 'YYYY/MM/DD HH:mm', true).isValid() 
            && req.body.products && !isNaN(req.body.restockOrderId)){
            // to do add sqlite3 query to check get last id
            const id = DbManagerInstance.getNextAvailableReturnOId();
            console.log(id);
            if(!DbManagerInstance.getRestockOrder(parseInt(req.body.restockOrderId))){
                return res.status(404).send('Not Found');
            }
            const returnOrder = new ReturnOrder(
                id,
                dayjs(req.body.returnDate).format('YYYY-MM-DD HH:mm'),
                req.body.products,
                req.body.restockOrderId
            );
            console.log(returnOrder);
            if(returnOrder){
                newLength = DbManagerInstance.storeReturnOrder(returnOrder);
                if (newLength+1 > id) return res.status(201).send('Created');
                return res.status(500).send('Creation error');
            }
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteReturnOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id)){
            // todo add sqlite3 query
            const returnOrder = DbManagerInstance.getReturnOrder(parseInt(req.params.id));
            // todo add sqlite3 query to delete internal order
            DbManagerInstance.deleteReturnOrder(returnOrder[0].getId());
            return res.status(204).send('No Content');
        } else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllReturnOrders,
    getReturnOrderById,
    createReturnOrder,
    deleteReturnOrder
}