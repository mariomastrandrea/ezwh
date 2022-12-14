const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test restock order apis', () => {
    before(async () => {
        await agent.get('/test/deleteAll');
        await agent.post('/api/sku')
            .send({ description: 'a product', weight: 100, volume: 50, notes: 'sku1', price: 10.99, availableQuantity: 100 });
        await agent.post('/api/sku')
            .send({ description: 'another product', weight: 100, volume: 50, notes: 'sku2', price: 20.99, availableQuantity: 100 });
        await agent.post('/api/newUser')
            .send({ username: 'supplier11@ezwh.com', name: 'John', surname: 'Smith', password: 'testpassword', type: 'supplier' })
        await agent.post('/api/skuItem')
            .send({ RFID: '12345678901234567890123456789011', SKUId: 1, DateOfStock: '2021/11/29 12:30' });
        await agent.post('/api/item')
            .send({ id: 1, description: "a new item", price: 10.99, SKUId: 1, supplierId: 101 });
        await agent.post('/api/item')
            .send({ id: 2, description: "a new item", price: 10.99, SKUId: 2, supplierId: 101 });
    })

    after(async () => {
        await agent.get('/test/deleteAll');
    })

    getAllRestock(200, []);
    //insert position, sku, supplier
    postRestock(201, "2021/11/29 09:33",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            qty: 30
        }],
        101
    );
    postRestock(422); // missing body
    postRestock(422,
        "dog",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            qty: 30
        },
        {
            SKUId: 3,
            itemId: 3,
            description: "another product",
            price: 20.99,
            qty: 20
        }],
        101
    ); // invalid issueDate
    postRestock(422,
        "2021/11/29 09:33",
        ["tata"],
        1
    ); // invalid products
    postRestock(422, "2021/11/29 09:33",
        [{
            SKUId: "testWrong",
            itemId: 1,
            description: "a product",
            price: 10.99,
            qty: 30
        },
        {
            SKUId: 3,
            itemId: 1,
            description: "another product",
            price: 20.99,
            qty: 20
        }],
        101
    ); // invalid SKUId
    getRestock(422, "abc"); // id is not a number
    getRestock(404, 99999); // id does not exist
    getRestock(200,
        1,
        "2021/11/29 09:33",
        "ISSUED",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            qty: 30
        },
        {
            SKUId: 2,
            itemId: 2,
            description: "another product",
            price: 20.99,
            qty: 20
        }],
        101,
        []
    );
    getIssuedRestock(200, [
        {
            id: 1,
            issueDate: "2021/11/29 09:33",
            state: "ISSUED",
            products: [{
                SKUId: 1,
                itemId: 1,
                description: "a product",
                price: 10.99,
                qty: 30
            }],
            supplierId: 101,
            skuItems: [],
        }
    ]);
    postRestock(201, "2021/11/30 09:33",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            qty: 30
        },
        {
            SKUId: 2,
            itemId: 2,
            description: "another product",
            price: 20.99,
            qty: 20
        }],
        101
    );
    putRestockState(422, "abc", "DELIVERED"); // id is not a number
    putRestockNote(422, 1, { "deliveryDate": "2021/12/29" }); // state not delivery
    putRestockState(200, 1, "DELIVERY");
    putRestockNote(200, 1, { "deliveryDate": "2021/12/29" });
    putRestockState(200, 1, "DELIVERED");
    // insert sku items
    putRestockSkuItems(200, 1, [{ SKUId: 1, itemId: 1, rfid: "12345678901234567890123456789011" }]);
    getAllRestock(200, [

        {
            id: 1,
            issueDate: "2021/11/29 09:33",
            state: "DELIVERED",
            products: [{
                SKUId: 1,
                itemId: 1,
                description: "a product",
                price: 10.99,
                qty: 30
            }],
            supplierId: 101,
            transportNote: { "deliveryDate": "2021/12/29" },
            skuItems: [{ SKUId: 1, itemId: 1, rfid: "12345678901234567890123456789011" }],
        },
        {
            id: 2,
            issueDate: "2021/11/30 09:33",
            state: "ISSUED",
            products: [{
                SKUId: 1,
                itemId: 1,
                description: "a product",
                price: 10.99,
                qty: 30
            },
            {
                SKUId: 2,
                itemId: 2,
                description: "another product",
                price: 20.99,
                qty: 20
            }],
            supplierId: 101,
            skuItems: [],
        }
    ]);
    getReturnItemsOfRestock(422, 1, []);
    putRestockState(200, 1, "COMPLETEDRETURN");
    getReturnItemsOfRestock(200, 1, []);
    deleteRestock(204, 1);
    deleteRestock(422, "abc");
    deleteRestock(422, 901);
});


describe('test return order api', () => {
    before(async () => {
        await agent.get('/test/deleteAll');
        await agent.post('/api/sku')
            .send({ description: 'a product', weight: 100, volume: 50, notes: 'sku1', price: 10.99, availableQuantity: 100 });
        await agent.post('/api/sku')
            .send({ description: 'another product', weight: 100, volume: 50, notes: 'sku2', price: 20.99, availableQuantity: 100 });
        await agent.post('/api/newUser')
            .send({ username: 'supplier11@ezwh.com', name: 'John', surname: 'Smith', password: 'testpassword', type: 'supplier' })
        await agent.post('/api/newUser')
            .send({ username: 'supplier12@ezwh.com', name: 'Mario', surname: 'Rossi', password: 'testpassword', type: 'supplier' })
        await agent.post('/api/skuItem')
            .send({ RFID: '12345678901234567890123456789011', SKUId: 1, DateOfStock: '2021/11/29 12:30' });
        await agent.post('/api/testDescriptor')
            .send({ name: 'test descriptor 1', procedureDescription: 'This test is described by...', idSKU: 1 });
        await agent.post('/api/skuItems/testResult')
            .send({ rfid: '12345678901234567890123456789011', idTestDescriptor: 1, Date: '2021/11/28', Result: false });
        await agent.post('/api/item')
            .send({ id: 1, description: "a new item", price: 10.99, SKUId: 1, supplierId: 101 });
        await agent.post('/api/item')
            .send({ id: 2, description: "a new item", price: 10.99, SKUId: 2, supplierId: 101 });
        await agent.post('/api/restockOrder')
            .send({
                issueDate: "2021/11/29 09:33",
                products: [{
                    SKUId: 1,
                    itemId: 1,
                    description: "a product",
                    price: 10.99,
                    qty: 30
                },
                {
                    SKUId: 2,
                    itemId: 2,
                    description: "another product",
                    price: 20.99,
                    qty: 20
                }],
                supplierId: 101
            });
        await agent.post('/api/restockOrder')
            .send({
                issueDate: "2021/11/29 09:33",
                products: [{
                    SKUId: 1,
                    itemId: 1,
                    description: "a product",
                    price: 10.99,
                    qty: 30
                },
                {
                    SKUId: 2,
                    itemId: 2,
                    description: "another product",
                    price: 20.99,
                    qty: 20
                }],
                supplierId: 101
            });
        await agent.put('/api/restockOrder/2')
            .send({ newState: "DELIVERED" });
        await agent.put('/api/restockOrder/2/skuItems')
            .send({ skuItems: [{ SKUId: 1, itemId: 1, rfid: "12345678901234567890123456789011" }] });
    })

    after(async () => {
        await agent.get('/test/deleteAll');
    })

    getAllReturn(200, []);
    postReturn(422, "2021/11/29 09:33"); // missing body
    postReturn(404, "2021/11/30 09:33",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789011"
        }],
        456
    ); // restockorderid does not exist
    postReturn(201, "2021/11/30 09:33",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789011"
        }],
        1
    ); // any of the skuItems has negative result
    getReturn(422, "abc"); // id is not a number
    getReturn(404, 99999); // id does not exist
    getReturn(200, 1, "2021/11/30 09:33",
        [{
            SKUId: 1,
            itemId: 1,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789011"
        }],
        1
    );
    deleteReturn(204, 1);
    deleteReturn(422, "abc");
    deleteReturn(422, 901);
});


describe('test internal order api', () => {
    before(async () => {
        await agent.get('/test/deleteAll');
        await agent.post('/api/sku')
            .send({ description: 'a product', weight: 100, volume: 50, notes: 'sku1', price: 10.99, availableQuantity: 100 });
        await agent.post('/api/sku')
            .send({ description: 'another product', weight: 100, volume: 50, notes: 'sku2', price: 20.99, availableQuantity: 100 });
        await agent.post('/api/newUser')
            .send({ username: 'customer11@ezwh.com', name: 'John', surname: 'Smith', password: 'testpassword', type: 'customer' })
        await agent.post('/api/newUser')
            .send({ username: 'supplier12@ezwh.com', name: 'Mario', surname: 'Rossi', password: 'testpassword', type: 'supplier' })
        await agent.post('/api/skuItem')
            .send({ RFID: '12345678901234567890123456789011', SKUId: 1, DateOfStock: '2021/11/29 12:30' });
    })

    after(async () => {
        await agent.get('/test/deleteAll');
    })

    getAllInternal(200, []);
    getIssuedInternal(200, []);
    getAcceptedInternal(200, []);
    getInternal(422, "abc"); // id is not a number
    getInternal(404, 99999); // id does not exist
    // insert sku, customer
    postInternal(422, "2021/11/29 09:33"); // missing body
    postInternal(201,
        "2021/11/29 09:33",
        [{
            SKUId: 1,
            description: "a product",
            price: 10.99,
            qty: 3
        },
        {
            SKUId: 2,
            description: "another product",
            price: 20.99,
            qty: 2
        }],
        101);
    postInternal(201,
        "2021/11/29 09:33",
        [{
            SKUId: 1,
            description: "a product",
            price: 10.99,
            qty: 3
        },
        {
            SKUId: 2,
            description: "another product",
            price: 20.99,
            qty: 2
        }],
        101);
    getIssuedInternal(200, [
        {
            id: 1,
            issueDate: "2021/11/29 09:33",
            state: "ISSUED",
            products: [{
                SKUId: 1,
                description: "a product",
                price: 10.99,
                qty: 3
            },
            {
                SKUId: 2,
                description: "another product",
                price: 20.99,
                qty: 2
            }],
            customerId: 101
        },
        {
            id: 2,
            issueDate: "2021/11/29 09:33",
            state: "ISSUED",
            products: [{
                SKUId: 1,
                description: "a product",
                price: 10.99,
                qty: 3
            },
            {
                SKUId: 2,
                description: "another product",
                price: 20.99,
                qty: 2
            }],
            customerId: 101
        },
    ]);
    putInternal(422, "abc", "ACCEPTED"); // id is not a number
    putInternal(404, 999, "ACCEPTED"); // state not issued
    putInternal(200, 1, "ACCEPTED");
    getAcceptedInternal(200, [{
        id: 1,
        issueDate: "2021/11/29 09:33",
        state: "ACCEPTED",
        products: [{
            SKUId: 1,
            description: "a product",
            price: 10.99,
            qty: 3
        },
        {
            SKUId: 2,
            description: "another product",
            price: 20.99,
            qty: 2
        }],
        customerId: 101
    }]);
    // insert skuItem
    putInternal(200, 1, "COMPLETED",
        [{ SkuID: 1, RFID: "12345678901234567890123456789011" }]
    );
    getInternal(200, 1,
        "2021/11/29 09:33",
        "COMPLETED",
        [{
            SKUId: 1,
            description: "a product",
            price: 10.99,
            RFID: "12345678901234567890123456789011",
        }],
        101);
    putInternal(422, 2, "COMPLETED", [{ as: 1, rat: "12345678901234567890123456789011" }]); // wrong body

    deleteInternal(204, 1);
    deleteInternal(422, "abc"); // id is not a number
    deleteInternal(422, 901); // id does not exist
})

//#region restock orders api
function getRestock(expectedHTTPStatus, id, issueDate, state, products, supplierId, skuItems, transportNote) {
    it(`reading restock order with id ${id}`, function (done) {
        if (id instanceof Number) {
            agent.get('/api/restockOrders/' + id)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    r.body.issueDate.should.equal(issueDate);
                    r.body.state.should.equal(state);
                    expect(r.body.products).to.deep.equal(products);
                    r.body.supplierId.should.equal(supplierId);
                    r.body.skuItems.should.equal(skuItems);
                    if (state !== "ISSUED") r.body.transportNote.should.equal(transportNote);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/restockOrders/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function getAllRestock(expectedHTTPStatus, restocks) {
    it('reading all restock orders', function (done) {
        agent.get('/api/restockOrders')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(restocks);
                done();
            })
            .catch(err => done(err));
    });
}

function getIssuedRestock(expectedHTTPStatus, restocks) {
    it('reading issued restock orders', function (done) {
        agent.get('/api/restockOrdersIssued')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(restocks);
                done();
            })
            .catch(err => done(err));
    });
}

function getReturnItemsOfRestock(expectedHTTPStatus, id, returnItems) {
    it('reading return items of restock orders', function (done) {
        if (id !== undefined) {
            agent.get(`/api/restockOrders/${id}/returnItems`)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200)
                        expect(r.body).to.deep.equal(returnItems);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get(`/api/restockOrders/${id}/returnItems`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postRestock(expectedHTTPStatus, issueDate, products, supplierId) {
    it('creating restock order', function (done) {
        if (issueDate !== undefined) {
            let restock = {
                "issueDate": issueDate,
                "products": products,
                "supplierId": supplierId
            }
            agent.post('/api/restockOrder')
                .send(restock)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.post('/api/restockOrder')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function putRestockState(expectedHTTPStatus, id, newState) {
    it(`updating restock order state of ${id}`, function (done) {
        if (id !== undefined) {
            let update = {
                "newState": newState
            }
            agent.put(`/api/restockOrder/${id}`)
                .send(update)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.put(`/api/restockOrder/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function putRestockSkuItems(expectedHTTPStatus, id, skuItems) {
    it(`updating restock order sku items of ${id}`, function (done) {
        if (id !== undefined) {
            let update = {
                "skuItems": skuItems
            }
            agent.put(`/api/restockOrder/${id}/skuItems`)
                .send(update)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.put(`/api/restockOrder/${id}/skuItems`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function putRestockNote(expectedHTTPStatus, id, transportNote) {
    it(`updating restock order transport note of ${id}`, function (done) {
        if (id !== undefined) {
            let update = {
                "transportNote": transportNote
            }
            agent.put(`/api/restockOrder/${id}/transportNote`)
                .send(update)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.put(`/api/restockOrder/${id}/transportNote`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function deleteRestock(expectedHTTPStatus, id) {
    it('deleting restock order', function (done) {
        if (id !== undefined) {
            agent.delete('/api/restockOrder/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.delete('/api/restockOrder/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}
//#endregion

//#region returnOrder api
function getAllReturn(expectedHTTPStatus, returns) {
    it('reading all return orders', function (done) {
        agent.get('/api/returnOrders')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(returns);
                done();
            })
            .catch(err => done(err));
    });
}

function getReturn(expectedHTTPStatus, id, returnDate, products, restockOrderId) {
    it(`reading return order ${id}`, function (done) {
        if (id !== undefined) {
            agent.get('/api/returnOrders/' + id)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        r.body.returnDate.should.equal(returnDate);
                        expect(r.body.products).to.deep.equal(products);
                        r.body.restockOrderId.should.equal(restockOrderId);
                    }
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/returnOrders/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postReturn(expectedHTTPStatus, returnDate, products, restockOrderId) {
    it('creating return order', function (done) {
        let returnOrder = {
            "returnDate": returnDate,
            "products": products,
            "restockOrderId": restockOrderId
        }
        agent.post('/api/returnOrder')
            .send(returnOrder)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function deleteReturn(expectedHTTPStatus, id) {
    it(`deleting return order ${id}`, function (done) {
        if (id !== undefined) {
            agent.delete('/api/returnOrder/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.delete('/api/returnOrder/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}
//#endregion

//#region internalOrder api
function getAllInternal(expectedHTTPStatus, internalOrders) {
    it('reading all internal orders', function (done) {
        agent.get('/api/internalOrders')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(internalOrders);
                done();
            })
            .catch(err => done(err));
    });
}

function getInternal(expectedHTTPStatus, id, issueDate, state, products, customerId) {
    it(`reading internal order ${id}`, function (done) {
        if (id !== undefined) {
            agent.get('/api/internalOrders/' + id)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        r.body.issueDate.should.equal(issueDate);
                        expect(r.body.products).to.deep.equal(products);
                        r.body.state.should.equal(state);
                        r.body.customerId.should.equal(customerId);
                    }
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/internalOrders/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function getIssuedInternal(expectedHTTPStatus, orders) {
    it(`reading issued internal orders`, function (done) {
        agent.get('/api/internalOrdersIssued')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(orders);
                done();
            }).catch(err => done(err));
    });
}

function getAcceptedInternal(expectedHTTPStatus, orders) {
    it(`reading accepted internal orders`, function (done) {
        agent.get('/api/internalOrdersAccepted')
            .then(function (r) {
                r.should.have.status(expectedHTTPStatus);
                expect(r.body).to.deep.equal(orders);
                done();
            }).catch(err => done(err));
    });
}

function postInternal(expectedHTTPStatus, issueDate, products, customerId) {
    it('creating internal order', function (done) {
        let internalOrder = {
            "issueDate": issueDate,
            "products": products,
            "customerId": customerId
        }
        agent.post('/api/internalOrders')
            .send(internalOrder)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function putInternal(expectedHTTPStatus, id, newState, products) {
    it(`updating internal order ${id}`, function (done) {
        let update = {
            "newState": newState,
            "products": products
        }
        agent.put('/api/internalOrders/' + id)
            .send(update)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function deleteInternal(expectedHTTPStatus, id) {
    it(`deleting internal order ${id}`, function (done) {
        agent.delete('/api/internalOrders/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}

//#endregion

