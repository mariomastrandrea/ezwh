const InternalOrder = require('../models/internalOrder');
const dayjs = require('dayjs');

// todo - verify params id
const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();

const internalOrderStates = ['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'];


const getAllInternalOrders = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllInternalOrders().then((ios) => {
            if (ios.length > 0) {
                ios.forEach(io => {
                    if(io.getState() === 'COMPLETED'){
                        let iosToReturn = [];
                        DbManagerInstance.getInternalOrderSkuItems(io.getId()).then((skuItems) => {
                            io.setSkuItems(skuItems);
                            ios.push(io);
                            
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                });

                return res.status(200).json(ios);
            } else {
                return res.status(500).send('Internal Server Error');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const getIssuedInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getInternalOrderInState('ISSUED').then((ios) => {
            if (ios.length > 0) {
                return res.status(200).json(ios);
            } else {
                return res.status(500).send('Internal Server Error');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

});

const getAcceptedInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getInternalOrderInState('ACCEPTED').then((ios) => {
            if (ios.length > 0) {
                return res.status(200).json(ios);
            } else {
                return res.status(500).send('Internal Server Error');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal Server Error')
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

});

const getInternalOrderById = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        if (!isNaN(req.params.id)) {
            DbManagerInstance.getInternalOrder(parseInt(req.params.id)).then((io) => {
                let ioToReturn;
                if(io.getState() === 'COMPLETED'){
                    DbManagerInstance.getInternalOrderSkuItems(io.getId()).then((skuItems) => {
                        io.setSkuItems(skuItems);
                    }).catch((err) => {
                        console.log(err);
                    });
                }
                ioToReturn = io;
                return res.status(200).json(ioToReturn);
            }).catch((err) => {
                console.log(err);
                return res.status(404).send('Not Found');
            });
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
});

const createInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try {
        if (
            dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm', true).isValid()
            && dayjs() >= dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm')
            && req.body.products.length > 0
            && !isNaN(req.body.customerId)
        ) {

            const products = req.body.products.map((p) => {
                if (!isNaN(p.SKUId) && !isNaN(p.qty) && !isNaN(p.price)
                    && p.qty > 0 && p.description && p.price > 0
                ) {
                    return {
                        SKUId: p.SKUId,
                        description: p.description,
                        price: p.price,
                        quantity: p.qty,
                    };
                } else return res.status(422).send('Unprocessable Entity');
            });

            DbManagerInstance.getNextAvailableId('internalOrder').then((id) => {


                const io = new InternalOrder(
                    dayjs(req.body.issueDate).format('YYYY/MM/DD HH:mm'),
                    products,
                    req.body.customerId,
                    state = 'ISSUED',
                    id
                );
                DbManagerInstance.storeInternalOrder(io.toJSON()).then((x) => {
                    if (x > 0) {
                        return res.status(201).send('Created');
                    } else {
                        return res.status(503).send('Service Unavailable');
                    }
                })
            }).catch((err) => {
                console.log(err);
                return res.status(503).send('Service Unavailable');
            });
        } else {
            return res.status(422).send('Unprocessable Entity');
        }
    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const updateInternalOrder = ((req, res) => {
    // todo add login check
    if(!true){
        return res.status(401).send('Unauthorized');
    }
    try{
        if(!isNaN(req.params.id) && internalOrderStates.includes(req.body.newState)){
            DbManagerInstance.getInternalOrder(parseInt(req.params.id)).then((io) => {
                DbManagerInstance.updateInternalOrder({id: io.getId(), state: req.body.newState}).then((x) => {
                    if(x > 0){
                        let returnValues = {status:200, message: 'OK'};
                        if(req.body.newState === 'COMPLETED'){
                            for(const product of req.body.products){
                                if(!product.SkuID ||!product.RFID || isNaN(product.SkuID) || isNaN(product.RFID) ){
                                    return res.status(422).send('Unprocessable Entity');
                                }
                            }
                            DbManagerInstance.storeInternalOrderSkuItems(io.getId(), req.body.products).then((x) => {
                                if(x <= 0){
                                    returnValues = {status:503, message: 'Service Unavailable'};
                                }
                            }).catch((err) => {
                                console.log(err);
                                returnValues = {status:503, message: 'Service Unavailable'};
                            });
                        }
                        return res.status(returnValues.status).send(returnValues.message);
                    }
                }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
            }).catch((err) => {
                console.log(err);
                return res.status(404).send('Not Found');
            });
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
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.deleteInternalOrder(parseInt(req.params.id)).then((x) => {
            if (x > 0) {
                DbManagerInstance.deleteInternalOrderSkuItems(parseInt(req.params.id)).then((y) => {}).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
                return res.status(200).send('OK');
            } else {
                return res.status(503).send('Service Unavailable');
            }
        }).catch((err) => {
            console.log(err);
            return res.status(503).send('Service Unavailable');
        });

    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

module.exports = {
    getAllInternalOrders, getIssuedInternalOrder, 
    getAcceptedInternalOrder, getInternalOrderById, 
    createInternalOrder, updateInternalOrder, deleteInternalOrder
};