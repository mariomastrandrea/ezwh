const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('Sku API tests', () => {
    postSkuTest(201, {
        description: "a new sku",
        weight: 100,
        volume: 50,
        notes: "SKU",
        price: 10.99,
        availableQuantity: 50
    });

    // unprocessable body
    postSkuTest(422, {
        description: "a new sku",
        weight: "fake weight",
        volume: "fake volume",
        notes: "SKU",
        price: 10.99,
        availableQuantity : 0
    });

    getAllSkuTest(200);
    getSkuByIdTest(200, 1);
    getSkuByIdTest(404, 999);
});

//#region Sku test functions
function getAllSkuTest(expectedHttpStatus) {
    it('get all skus', function(done) {
        agent.get("/api/skus")
            .then(function(res) {
                res.should.have.status(expectedHttpStatus);
                res.body.should.be.an('array');

                for(let sku of res.body) {
                    sku.id.should.be.a('number');
                    sku.id.should.be.greaterThan(0);

                    sku.description.should.be.a('string');
                    sku.description.should.exist;

                    sku.weight.should.be.a('number');
                    sku.weight.should.be.greaterThanOrEqual(0);

                    sku.volume.should.be.a('number');
                    sku.volume.should.be.greaterThanOrEqual(0);

                    sku.notes.should.be.a('string');
                    sku.notes.should.exist;

                    sku.position.should.be.a('string');
                    sku.position.should.have.lengthOf(12);

                    sku.availableQuantity.should.be.a('number');
                    sku.availableQuantity.should.be.greaterThanOrEqual(0);

                    sku.price.should.be.a('number');
                    sku.price.should.be.greaterThanOrEqual(0);

                    sku.testDescriptors.should.be.an('array');
                }

                done();
            })
            .catch(err => done(err));
    });
}

function getSkuByIdTest(expectedHttpStatus, skuId) {
    it('get sku by id', function(done) {
        agent.get(`/api/skus/${skuId}`)
            .then(function(res) {
                res.should.have.status(expectedHttpStatus);

                if(expectedHttpStatus === 200) {
                    const sku = res.body;
                    
                    sku.description.should.be.a('string');
                    sku.description.should.exist;

                    sku.weight.should.be.a('number');
                    sku.weight.should.be.greaterThanOrEqual(0);

                    sku.volume.should.be.a('number');
                    sku.volume.should.be.greaterThanOrEqual(0);

                    sku.notes.should.be.a('string');
                    sku.notes.should.exist;

                    sku.position.should.be.a('string');
                    sku.position.should.have.lengthOf(12);

                    sku.availableQuantity.should.be.a('number');
                    sku.availableQuantity.should.be.greaterThanOrEqual(0);

                    sku.price.should.be.a('number');
                    sku.price.should.be.greaterThanOrEqual(0);

                    sku.testDescriptors.should.be.an('array');
                }

                done();
            })
            .catch(err => done(err));
    });
}

function postSkuTest(expectedHttpStatus, requestBody) {
    it('create sku', function(done) {
        agent.post("/api/sku")
            .send(requestBody)
            .then(function(res) {
                res.should.have.status(expectedHttpStatus);
                done();
            })
            .catch(err => done(err));
    });
}


//#endregion
