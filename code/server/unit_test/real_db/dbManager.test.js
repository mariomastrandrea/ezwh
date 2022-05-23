const DbManagerFactory = require('../../db/dbManager');
const dao = DbManagerFactory();
const RestockOrder = require('../../models/restockOrder');
const ReturnOrder = require('../../models/returnOrder');
const InternalOrder = require('../../models/internalOrder');

const TestDescriptor = require('../../models/testDescriptor');
const TestResult = require('../../models/testResult');
const User = require('../../models/user');
const encryption = require("../../utilityEncryption");

describe('[DB] restock orders GET functions', () => {
    test('get all restock orders', async () => {
        const ros = await dao.getAllRestockOrders();
        for (const ro of ros) {
            expect(ro).toBeInstanceOf(RestockOrder);
        }
    });
    test('get restock order in state: delivered', async () => {
        const ros = await dao.getRestockOrdersInState('DELIVERED');
        for (const ro of ros) {
            expect(ro).toBeInstanceOf(RestockOrder);
            expect(ro.getState()).toBe('DELIVERED');
        }
    });
    test('get restock order by id', async () => {
        let id = 1;
        let ro = await dao.getRestockOrder(id);
        expect(ro).toBeInstanceOf(RestockOrder);
        expect(ro.getId()).toBe(id);
        // id not in db
        id = 999;
        ro = await dao.getRestockOrder(id);
        expect(ro).toBe(null);
    });
    test('get sku of a restock order', async () => {
        let id = 1;
        const skus = await dao.getRestockOrderSku(id);
        for (const sku of skus) {
            expect(sku).toEqual({
                SKUId: expect.any(Number),
                description: expect.any(String),
                price: expect.any(Number),
                qty: expect.any(Number),
            })
        }
        // id not in db
        id = 999;
        const skus2 = await dao.getRestockOrderSku(id);
        expect(skus2).toEqual([]);
    });
    test('get sku items of a restock order', async () => {
        let id = 1;
        const items = await dao.getRestockOrderSkuItems(id);
        for (const item of items) {
            expect(item).toEqual({
                SKUId: expect.any(Number),
                rfid: expect.any(String),
            })
        }
        // id not in db
        id = 999;
        const items2 = await dao.getRestockOrderSkuItems(id);
        expect(items2).toEqual([]);
    });
    test('get return items of a restock order', async () => {
        let id = 1;
        const items = await dao.getReturnItemsByRestockOrderId(id);
        for (const item of items) {
            expect(item).toEqual({
                SKUId: expect.any(Number),
                RFID: expect.any(String),
            })
        }
        // id not in db
        id = 999;
        const items2 = await dao.getReturnItemsByRestockOrderId(id);
        expect(items2).toEqual([]);
    });
});

describe('[DB] restock orders CREATE UPDATE DELETE functions', () => {
    let exOrder;
    let exProducts = [{
        SKUId: 1,
        description: "description",
        price: 10.99,
        qty: 2,
    }];
    let exSkuItem = [{
        SKUId: 1,
        RFID: "123456789",
    }];
    let newOrder;
    beforeAll(async () => {
        exOrder = await dao.getRestockOrder(1);
        newOrder = new RestockOrder(
            exOrder.getIssueDate(),
            exProducts,
            1,
            "test"
        );
    });

    test('create restock order', async () => {
        newOrder = await dao.storeRestockOrder(newOrder);
        expect(newOrder).toBeInstanceOf(RestockOrder);
        expect(newOrder.getId()).toBeGreaterThan(exOrder.getId());
    });

    test('add restock order sku', async () => {
        let result = await dao.storeRestockOrderSku(newOrder.getId(), exProducts);
        expect(result).toBe(true);
    });

    test('add sku items of a restock order', async () => {
        let result = await dao.storeRestockOrderSkuItems(newOrder.getId(), exSkuItem);
        expect(result).toBe(true);
    });

    test('update state of restock order', async () => {
        const oldState = newOrder.getState();
        let result = await dao.updateRestockOrder(newOrder);

        newOrder.setState(oldState);
        expect(result).toBe(true);

    });

    test('update transport note of restock order', async () => {
        const oldNote = newOrder.getTransportNote();
        let result = await dao.updateRestockOrder(newOrder);

        newOrder.setTransportNote(oldNote);
        expect(result).toBe(true);
    });

    test('delete restock order sku items', async () => {
        let result = await dao.deleteRestockOrderSkuItems(newOrder.getId());
        expect(result).toBe(true);
    });

    test('delete restock order sku', async () => {
        let result = await dao.deleteRestockOrderSku(newOrder.getId());
        expect(result).toBe(true);
    });

    test('delete restock order', async () => {
        let result = await dao.deleteRestockOrder(newOrder.getId());
        expect(result).toBe(true);
    });

});

describe('[DB] return orders functions', () => {
    let exOder;
    let fakeProducts = [{
        SKUId: 1,
        description: "a product",
        price: 10.99,
        RFID: "123456789",

    },
    {
        SKUId: 1,
        description: "a product two",
        price: 13.99,
        RFID: "223456789",
    }
    ];
    let fakeOrder = new ReturnOrder(
        "2020/01/01",
        fakeProducts,
        1
    );

    test('get all return orders', async () => {
        const ros = await dao.getAllReturnOrders();
        for (const ro of ros) {
            expect(ro).toBeInstanceOf(ReturnOrder);
        }
    });
    test('get return order by id', async () => {
        let id = 1;
        let ro = await dao.getReturnOrder(id);
        exOder = ro;
        expect(ro).toBeInstanceOf(ReturnOrder);
        expect(ro.getId()).toBe(id);
        // id not in db
        id = 999;
        ro = await dao.getReturnOrder(id);
        expect(ro).toBe(null);
    });
    test('get sku items of a return order', async () => {
        let id = 1;
        const items = await dao.getReturnOrderSkuItems(id);
        for (const item of items) {
            expect(item).toEqual({
                SKUId: expect.any(Number),
                description: expect.any(String),
                price: expect.any(Number),
                RFID: expect.any(String),
            });
        }
    });
    test('store return order', async () => {
        fakeOrder = await dao.storeReturnOrder(fakeOrder);
        expect(fakeOrder).toBeInstanceOf(ReturnOrder);
        expect(fakeOrder.getId()).toBeGreaterThan(exOder.getId());

    });
    test('add sku items to a return order', async () => {
        let result = await dao.storeReturnOrderSkuItems(fakeOrder.getId(), fakeProducts);
        expect(result).toBe(true);
    });
    test('delete return order sku items', async () => {
        let result = await dao.deleteReturnOrderSkuItems(fakeOrder.getId());
        expect(result).toBe(true);
    });
    test('delete return order', async () => {
        let result = await dao.deleteReturnOrder(fakeOrder.getId());
        expect(result).toBe(true);
    });
});

describe('[DB] internal orders GET functions', () => {
    test('get all internal orders', async () => {
        const orders = await dao.getAllInternalOrders();
        for (const order of orders) {
            expect(order).toBeInstanceOf(InternalOrder);
        }
    });
    test('get internal order in a state', async () => {
        let orders = await dao.getInternalOrdersInState('ISSUED');
        for (const order of orders) {
            expect(order).toBeInstanceOf(InternalOrder);
            expect(order.getState()).toBe('ISSUED');
        }

        orders = await dao.getInternalOrdersInState('ACCEPTED');
        for (const order of orders) {
            expect(order).toBeInstanceOf(InternalOrder);
            expect(order.getState()).toBe('ACCEPTED');
        }
    });
    test('get internal order by id', async () => {
        let id = 1;
        let order = await dao.getInternalOrder(id);
        expect(order).toBeInstanceOf(InternalOrder);
        expect(order.getId()).toBe(id);
        // id not in db
        id = 999;
        order = await dao.getInternalOrder(id);
        expect(order).toBe(null);
    });
    test('get internal order sku', async () => {
        let id = 1;
        const skus = await dao.getInternalOrderSku(id);
        for (const sku of skus) {
            expect(sku).toEqual({
                SKUId: expect.any(Number),
                description: expect.any(String),
                price: expect.any(Number),
                qty: expect.any(Number),
            });
        }
    })

    test('get internal order sku items', async () => {
        let id = 1;
        const items = await dao.getInternalOrderSkuItems(id);
        for (const item of items) {
            expect(item).toEqual({
                SKUId: expect.any(Number),
                RFID: expect.any(String),
            });
        }
    });

});

describe('[DB] internal orders CREATE UPDATE DELETE functions', () => {
    let exOrder;
    let fakeProducts = [{
        SKUId: 1,
        description: "a product",
        price: 10.99,
        qty: 1,

    },
    {
        SKUId: 2,
        description: "a product two",
        price: 13.99,
        qty: 2,
    }
    ];

    let fakeItems = [{
        SkuID: 1,
        RFID: "123456789",
    },
    {
        SkuID: 2,
        RFID: "223456789",
    }]

    let fakeOrder = new InternalOrder(
        "2020/01/01",
        fakeProducts,
        1
    );

    beforeAll(async () => {
        exOrder = await dao.getInternalOrder(1);
    });
    test('store internal order', async () => {
        fakeOrder = await dao.storeInternalOrder(fakeOrder);
        expect(fakeOrder).toBeInstanceOf(InternalOrder);
        expect(fakeOrder.getId()).toBeGreaterThan(exOrder.getId());
    });

    test('add internal order sku', async () => {
        let result = await dao.storeInternalOrderSku(fakeOrder.getId(), fakeProducts);
        expect(result).toBe(true);
    });

    test('add internal order sku items', async () => {
        let result = await dao.storeInternalOrderSkuItems(fakeOrder.getId(), fakeItems);
        expect(result).toBe(true);
    });

    test('update internal order', async () => {
        const oldState = fakeOrder.getState();
        fakeOrder.setState('ACCEPTED');
        let result = await dao.updateInternalOrder(fakeOrder);

        fakeOrder.setState(oldState);
        expect(result).toBe(true);

    });

    test('delete internal order sku items', async () => {
        let result = await dao.deleteInternalOrderSkuItems(fakeOrder.getId());
        expect(result).toBe(true);
    });

    test('delete internal order sku', async () => {
        let result = await dao.deleteInternalOrderSku(fakeOrder.getId());
        expect(result).toBe(true);
    });

    test('delete internal order', async () => {
        let result = await dao.deleteInternalOrder(fakeOrder.getId());
        expect(result).toBe(true);
    });

});

//#region TestDescriptor
describe('[DB] test descriptor GET functions', () => {

    test('get all test descriptors', async () => {
        const tds = await dao.getAllTestDescriptors();
        for (const td of tds) {
            expect(td).toBeInstanceOf(TestDescriptor);
        }
    });

    test('get test descriptor by id', async () => {
        let id = 1;
        let td = await dao.getTestDescriptor(id);
        expect(td).toBeInstanceOf(TestDescriptor);
        expect(td.getId()).toBe(id);

        // id not in db
        id = 999;
        td = await dao.getTestDescriptor(id);
        expect(td).toBe(null);
    });

    test('get test descriptors of a sku', async () => {
        let skuId = 1;
        const tds = await dao.getTestDescriptorsOf(skuId);
        for (const td of tds) {
            expect(td).toEqual(expect.any(Number));
        }

        // skuId not in db
        skuId = 999;
        const tds2 = await dao.getTestDescriptorsOf(skuId);
        expect(tds2).toEqual([]);
    });
})

describe('[DB] test descriptor CREATE UPDATE DELETE functions', () => {

    let exTest;
    let newTest;
    beforeAll(async () => {
        exTest = await dao.getTestDescriptor(1);
        newTest = new TestDescriptor(null, 'test desc test', 'this is a test...', 1);
    });

    test('create test descriptor', async () => {
        newTest = await dao.storeTestDescriptor(newTest);
        expect(newTest).toBeInstanceOf(TestDescriptor);
        expect(newTest.getId()).toBeGreaterThan(exTest.getId());
    });

    test('update test descriptor', async () => {
        const oldName = newTest.getName();
        newTest.setName('updated name');
        let result = await dao.updateTestDescriptor(newTest);
        newTest.setName(oldName);
        expect(result).toBe(true);
    });

    test('delete test descriptor', async () => {
        let result = await dao.deleteTestDescriptor(newTest.getId());
        expect(result).toBe(true);
    });
})
//#endregion

//#region TestResult
describe('[DB] test result GET functions', () => {

    test('get all test result of a skuItem', async () => {
        let rfid = '12345678901234567890123456789015';
        const trs = await dao.getAllTestResultsBySkuItem(rfid);
        for (const tr of trs) {
            expect(tr).toBeInstanceOf(TestResult);
        }

        rfid = '12345678901234567890123456789000';
        const trs2 = await dao.getAllTestResultsBySkuItem(rfid);
        expect(trs2).toEqual([]);
    });

    test('get test result by id and rfid', async () => {
        let id = 1;
        let rfid = '12345678901234567890123456789011';
        let tr = await dao.getTestResult(id, rfid);
        expect(tr).toBeInstanceOf(TestResult);
        expect(tr.getId()).toBe(id);
        expect(tr.getRfid()).toBe(rfid);

        // id not in db
        id = 999;
        tr = await dao.getTestResult(id, rfid);
        expect(tr).toBe(null);
    });

    test('get negative test result of skuItem', async () => {
        let rfid = '12345678901234567890123456789015';
        let trs = await dao.getNegativeTestResultsOf(rfid);
        for (let tr of trs) {
            expect(tr).toBeInstanceOf(TestResult);
            expect(tr.getResult()).toBe(0);
            expect(tr.getRfid()).toBe(rfid);
        }

        // rfid not in db
        rfid = '12345678901234567890123456789000';
        tr = await dao.getNegativeTestResultsOf(rfid);
        expect(tr).toEqual([]);
    });
})

describe('[DB] test result CREATE UPDATE DELETE functions', () => {

    let exTest;
    let newTest;
    beforeAll(async () => {
        exTest = await dao.getTestResult(2, '12345678901234567890123456789015');
        newTest = new TestResult(null, '12345678901234567890123456789011', 3, '2022/05/05', true);
    });

    test('create test result', async () => {
        newTest = await dao.storeTestResult(newTest);
        expect(newTest).toBeInstanceOf(TestResult);
        expect(newTest.getId()).toBeGreaterThan(exTest.getId());
    });

    test('update test result', async () => {
        const oldDate = newTest.getDate();
        newTest.setDate('2022/06/06');
        let result = await dao.updateTestResult(newTest);
        newTest.setDate(oldDate);
        expect(result).toBe(true);
    });

    test('delete test result', async () => {
        let result = await dao.deleteTestResult(newTest.getId(), newTest.getRfid());
        expect(result).toBe(true);
    });
})
//#endregion

//#region User
describe('[DB] user GET functions', () => {

    test('get user by id and type', async () => {
        let id = 1;
        let type = 'supplier';
        let u = await dao.getUserByIdAndType(id, type);
        expect(u).toBeInstanceOf(User);
        expect(u.getId()).toEqual(id);
        expect(u.getType()).toEqual(type);

        id = 111;;
        u = await dao.getUserByIdAndType(id, type);
        expect(u).toBe(null);
    })

    test('get user by username and type', async () => {
        let username = 'e1@gmail.com';
        let type = 'supplier';
        let u = await dao.getUser(username, type);
        expect(u).toBeInstanceOf(User);
        expect(u.getEmail()).toEqual(username);
        expect(u.getType()).toEqual(type);

        username = 'e111@gmail.com';;
        u = await dao.getUser(username, type);
        expect(u).toBe(null);
    })

    test('get all users of type', async () => {
        let type = 'supplier';
        let users = await dao.getAllUsersOfType(type);
        for (let u of users) {
            expect(u).toBeInstanceOf(User);
            expect(u.getType()).toEqual(type);
        }

        type = 'seller';
        users = await dao.getAllUsersOfType(type);
        expect(tr).toEqual([]);
    });

    test('get all users except managers', async () => {
        const users = await dao.getAllUsers();
        for (const u of users) {
            expect(u).toBeInstanceOf(User);
            expect(u.getType()).not.toBe('manager');
        }
    });
})

describe('[DB] user CREATE UPDATE DELETE functions', () => {

    let exUser;
    let newUser;
    beforeAll(async () => {
        exUser = await dao.getUser('e1@gmail.com', 'supplier');
        newUser = new User(null, 'N8', 'S8', 'e8@gmail.com', 'clerk', await encryption.hashPassword('pass8'));
    });

    test('create user', async () => {
        newUser = await dao.storeNewUser(newUser);
        expect(newUser).toBeInstanceOf(User);
        expect(newUser.getId()).toBeGreaterThan(exUser.getId());
    });

    test('update user', async () => {
        const oldType = newUser.getType();
        newUser.setType('customer');
        let result = await dao.updateUser(newUser);
        newUser.setType(oldType);
        expect(result).toEqual(true);
    });

    test('delete user', async () => {
        let result = await dao.deleteUser(newUser.getId());
        expect(result).toEqual(true);
    });
})
//#endregion
