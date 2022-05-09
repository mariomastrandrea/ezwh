const RestockOrder = require('../models/restockOrder');
const dayjs = require('dayjs');

const DbManager = require('../db/dbManager');
const DbManagerInstance = DbManager.getInstance();
const restockOrderStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];

const getAllRestockOrders = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getAllRestockOrders().then((ros) => {
            if (ros.length > 0) {
                return res.status(200).json(ros);
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

const getIssuedRestockOrders = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        DbManagerInstance.getRestockOrdersInState('ISSUED').then((ros) => {
            if (ros.length > 0) {
                return res.status(200).json(ros);
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

const getRestockOrderById = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (!isNaN(req.params.id)) {
            DbManagerInstance.getRestockOrder(parseInt(req.params.id)).then((ro) => {
                DbManagerInstance.getRestockOrderSkuItems(ro.getId()).then((ros) => {
                    ro.setSkuItems(ros);
                    return res.status(200).json(ro);
                }).catch((err) => {
                    console.log(err);
                    return res.status(500).send('Internal Server Error')
                });
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
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (
            dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm', true).isValid()
            && dayjs() >= dayjs(req.body.issueDate, 'YYYY/MM/DD HH:mm')
            && req.body.products.length > 0
            && !isNaN(req.body.supplierId)
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

            DbManagerInstance.getNextAvailableId('restockOrder').then((id) => {


                const ro = new RestockOrder(
                    dayjs(req.body.issueDate).format('YYYY/MM/DD HH:mm'),
                    products,
                    req.body.supplierId,
                    "",
                    id
                );
                DbManagerInstance.storeRestockOrder(ro.toDatabase()).then((x) => {
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

const updateRestockOrder = ((req, res) => {
    let type;
    let skuItemsBool = false;
    if (req.route.path.includes('skuItems')) type = 'skuItems';
    else if (req.route.path.includes('transportNote')) type = 'transportNote';
    else type = 'state';
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.getRestockOrder(parseInt(req.params.id)).then((ro) => {
            if (type === 'skuItems' && req.body.skuItems && req.body.skuItems.length > 0 && ro.getState() === 'DELIVERED') {
                skuItemsBool = true;
            } else if (type === 'state' && req.body.newState && restockOrderStates.includes(req.body.newState)) {
                ro.setState(req.body.newState);
            } else if (type === 'transportNote' && req.body.transportNote
                && req.body.transportNote.deliveryDate && dayjs(req.body.transportNote.deliveryDate, 'YYYY/MM/DD HH:mm', true).isValid()
                && req.body.transportNote.deliveryDate >= dayjs(ro.getIssueDate()).format('YYYY/MM/DD HH:mm')
                && ro.getState() === 'DELIVERY'
            ) {
                ro.setTransportNote("Delivery Date: " + dayjs(req.body.transportNote.deliveryDate).format('YYYY/MM/DD'));
            } else {
                return res.status(422).send('Unprocessable Entity');
            }
            if (skuItemsBool) {
                DbManagerInstance.storeRestockOrderSkuItems(ro.getId(), req.body.skuItems).then((x) => {
                    if (x > 0) {
                        return res.status(200).send('OK');
                    }
                }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
            } else {
                DbManagerInstance.updateRestockOrder(ro.toDatabase()).then((x) => {
                    if (x > 0) {
                        return res.status(200).send('OK');
                    } else {
                        return res.status(503).send('Service Unavailable');
                    }
                }).catch((err) => {
                    console.log(err);
                    return res.status(503).send('Service Unavailable');
                });
            }

        }).catch((err) => {
            console.log(err);
            return res.status(404).send('Not Found');
        });

    } catch (err) {
        console.log(err);
        return res.status(503).send('Service Unavailable');
    }
});

const deleteRestockOrder = ((req, res) => {
    // todo add login check
    if (!true) {
        return res.status(401).send('Unauthorized');
    }
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).send('Unprocessable Entity');
        }
        DbManagerInstance.deleteRestockOrder(parseInt(req.params.id)).then((x) => {
            if (x > 0) {
                DbManagerInstance.deleteRestockOrderSkuItems(parseInt(req.params.id)).then((y) => { }).catch((err) => {
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
    getAllRestockOrders,
    getIssuedRestockOrders,
    getRestockOrderById,
    // getReturnItemsByRestockOrderId,
    createRestockOrder,
    updateRestockOrder,
    deleteRestockOrder,
}
