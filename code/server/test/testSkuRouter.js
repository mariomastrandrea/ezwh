const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const { postPosition } = require("./testPositionsRouter");

describe('Sku API tests', () => {
    deleteAll(200);

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

    // unprocessable body
    postSkuTest(422, {
        description: "a new sku",
        weight: "fake weight",
        volume: "fake volume",
        notes: "SKU",
        price: 10.99,
        availableQuantity: 0
    });
    postSkuTest(422, {
        description: "a new sku",
        weight: "fake weight",
        notes: "SKU",
        price: 10.99,
    });

    getAllSkuTest(200, [{ ...newSku1, id: 1, position: "", testDescriptors: [] }, { ...newSku2, id: 2, position: "", testDescriptors: [] }]);
    getSkuByIdTest(200, 1, { ...newSku1, id: 1, position: "", testDescriptors: [] });
    getSkuByIdTest(404, 999);

    putSkuTest(422, 1);
    putSkuTest(422, 1, {
        "newDescription": "sdafegrd",
        "newWeight": 1000,
        "newVolume": 5000,
        "newNotes": "adsfesg",
    });

    putSkuTest(404, 999, {
        "newDescription": "sdafegrd",
        "newWeight": 1000,
        "newVolume": 5000,
        "newNotes": "adsfesg",
        "newPrice": 101.99,
        "newAvailableQuantity": 50
    });

    putSkuTest(200, 1, {
        "newDescription": "a new first sku",
        "newWeight": 10,
        "newVolume": 50,
        "newNotes": "modified first SKU",
        "newPrice": 101.99,
        "newAvailableQuantity": 5
    })

    getSkuByIdTest(200, 1, {
        "id": 1,
        "position": "",
        "description": "a new first sku",
        "weight": 10,
        "volume": 50,
        "notes": "modified first SKU",
        "price": 101.99,
        "availableQuantity": 5,
        "testDescriptors": []
    });

    postPosition(201, "123412341234", "1234", "1234", "1234", 999, 999);

    putSkuPositionTest(200, 1, {
        position: "123412341234"
    })

    getSkuByIdTest(200, 1, {
        "id": 1,
        "position": "123412341234",
        "description": "a new first sku",
        "weight": 10,
        "volume": 50,
        "notes": "modified first SKU",
        "price": 101.99,
        "availableQuantity": 5,
        "testDescriptors": []
    });

    deleteSkuTest(204, 999);
    deleteSkuTest(204, 1);
    deleteSkuTest(204, 1);
    getSkuByIdTest(404, 1);

    deleteAll(200);
});

//#region Sku test functions
function getAllSkuTest(expectedHttpStatus, expectedResponseBody) {
    it('get all skus', function (done) {
        agent.get("/api/skus")
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

function getSkuByIdTest(expectedHttpStatus, skuId, expectedResponseBody) {
    it('get sku by id', function (done) {
        agent.get(`/api/skus/${skuId}`)
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

function postSkuTest(expectedHttpStatus, requestBody) {
    it('create sku', function (done) {
        agent.post("/api/sku")
            .send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function putSkuTest(expectedHttpStatus, skuId, requestBody) {
    it('update sku', function (done) {
        agent.put(`/api/sku/${skuId}`)
            .send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function putSkuPositionTest(expectedHttpStatus, skuId, requestBody) {
    it('update sku position', function (done) {
        agent.put(`/api/sku/${skuId}/position`)
            .send(requestBody)
            .then(function (res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function deleteSkuTest(expectedHttpStatus, skuId) {
    it('delete sku', function (done) {
        agent.delete(`/api/skus/${skuId}`)
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
    getAllSkuTest,
    getSkuByIdTest,
    postSkuTest,
    putSkuTest,
    putSkuPositionTest,
    deleteSkuTest
}
