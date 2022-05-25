const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const { postSkuTest } = require("./testSkuRouter");
const { postUser } = require("./testUserRouter");

describe('Item API tests', () => {
    deleteAll(200);

    // no items yet
    getAllItemsTest(200, []);

    // sku not found
    postItemTest(404, {
        "id": 12,
        "description": "a new item",
        "price": 10.99,
        "SKUId": 1,
        "supplierId": 1
    });

    // create 2 skus
    postSkuTest(201, {
        description: "first sku",
        weight: 100,
        volume: 50,
        notes: "1st SKU",
        price: 10.99,
        availableQuantity: 50
    });
    postSkuTest(201, {
        description: "second sku",
        weight: 100,
        volume: 50,
        notes: "2nd SKU",
        price: 10.99,
        availableQuantity: 20
    });

    // now supplier is not found
    postItemTest(422, {
        "id": 12,
        "description": "a new item",
        "price": 10.99,
        "SKUId": 1,
        "supplierId": 1
    });

    // create the supplier
    postUser(201, 'supplier11@ezwh.com', 'supplierName1', 'supplierSurname1', 'testpassword', 'supplier'); // has ID 101
    postUser(201, 'supplier12@ezwh.com', 'supplierName2', 'supplierSurname2', 'testpassword', 'supplier'); // has ID 102

    // * create Item successfully *
    postItemTest(201, {
        "id": 12,
        "description": "a new item",
        "price": 10.99,
        "SKUId": 1,
        "supplierId": 101
    });

    // supplier 101 already sells an item related to sku1
    postItemTest(422, {
        "id": 13,
        "description": "a new item",
        "price": 10.99,
        "SKUId": 1,
        "supplierId": 101
    });

    // already exist item with id=12
    postItemTest(422, {
        "id": 12,
        "description": "a new item",
        "price": 10.99,
        "SKUId": 2,
        "supplierId": 101
    });

    // * create Item successfully *
    postItemTest(201, {
        "id": 13,
        "description": "a new second item",
        "price": 1.89,
        "SKUId": 2,
        "supplierId": 101
    });

    getAllItemsTest(200, [
        {
            "id": 12,
            "description": "a new item",
            "price": 10.99,
            "SKUId": 1,
            "supplierId": 101
        },
        {
            "id": 13,
            "description": "a new second item",
            "price": 1.89,
            "SKUId": 2,
            "supplierId": 101
        }
    ]);

    // wrong id format
    putItemTest(422, "aa", {});

    // empty body
    putItemTest(422, 12, {});

    // item not found
    putItemTest(404, 24, {
        "newDescription": "a new sku",
        "newPrice": 10.99
    });

    // missing price
    putItemTest(422, 12, {
        "newDescription": "a new sku description",
    });

    // * item successfully updated *
    putItemTest(200, 12, {
        "newDescription": "a new sku description",
        "newPrice": 8.08
    });

    getItemByIdTest(200, 12, {
        "id": 12,
        "description": "a new sku description",
        "price": 8.08,
        "SKUId": 1,
        "supplierId": 101
    });

    deleteItemTest(204, 12);

    // item not found
    deleteItemTest(422, 12);

    // wrong item id format
    deleteItemTest(422, "aa");
    
    //item not found
    getItemByIdTest(404, 12);

    deleteAll(200);
});

//#region Item test functions
function getAllItemsTest(expectedHttpStatus, expectedResponseBody) {
    it('get all items', function (done) {
        agent.get("/api/items")
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);

                if (expectedHttpStatus === 200) {
                    res.body.should.be.an('array');
                    res.body.should.be.deep.equal(expectedResponseBody);
                }

                done();
            })
            .catch(err => done(err));
    });
}

function getItemByIdTest(expectedHttpStatus, itemId, expectedResponseBody) {
    it('get item', function (done) {
        agent.get(`/api/items/${itemId}`)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);

                if (expectedHttpStatus === 200) {
                    res.body.should.be.deep.equal(expectedResponseBody);
                }

                done();
            })
            .catch(err => done(err));
    });
}

function postItemTest(expectedHttpStatus, requestBody) {
    it('create item', function (done) {
        agent.post(`/api/item`).send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function putItemTest(expectedHttpStatus, itemId, requestBody) {
    it('modify item', function (done) {
        agent.put(`/api/item/${itemId}`).send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function deleteItemTest(expectedHttpStatus, itemId) {
    it('delete item', function (done) {
        agent.delete(`/api/items/${itemId}`)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}
//#endregion

function deleteAll(expectedHttpStatus) {
    it('deleting data', function (done) {
        agent.get('/test/deleteAll')
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            }).catch(err => done(err));
    });
}
