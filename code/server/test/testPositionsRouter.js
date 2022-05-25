const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);


describe('test position apis', function () {
    deleteAll(200);

    getAllPosition(200, []);
    postPosition(201, "800234543412", "8002", "3454", "3412", 1000, 1000);
    postPosition(422, "800234543412", "8002", "3454", "3412", 1000, 1000); // position id already exists
    postPosition(422, "cane", "8002", "3454", "3412", 1000, 1000); // invalid position id
    postPosition(201, "800234543411", "8002", "3454", "3411", 1000, 1000);

    putPosition(404, "800234543410", "1234", "3454", "3410", 1000, 1000, 0, 0); // position id does not exist
    putPosition(422, "800234543412", "pane", "3454", "3412", 1000, 1000, 0, 0); // invalid aisle
    putPosition(200, "800234543412", "8002", "3454", "3412", 1000, 1000, 10, 10);
    getAllPosition(200, [{
        "positionID": "800234543412",
        "aisleID": "8002",
        "row": "3454",
        "col": "3412",
        "maxWeight": 1000,
        "maxVolume": 1000,
        "occupiedWeight": 10,
        "occupiedVolume": 10
    }, {
        "positionID": "800234543411",
        "aisleID": "8002",
        "row": "3454",
        "col": "3411",
        "maxWeight": 1000,
        "maxVolume": 1000,
        "occupiedWeight": 0,
        "occupiedVolume": 0
    }]);

    deletePosition(422, "800234543410"); // position id does not exist
    deletePosition(204, "800234543412");
    deletePosition(422, 123); // invalid position id

    deleteAll(200);

});


function deleteAll(expectedHTTPStatus) {
    it('deleting data', function (done) {
        agent.get('/test/deleteAll')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

function insertSamples(expectedHTTPStatus) {
    it('adding samples', function (done) {
        agent.get('/test/insertSamples')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

function postPosition(expectedHTTPStatus, positionID, aisleID, row, col, maxWeight, maxVolume) {
    it('creating position', function (done) {
        if (positionID !== undefined) {
            let body = {
                "positionID": positionID,
                "aisleID": aisleID,
                "row": row,
                "col": col,
                "maxWeight": maxWeight,
                "maxVolume": maxVolume
            }
            agent.post('/api/position')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/position')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));

        }
    });
}

function getAllPosition(expectedHTTPStatus, expectedBody) {
    it('getting all positions', function (done) {
        agent.get('/api/positions')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                expect(res.body).to.deep.equal(expectedBody);
                done();
            }).catch(err => done(err));
    });
}

function putPosition(expectedHTTPStatus, positionId, newAisleID, newRow, newCol, newMaxWeight, newMaxVolume, newOccupiedWeight, newOccupiedVolume) {
    it('updating position', function (done) {
        let body = {
            "newAisleID": newAisleID,
            "newRow": newRow,
            "newCol": newCol,
            "newMaxWeight": newMaxWeight,
            "newMaxVolume": newMaxVolume,
            "newOccupiedWeight": newOccupiedWeight,
            "newOccupiedVolume": newOccupiedVolume
        }
        agent.put(`/api/position/${positionId}`)
            .send(body)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

function putChangeId(expectedHTTPStatus, positionId, newPositionID) {
    it('updating position id', function (done) {
        let body = {
            "newPositionID": newPositionID
        }
        agent.put(`/api/position/${positionId}/changeID`)
            .send(body)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

function deletePosition(expectedHTTPStatus, positionId) {
    it('deleting position', function (done) {
        agent.delete(`/api/position/${positionId}`)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

module.exports = {
    postPosition,
    getAllPosition,
    putPosition,
    putChangeId,
    deletePosition,
}
