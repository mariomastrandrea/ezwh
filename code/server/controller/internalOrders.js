const InternalOrder = require('../models/internalOrder');
const DbManager = require('../db/dbManager');
const dayjs = require('dayjs');

// todo - verify params id
const DbManagerInstance = new DbManager();

const internalOrderStates = ['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'];


const getAllInternalOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        // todo: add sqlite3 query
        const io = DbManagerInstance.getAllInternalOrders();
        if(io.length > 0) {
            return res.status(200).json(io);
        }
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

    return res.status(500).send('Internal Server Error');
});

const getIssuedInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        // todo add sqlite3 query
        const io = DbManagerInstance.getInternalOrderInState('ISSUED');
        if(io.length > 0) {
            return res.status(200).json(io);
        }
        return res.status(500).send('Internal Server Error');
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }

});

const getAcceptedInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        // todo add sqlite3 query
        const io = DbManagerInstance.getInternalOrderInState('ACCEPTED');

        if(io.length > 0) {
            return res.status(200).json(io);
        }
    }catch(err){
        return res.status(500).send('Internal Server Error');
    }
    return res.status(500).send('Internal Server Error');

});

const getInternalOrderById = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(req.params.id){
            // todo add sqlite3 query
            const internalOrder = DbManagerInstance.getInternalOrder(parseInt(req.params.id));

            if(internalOrder.length > 0) {
                return res.status(200).json(internalOrder);
            }else{
                return res.status(404).send('Not Found');
            }
        }
    } catch(err){
        return res.status(500).send('Internal Server Error');
    }
});

const createInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(req.body.issueDate && req.body.products && req.body.customerId){
            // to do add sqlite3 query to check get last id
            const id = DbManagerInstance.getNextAvailableIOId();
            const internalOrder = new InternalOrder(
                id,
                dayjs(req.body.issueDate).format('YYYY-MM-DD HH:mm'),
                req.body.products,
                req.body.customerId
            );
            if(internalOrder){
                newLength = DbManagerInstance.storeInternalOrder(internalOrder);
                if (newLength > id) return res.status(201).send('Created');
                return res.status(500).send('Creation error');
            }
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        return res.status(503).send('Service Unavailable');
    }
});

const updateInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(req.params.id && internalOrderStates.includes(req.body.newState)){
            // todo add sqlite3 query
            const internalOrder = DbManagerInstance.getInternalOrder(parseInt(req.params.id));
            if(internalOrder.length > 0){
                internalOrder[0].setState(req.body.newState);
                if (req.body.newState === 'COMPLETED') {
                    if(req.body.products){
                        internalOrder[0].setProducts(req.body.products);
                    }else {
                        return res.status(422).send('Unprocessable Entity');
                    }
                }
                // todo add sqlite3 query to push updated internal order
                DbManagerInstance.updateInternalOrder(internalOrder[0]);
                return res.status(200).send('OK');
            }else {
                return res.status(404).send('Not Found');
            }
        }else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(req.params.id){
            // todo add sqlite3 query
            const internalOrder = DbManagerInstance.getInternalOrder(parseInt(req.params.id));
            // todo add sqlite3 query to delete internal order
            DbManagerInstance.deleteInternalOrder(internalOrder[0].getId());
            return res.status(204).send('No Content');
        } else{
            return res.status(422).send('Unprocessable Entity');
        }
    }catch(err){
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllInternalOrders, getIssuedInternalOrder, 
    getAcceptedInternalOrder, getInternalOrderById, 
    createInternalOrder, updateInternalOrder, deleteInternalOrder
};