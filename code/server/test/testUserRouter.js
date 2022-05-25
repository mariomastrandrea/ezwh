const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { post } = require('../api/ordersRouter');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

describe('test user apis', function () {
    deleteAll(200);

    getAllUsers(200, []);

    postUser(201, "dog@ezwh.com", "Dog", "Labrador", "puppy1234567", "customer");
    postCustomerS(200, "dog@ezwh.com", "puppy1234567", {
        "username": "dog@ezwh.com",
        "name": "Dog",
        "id": 1
    });
    postUser(201, 'e1@gmail.com', "Thomas", "Christmas", "testP1234567", 'clerk');
    postClerkS(200, 'e1@gmail.com', 'testP1234567', {
        "username": "e1@gmail.com",
        "name": "Thomas",
        "id": 2
    });
    postUser(201, "cat@gmail.com", "Leo", "Nardo", "cat1234567", 'supplier');
    postSupplierS(200, "cat@gmail.com", "cat1234567", {
        username: "cat@gmail.com",
        name: "Leo",
        id: 3
    });
    getAllUsers(200, [
        {
            id: 1,
            email: 'dog@ezwh.com', name: 'Dog', surname: 'Labrador', type: 'customer',
        },
        {
            id: 2,
            email: 'e1@gmail.com', name: 'Thomas', surname: 'Christmas', type: 'clerk',
        },
        {
            id: 3,
            name: "Leo",
            surname: "Nardo",
            email: "cat@gmail.com",
            type: "supplier",
        }
    ])
    postUser(201, "testa@gmail.com", "Martin", "Scorsese", "martino1234567", "deliveryEmployee");
    postDeliveryEmployeeSessions(200, "testa@gmail.com", "martino1234567", {
        "username": "testa@gmail.com",
        "name": "Martin",
        "id": 4
    });

    postUser(409, "testa@gmail.com", "Martin", "Scorsese", "martino1234567", "deliveryEmployee");  //email already exists
    postUser(422, "testa@gmail.com", "Martin", "Scorsese", "martino1234567", "manager"); //type not valid
    postUser(422, "dogTest@gmail.com", 123, "Scorsese", "martino1234567", "customer"); //username not valid

    putType(404, "123@prova.gmail", "customer", "clerk"); //user not found
    putType(422, "e1@gmail.com", "test", "clerk"); //type not valid

    deleteUser(204, "dog@ezwh.com", "customer");
    deleteUser(422, "dogezwh.com", "customer");  //username not valid
    deleteUser(422, "e1@gmail.com", "wrong");  //type not valid

    getSupplier(200, [
        {
            id: 3,
            name: "Leo",
            surname: "Nardo",
            email: "cat@gmail.com",
        }
    ]);

    getUserInfo(200, 'e1@gmail.com', "Thomas", "Christmas", 'clerk');

    putType(200, "e1@gmail.com", 'clerk', 'qualityEmployee');
    getUserInfo(500, 'e1@gmail.com', "Thomas", "Christmas", 'qualityEmployee');

    postQualityEmployeeS(200, 'e1@gmail.com', 'testP1234567', {
        "username": "e1@gmail.com",
        "name": "Thomas",
        "id": 2
    });
    postLogout(200);
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

function getUserInfo(expectedHTTPStatus, username, name, surname, type) {
    it('getting user info', function (done) {
        agent.get('/api/userinfo')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                if (expectedHTTPStatus === 200) {
                    res.body.username.should.equal(username);
                    res.body.name.should.equal(name);
                    res.body.surname.should.equal(surname);
                    res.body.type.should.equal(type);
                }
                done();
            }).catch(err => done(err));
    });
}

function getSupplier(expectedHTTPStatus, expected) {
    it('getting supplier', function (done) {
        agent.get('/api/suppliers')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                expect(res.body).to.deep.equal(expected);
                done();
            }).catch(err => done(err));
    });
}

function getAllUsers(expectedHTTPStatus, expected) {
    it('getting all users', function (done) {
        agent.get('/api/users')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                expect(res.body).to.deep.equal(expected);
                done();
            }).catch(err => done(err));
    });
}

function postUser(expectedHTTPStatus, username, name, surname, password, type) {
    it('creating user', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "name": name,
                "surname": surname,
                "password": password,
                "type": type
            }
            agent.post('/api/newUser')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/newUser')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));

        }
    });
}

function postManagerS(expectedHTTPStatus, username, password, expected) {
    it('manager sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/managerSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/managerSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postCustomerS(expectedHTTPStatus, username, password, expected) {
    it('customer sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/customerSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/customerSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postSupplierS(expectedHTTPStatus, username, password, expected) {
    it('supplier sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/supplierSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/supplierSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postClerkS(expectedHTTPStatus, username, password, expected) {
    it('clerk sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/clerkSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/clerkSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postQualityEmployeeS(expectedHTTPStatus, username, password, expected) {
    it('quality employee sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/qualityEmployeeSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/qualityEmployeeSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postDeliveryEmployeeSessions(expectedHTTPStatus, username, password, expected) {
    it('delivery employee sessions', function (done) {
        if (username !== undefined) {
            let body = {
                "username": username,
                "password": password
            }
            agent.post('/api/deliveryEmployeeSessions')
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    expect(res.body).to.deep.equal(expected);
                    done();
                }).catch(err => done(err));
        } else {
            agent.post('/api/deliveryEmployeeSessions')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function postLogout(expectedHTTPStatus) {
    it('logout', function (done) {
        agent.post('/api/logout')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            }).catch(err => done(err));
    });
}

function putType(expectedHTTPStatus, username, oldType, newType) {
    it('updating user', function (done) {
        if (username !== undefined) {
            let body = {
                "newType": newType,
                "oldType": oldType,
            }
            agent.put(`/api/users/${username}`)
                .send(body)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        } else {
            agent.put('/api/users/')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

function deleteUser(expectedHTTPStatus, username, type) {
    it('deleting user', function (done) {
        if (username !== undefined) {
            agent.delete(`/api/users/${username}/${type}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        } else {
            agent.delete('/api/users/')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(err => done(err));
        }
    });
}

module.exports = {
    getUserInfo,
    getSupplier,
    getAllUsers,
    postUser,
    postManagerS,
    postCustomerS,
    postSupplierS,
    postClerkS,
    postQualityEmployeeS,
    postDeliveryEmployeeSessions,
    postLogout,
    putType,
    deleteUser
}
