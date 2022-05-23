const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test testDescriptor apis', () => {
    postTestDesc(201, 'testdesc4', 'this is a test desc', 1);
    postTestDesc(422);
    getTestDesc(200, 4, 'testdesc4', 'this is a test desc', 1);
    getTestDesc(404, 999);
    putTestDesc(200, 4, 'newtestdesc4', 'this is a new test desc', 1);
    putTestDesc(422);
    putTestDesc(422, 999);
    deleteTestDesc(204, 4);
    deleteTestDesc(422, 999);
});

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
