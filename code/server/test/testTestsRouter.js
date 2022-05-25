const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const { expect } = require('chai');

const app = require('../server');
var agent = chai.request.agent(app);

describe('test testDescriptor apis', () => {
    before(async () => {
        await agent.get('/test/deleteAll');
        await agent.post('/api/sku')
            .send({ description: 'sku1', weight: 100, volume: 50, notes: 'testing SKU', price: 25.99, availableQuantity: 50 });
        await agent.post('/api/skuItem')
            .send({
                RFID: '12345678901234567890123456789015',
                SKUId: 1,
                DateOfStock: '2021/11/29 12:30'
            });
    })

    after(async () => {
        await agent.get('/test/deleteAll');
    })

    getAllTestDesc(200, []);
    postTestDesc(201, 'testdesc1', 'this is a test desc', 1);
    postTestDesc(201, 'testdesc2', 'this is a test desc', 1);
    postTestDesc(201, 'testdesc3', 'this is a test desc', 1);
    postTestDesc(422);
    getTestDesc(200, 1, 'testdesc1', 'this is a test desc', 1);
    getTestDesc(404, 999);
    putTestDesc(200, 1, 'newtestdesc1', 'this is a new test desc', 1);
    putTestDesc(422);
    putTestDesc(422, 999);
    deleteTestDesc(204, 3);
    deleteTestDesc(422, 999);
    getAllTestDesc(200, [{
        'id': 1,
        'name': 'newtestdesc1',
        'procedureDescription': 'this is a new test desc',
        'idSKU': 1
    },
    {
        'id': 2,
        'name': 'testdesc2',
        'procedureDescription': 'this is a test desc',
        'idSKU': 1
    }]);

    postTestResult(201, '12345678901234567890123456789015', 1, '2021/11/28', true);
    postTestResult(201, '12345678901234567890123456789015', 2, '2021/11/28', false);
    postTestResult(422);
    getTestResult(200, '12345678901234567890123456789015', 1, 1, '2021/11/28', true);
    getTestResult(422, '1234567890123456789012345678901', 1);
    getTestResult(404, '12345678901234567890123456789016', 2);
    getAllTestResult(200, '12345678901234567890123456789015', [
        {
            "Date": "2021/11/28",
            "Result": true,
            "id": 1,
            "idTestDescriptor": 1
        },
        {
            "Date": "2021/11/28",
            "Result": false,
            "id": 2,
            "idTestDescriptor": 2,
        }
    ]);
    getAllTestResult(404, '12345678901234567890123456789016');
    getAllTestResult(422, '1234567890123456789012345678901');
    putTestResult(200, '12345678901234567890123456789015', 1, 1, '2022/11/28', true);
    putTestResult(422, '12345678901234567890123456789015', 1);
    putTestResult(422, '1234567890123456789012345678901', 1);
    deleteTestResult(204, '12345678901234567890123456789015', 2);
    deleteTestResult(422, '1234567890123456789012345678901', 2);
    getAllTestResult(200, '12345678901234567890123456789015', [
        {
            "Date": "2022/11/28",
            "Result": true,
            "id": 1,
            "idTestDescriptor": 1
        }
    ]);


});

function getAllTestDesc(expectedHTTPStatus, expectedBody) {
    it('getting all test descriptors', function (done) {
        agent.get('/api/testDescriptors')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                expect(res.body).to.deep.equal(expectedBody);
                done();
            }).catch(err => done(err));
    });
}

function postTestDesc(expectedHTTPStatus, name, procedureDescription, idSKU) {
    it('creating test descriptor', function (done) {
        if (name !== undefined) {
            let testDesc = { name: name, procedureDescription: procedureDescription, idSKU: idSKU }
            agent.post('/api/testDescriptor')
                .send(testDesc)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.post('/api/testDescriptor')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getTestDesc(expectedHTTPStatus, id, name, procedureDescription, idSKU) {
    it('reading test descriptor', function (done) {
        if (name !== undefined) {
            agent.get('/api/testDescriptors/' + id)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    r.body.id.should.equal(id);
                    r.body.name.should.equal(name);
                    r.body.procedureDescription.should.equal(procedureDescription);
                    r.body.idSKU.should.equal(idSKU);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/testDescriptors/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function putTestDesc(expectedHTTPStatus, id, name, procedureDescription, idSKU) {
    it('updating test descriptor', function (done) {
        if (name !== undefined) {
            let testDesc = { newName: name, newProcedureDescription: procedureDescription, newIdSKU: idSKU }
            agent.put('/api/testDescriptor/' + id)
                .send(testDesc)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.put('/api/testDescriptor/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        }
    });
}

function deleteTestDesc(expectedHTTPStatus, id) {
    it('deleting test desc', function (done) {
        agent.delete('/api/testDescriptor/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}

function postTestResult(expectedHTTPStatus, rfid, idTestDescriptor, date, result) {
    it('creating test result', function (done) {
        if (rfid !== undefined) {
            let testResult = { rfid: rfid, idTestDescriptor: idTestDescriptor, Date: date, Result: result }
            agent.post('/api/skuItems/testResult')
                .send(testResult)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.post('/api/skuItems/testResult')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getTestResult(expectedHTTPStatus, rfid, id, idTestDescriptor, date, testResult) {
    it('reading test result of sku item', function (done) {
        if (idTestDescriptor !== undefined) {
            agent.get('/api/skuitems/' + rfid + '/testResults/' + id)
                .then(function (r) {
                    r.should.have.status(expectedHTTPStatus);
                    r.body.idTestDescriptor.should.equal(idTestDescriptor);
                    r.body.Date.should.equal(date);
                    r.body.Result.should.equal(testResult);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/skuitems/' + rfid + '/testResults/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        }
    });
}

function getAllTestResult(expectedHTTPStatus, rfid, expectedBody) {
    it('reading all test result of sku item', function (done) {
        if (expectedBody !== undefined) {
            agent.get('/api/skuitems/' + rfid + '/testResults')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expectedBody);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.get('/api/skuitems/' + rfid + '/testResults')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        }
    });
}

function putTestResult(expectedHTTPStatus, rfid, id, newIdTestDescriptor, newDate, newResult) {
    it('updating test result', function (done) {
        if (newIdTestDescriptor !== undefined) {
            let testResult = { newIdTestDescriptor: newIdTestDescriptor, newDate: newDate, newResult: newResult }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + id)
                .send(testResult)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        } else {
            agent.put('/api/skuitems/' + rfid + '/testResult/' + id)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                })
                .catch(err => done(err));
        }
    });
}

function deleteTestResult(expectedHTTPStatus, rfid, id) {
    it('deleting test result', function (done) {
        agent.delete('/api/skuitems/' + rfid + '/testResult/' + id)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
            .catch(err => done(err));
    });
}