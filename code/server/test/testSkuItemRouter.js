const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const { postSkuTest } = require("./testSkuRouter");

describe('SkuItem API tests', () => {
    deleteAll(200);

    // sku id not found
    postSkuItemTest(404, {
        "RFID": "12345678901234567890123456789015",
        "SKUId": 1,
        "DateOfStock": "2021/11/29 12:30"
    });

    const newSku1 = {
        description: "first sku",
        weight: 100,
        volume: 50,
        notes: "1st SKU",
        price: 10.99,
        availableQuantity: 50
    };

    const newSku2 = {
        description: "second sku",
        weight: 100,
        volume: 50,
        notes: "2nd SKU",
        price: 10.99,
        availableQuantity: 20
    }

    postSkuTest(201, newSku1);
    postSkuTest(201, newSku2);

    postSkuItemTest(201, {
        "RFID": "12345678901234567890123456789015",
        "SKUId": 1,
        "DateOfStock": "2021/11/29 12:30"
    });

    postSkuItemTest(201, {
        "RFID": "12345678901234567890123456789016",
        "SKUId": 2,
        "DateOfStock": "2021/11/30 12:30"
    });

    // no rfid
    postSkuItemTest(422, {
        "SKUId": 2,
        "DateOfStock": "2021/11/30 12:30"
    });

    // empty requestBody
    postSkuItemTest(422, {});

    // rfid already existing
    postSkuItemTest(422, {
        "RFID": "12345678901234567890123456789016",
        "SKUId": 2,
        "DateOfStock": "2021/11/30 12:30"
    });

    // wrong rfid format
    getSkuItemByRfidTest(422, 999, {});
    getSkuItemByRfidTest(404, "12345678901234567890123456789026", {});

    getSkuItemByRfidTest(200, "12345678901234567890123456789015", {
        "RFID": "12345678901234567890123456789015",
        "SKUId": 1,
        "Available": 0,
        "DateOfStock": "2021/11/29 12:30"
    });

    // rfid not found
    putSkuItemTest(404, "12345678901234567890123456789022", {
        "newRFID": "12345678901234567890123456789015",
        "newAvailable": 1,
        "newDateOfStock": "2022/01/16 22:10"
    });

    // wrong rfid format
    putSkuItemTest(422, "12345678901234567890123456789015", {
        "newRFID": "134",
        "newAvailable": 1,
        "newDateOfStock": "2022/01/16 22:10"
    });

    // empty request body
    putSkuItemTest(422, "134", {});

    // wrong date of stock format
    putSkuItemTest(422, "12345678901234567890123456789015", {
        "newRFID": "12345678901234567890123456789015",
        "newAvailable": 1,
        "newDateOfStock": "2022-01-16 22:10"
    });

    // missing fields
    putSkuItemTest(422, "12345678901234567890123456789015", {
        "newRFID": "12345678901234567890123456789015",
        "newDateOfStock": "2022-01-16 22:10"
    });

    // * successful update * 
    putSkuItemTest(200, "12345678901234567890123456789015", {
        "newRFID": "12345678901234567890123456789015",
        "newAvailable": 1,
        "newDateOfStock": "2022/01/16 22:10"
    });

    // already existing rfid
    putSkuItemTest(422, "12345678901234567890123456789015", {
        "newRFID": "12345678901234567890123456789016",
        "newAvailable": 1,
        "newDateOfStock": "2022/01/16 22:10"
    });

    getSkuItemByRfidTest(200, "12345678901234567890123456789015", {
        "RFID": "12345678901234567890123456789015",
        "SKUId": 1,
        "Available": 1,
        "DateOfStock": "2022/01/16 22:10"
    });

    postSkuItemTest(201, {
        "RFID": "12345678901234567890123456789017",
        "SKUId": 2,
        "DateOfStock": "2022/12/31 23:59"
    });

    getSkuItemsOfSkuTest(404, 10);

    // all sku item with skuId=2 are with available=0
    getSkuItemsOfSkuTest(200, 2, []);

    // set available=1
    putSkuItemTest(200, "12345678901234567890123456789016", {
        "newRFID": "12345678901234567890123456789016",
        "newAvailable": 1,
        "newDateOfStock": "2021/11/30 12:30"
    });

    putSkuItemTest(200, "12345678901234567890123456789017", {
        "newRFID": "12345678901234567890123456789017",
        "newAvailable": 1,
        "newDateOfStock": "2022/12/31 23:59"
    });

    getSkuItemsOfSkuTest(200, 2, [
        {
            "RFID": "12345678901234567890123456789016",
            "SKUId": 2,
            "DateOfStock": "2021/11/30 12:30"
        },
        {
            "RFID": "12345678901234567890123456789017",
            "SKUId": 2,
            "DateOfStock": "2022/12/31 23:59"
        }
    ]);

    getAllSkuItemsTest(200, [
        {
            "RFID": "12345678901234567890123456789015",
            "SKUId": 1,
            "Available": 1,
            "DateOfStock": "2022/01/16 22:10"
        },
        {
            "RFID": "12345678901234567890123456789016",
            "SKUId": 2,
            "Available": 1,
            "DateOfStock": "2021/11/30 12:30"
        },
        {
            "RFID": "12345678901234567890123456789017",
            "SKUId": 2,
            "Available": 1,
            "DateOfStock": "2022/12/31 23:59"
        }
    ]);

    deleteSkuItemTest(204, "12345678901234567890123456789015");

    // rfid not found
    deleteSkuItemTest(422, "12345678901234567890123456789015");

    // wrong rfid format
    deleteSkuItemTest(422, "sdfghj");

    deleteAll(200);
});

//#region SkuItem tests functions
function getAllSkuItemsTest(expectedHttpStatus, expectedResponseBody) {
    it('get all sku items', function (done) {
        agent.get("/api/skuitems")
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

function getSkuItemsOfSkuTest(expectedHttpStatus, skuId, expectedResponseBody) {
    it('get sku items of a sku', function (done) {
        agent.get(`/api/skuitems/sku/${skuId}`)
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

function getSkuItemByRfidTest(expectedHttpStatus, rfid, expectedResponseBody) {
    it('get sku item', function (done) {
        agent.get(`/api/skuitems/${rfid}`)
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

function postSkuItemTest(expectedHttpStatus, requestBody) {
    it('create sku item', function (done) {
        agent.post("/api/skuitem").send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function putSkuItemTest(expectedHttpStatus, rfid, requestBody) {
    it('modify sku item', function (done) {
        agent.put(`/api/skuitems/${rfid}`).send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function deleteSkuItemTest(expectedHttpStatus, rfid) {
    it('delete sku item', function (done) {
        agent.delete(`/api/skuitems/${rfid}`)
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

module.exports = {
    getAllSkuItemsTest,
    getSkuItemsOfSkuTest,
    getSkuItemByRfidTest,
    postSkuItemTest,
    putSkuItemTest,
    deleteSkuItemTest
}