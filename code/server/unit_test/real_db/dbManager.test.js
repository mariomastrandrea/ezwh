const DbManagerFactory = require('../../db/dbManager');
const dao = DbManagerFactory();

const RestockOrder = require('../../models/restockOrder');
const ReturnOrder = require('../../models/returnOrder');
const InternalOrder = require('../../models/internalOrder');

const TestDescriptor = require('../../models/testDescriptor');
const TestResult = require('../../models/testResult');
const User = require('../../models/user');
const encryption = require("../../utilityEncryption");

const Position = require('../../models/position');
const Sku = require('../../models/sku');
const SkuItem = require('../../models/skuItem');
const Item = require("../../models/item");

//#region RestockOrder
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
        //exOrder = await dao.getRestockOrder(1);
        newOrder = new RestockOrder(
            "2021/03/03 09:33",
            exProducts,
            1,
            "test"
        );
    });

    test('create restock order', async () => {
        newOrder = await dao.storeRestockOrder(newOrder);
        expect(newOrder).toBeInstanceOf(RestockOrder);
        //expect(newOrder.getId()).toBeGreaterThan(exOrder.getId());
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
//#endregion

//#region ReturnOrder
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
//#endregion

//#region InternalOrder
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
//#endregion

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

        // test setters
        td.setName('0abc');
        td.setProcedureDescription('descdesc');
        td.setSkuId(123);

        expect(td.getName()).toEqual('0abc');
        expect(td.getProcedureDescription()).toEqual('descdesc');
        expect(td.getSkuId()).toEqual(123);

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

        // test setters
        tr.setTestDescriptorId(23)
        tr.setDate("2022/03/03");
        tr.setResult(false);

        expect(tr.getTestDescriptorId()).toEqual(23)
        expect(tr.getDate()).toEqual("2022/03/03")
        expect(tr.getResult()).toEqual(false)

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

        u.setPassword('newPassword');
        expect(u.getPassword()).toEqual('newPassword');

        expect(u.toJSON()).toEqual({
            id: u.getId(),
            name: u.getName(),
            surname: u.getSurname(),
            email: u.getEmail(),
            type: u.getType(),
            password: u.getPassword()
        });

        // user not found
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

//#region Position
describe('[DB] position functions', () => {
    let id = "123412341234"; // id of testing position
    let fakeP = new Position(id, "1234", "1234", "1234", 100., 100., 0., 0.);

    test('get all positions', async () => {
        const positions = await dao.getAllPositions();
        for (const p of positions) {
            aisle = p.getAisle();
            row = p.getRow();
            col = p.getCol();
            expect(p).toBeInstanceOf(Position);
            expect(aisle).toMatch(/^[0-9]{4}$/);
            expect(row).toMatch(/^[0-9]{4}$/);
            expect(col).toMatch(/^[0-9]{4}$/);
            expect(p.getPositionId()).toEqual(aisle + row + col);
            expect(p.getMaxWeight()).toBeGreaterThan(0.);
            expect(p.getMaxVolume()).toBeGreaterThan(0.);
            expect(p.getOccupiedWeight()).toBeLessThanOrEqual(p.getMaxWeight());
            expect(p.getOccupiedVolume()).toBeLessThanOrEqual(p.getMaxVolume());
        }
    });

    test('get position by id', async () => {
        // position with id 800234523415 exists
        let id = "800234523415";
        let p = await dao.getPosition(id);

        aisle = p.getAisle();
        row = p.getRow();
        col = p.getCol();
        expect(p).toBeInstanceOf(Position);
        expect(aisle).toMatch(/^[0-9]{4}$/);
        expect(row).toMatch(/^[0-9]{4}$/);
        expect(col).toMatch(/^[0-9]{4}$/);
        expect(p.getPositionId()).toEqual(aisle + row + col);
        expect(p.getMaxWeight()).toBeGreaterThan(0.);
        expect(p.getMaxVolume()).toBeGreaterThan(0.);
        expect(p.getOccupiedWeight()).toBeLessThanOrEqual(p.getMaxWeight());
        expect(p.getOccupiedVolume()).toBeLessThanOrEqual(p.getMaxVolume());

        // position with id 111 does not exist
        id = "111";
        p = await dao.getPosition(id);
        expect(p).toBe(null);

        // position with id 800234523415 (as number) exists
        id = 800234523415;
        p = await dao.getPosition(id);
        expect(p).toBeInstanceOf(Position);

    });

    test('storePosition', async () => {
        let p = fakeP
        let result = await dao.storePosition(p);
        expect(result).toBeInstanceOf(Position);
        expect(result.toJSON()).toEqual(p.toJSON());

        // unique constraint violation
        await expect(dao.storePosition(p)).rejects.toThrow();
    });

    test('update position', async () => {
        let p = new Position(fakeP.getPositionId(), fakeP.getAisle(), fakeP.getRow(), fakeP.getCol(), 100., 100., 0., 0.);

        p.setAisle("2345");
        p.setRow("2345");
        p.setCol("2345");
        p.setPositionId("234523452345");
        p.setMaxWeight(120.);
        p.setMaxVolume(140.);
        p.setOccupiedWeight(10.);
        p.setOccupiedVolume(11.);

        result = await dao.updatePosition(fakeP.getPositionId(), p);
        expect(result).toBe(true);

        result = await dao.updatePosition(fakeP.getPositionId(), p);
        expect(result).toBe(false);

        // restore original values
        result = await dao.updatePosition(p.getPositionId(), fakeP);
        expect(result).toBe(true);
    });

    test('delete position', async () => {
        let result = await dao.deletePosition(fakeP.getPositionId());
        expect(result).toBe(true);

        // already deleted
        result = await dao.deletePosition(fakeP.getPositionId());
        expect(result).toBe(false);
    });
})

describe('[DB] get occupied capacities of a position', () => {
    let fakeP = new Position("123412341234", "1234", "1234", "1234", 100., 100., 20, 20);
    let fakeP2 = new Position("999", "9", "9", "9", 100., 100., 20, 20);

    test('get occupied capacities of position', async () => {
        // insert new position, associated Sku and a SkuItem
        expect(await dao.storePosition(fakeP)).toBeInstanceOf(Position);
        const newSku = await dao.storeSku(new Sku('', 20, 20, '', 10, 1, fakeP.getPositionId(), [], null));
        expect(newSku).toBeInstanceOf(Sku);
        expect(await dao.storeSkuItem(new SkuItem('1234', newSku.getId(), '', 1, []))).toBeInstanceOf(SkuItem);

        // test getOccupiedCapacitiesOf
        let result = await dao.getOccupiedCapacitiesOf(fakeP.getPositionId());
        expect(result.weight).toEqual(newSku.getWeight());
        expect(result.volume).toEqual(newSku.getVolume());

        // position with id 111 does not exist
        let id = "111";
        result = await dao.getOccupiedCapacitiesOf(id);
        expect(result).toEqual({ "volume": 0, "weight": 0 });

        // add an empty position with its sku
        expect(await dao.storePosition(fakeP2)).toBeInstanceOf(Position);
        const newSku2 = await dao.storeSku(new Sku('', 20, 20, '', 10, 1, fakeP2.getPositionId(), [], null));
        expect(newSku2).toBeInstanceOf(Sku);
        // verify emptiness
        expect(await dao.getOccupiedCapacitiesOf(fakeP2.getPositionId())).toEqual({ "volume": 0, "weight": 0 });

        // restore positions, skus and SkuItems
        expect(await dao.deleteSkuItem('1234')).toBe(true);
        expect(await dao.deleteSku(newSku.getId())).toBe(true);
        expect(await dao.deletePosition(fakeP.getPositionId())).toBe(true);
        expect(await dao.deleteSku(newSku2.getId())).toBe(true);
        expect(await dao.deletePosition(fakeP2.getPositionId())).toBe(true);
    });
});
//#endregion

//#region Sku
describe('[DB] sku functions', () => {
    let fakeId
    let fakeP = new Position("345634563456", "3456", "3456", "3456", 100., 100., 0., 0.);
    let secondFakeP = new Position("456745674567", "4567", "4567", "4567", 100., 100., 0., 0.);
    let fakeSku = new Sku("test", 20., 20., "notes", 234., 0, fakeP.getPositionId(), [], null);

    beforeAll(async () => {
        await dao.storePosition(fakeP);
        await dao.storePosition(secondFakeP);
    });

    afterAll(async () => {
        await dao.deletePosition(fakeP.getPositionId());
        await dao.deletePosition(secondFakeP.getPositionId());
    });

    test('get all skus', async () => {
        const skus = await dao.getAllSkus();
        for (const sku of skus) {
            expect(sku).toBeInstanceOf(Sku);
            expect(sku.getId()).toBeGreaterThan(0.);
            expect(sku.getDescription()).toBeDefined();
            expect(sku.getWeight()).toBeGreaterThan(0.);
            expect(sku.getVolume()).toBeGreaterThan(0.);
            expect(sku.getNotes()).toBeDefined();
            expect(sku.getAvailableQuantity()).toBeGreaterThan(-1);
            expect(sku.getPrice()).toBeGreaterThan(0.);
            expect(sku.getPosition()).toMatch(/^[0-9]{12}$/);
            expect(sku.getTestDescriptors()).toEqual([])
        }
    });

    test('get sku by id', async () => {
        // sku with id 1 exists
        let id = 1;
        let sku = await dao.getSkuById(id);

        expect(sku).toBeInstanceOf(Sku);
        expect(sku.getId()).toBeGreaterThan(0.);
        expect(sku.getDescription()).toBeDefined();
        expect(sku.getWeight()).toBeGreaterThan(0.);
        expect(sku.getVolume()).toBeGreaterThan(0.);
        expect(sku.getNotes()).toBeDefined();
        expect(sku.getAvailableQuantity()).toBeGreaterThan(-1);
        expect(sku.getPrice()).toBeGreaterThan(0.);
        expect(sku.getPosition()).toMatch(/^[0-9]{12}$/);
        expect(sku.getTestDescriptors()).toEqual([])

        // test setters
        sku.setDescription('alleluia');
        sku.setWeight(289);
        sku.setVolume(289);
        sku.setNotes('notesnotes');
        sku.setPosition('123123');
        sku.setAvailableQuantity(99);
        sku.setPrice(118);
        sku.setTestDescriptors([1, 22]);

        expect(sku.toJSON()).toEqual({
            id: sku.getId(),
            description: 'alleluia',
            weight: 289,
            volume: 289,
            notes: 'notesnotes',
            position: '123123',
            availableQuantity: 99,
            price: 118,
            testDescriptors: [1, 22]
        });

        // sku with id 9999 does not exist
        id = 9999;
        sku = await dao.getSkuById(id);
        expect(sku).toBe(null);
    });

    test('get sku of position', async () => {
        // there is not a row
        let id = "123412341235";
        let result = await dao.getSkuOfPosition(id);
        expect(result).toBe(null);

        // there is a sku with id = 1
        let sku = await dao.getSkuById(1);
        result = await dao.getSkuOfPosition(sku.getPosition());
        expect(result).toBeInstanceOf(Sku);
        expect(result.toJSON()).toEqual(sku.toJSON());
    })

    test('store sku', async () => {
        let fakeSkuStored = await dao.storeSku(fakeSku);
        fakeId = fakeSkuStored.getId();

        expect(fakeSkuStored).toBeInstanceOf(Sku);
        expect(fakeSkuStored.getId()).toBeGreaterThan(0);
        expect(fakeSkuStored.getDescription()).toEqual(fakeSku.getDescription());
        expect(fakeSkuStored.getWeight()).toEqual(fakeSku.getWeight());
        expect(fakeSkuStored.getVolume()).toEqual(fakeSku.getVolume());
        expect(fakeSkuStored.getNotes()).toEqual(fakeSku.getNotes());
        expect(fakeSkuStored.getAvailableQuantity()).toEqual(fakeSku.getAvailableQuantity());
        expect(fakeSkuStored.getPrice()).toEqual(fakeSku.getPrice());
        expect(fakeSkuStored.getPosition()).toEqual(fakeSku.getPosition());
        expect(fakeSkuStored.getTestDescriptors()).toEqual(fakeSku.getTestDescriptors());
    });

    test('update sku', async () => {
        let sku = new Sku(
            fakeSku.getDescription(),
            fakeSku.getWeight(),
            fakeSku.getVolume(),
            fakeSku.getNotes(),
            fakeSku.getPrice(),
            fakeSku.getAvailableQuantity(),
            fakeSku.getPosition(),
            fakeSku.getTestDescriptors(),
            5000);
        // not found sku, no update
        expect(await dao.updateSku(sku)).toBe(false);


        sku = new Sku(
            "update test",
            fakeSku.getWeight() + 10,
            fakeSku.getVolume() + 10,
            "update note",
            fakeSku.getPrice() + 10,
            fakeSku.getAvailableQuantity() + 2,
            fakeSku.getPosition(),
            fakeSku.getTestDescriptors(),
            fakeId);
        // update sku
        let oldDesc = fakeSku.getDescription();
        let oldW = fakeSku.getWeight();
        let oldV = fakeSku.getVolume();
        let oldNotes = fakeSku.getNotes();
        let oldAvQ = fakeSku.getAvailableQuantity();
        let oldPrice = fakeSku.getPrice();
        let oldPos = fakeSku.getPosition();

        // check update
        expect(await dao.updateSku(sku)).toBe(true);

        // check updated data
        let dbSku = await dao.getSkuById(fakeId);
        expect(dbSku.toJSON()).toEqual(sku.toJSON());

        // reset data
        sku = new Sku(
            fakeSku.getDescription(),
            fakeSku.getWeight(),
            fakeSku.getVolume(),
            fakeSku.getNotes(),
            fakeSku.getPrice(),
            fakeSku.getAvailableQuantity(),
            fakeSku.getPosition(),
            fakeSku.getTestDescriptors(),
            fakeId);
        expect(await dao.updateSku(sku)).toBe(true);

        expect(sku).toBeInstanceOf(Sku);
        expect(sku.getId()).toBeGreaterThan(0.);
        expect(sku.getDescription()).toBeDefined();
        expect(sku.getWeight()).toBeGreaterThan(0.);
        expect(sku.getVolume()).toBeGreaterThan(0.);
        expect(sku.getNotes()).toBeDefined();
        expect(sku.getAvailableQuantity()).toBeGreaterThan(-1);
        expect(sku.getPrice()).toBeGreaterThan(0.);
        expect(sku.getPosition()).toMatch(/^[0-9]{12}$/);
        expect(sku.getTestDescriptors()).toEqual([])
    });

    test('update position of sku', async () => {
        // no existing position
        let oldPos = fakeSku.getPosition();

        // update position
        result = await dao.updateSkuPosition(oldPos, secondFakeP.getPositionId());
        expect(result).toBe(true);

        // restore position
        expect(await dao.updateSkuPosition(secondFakeP.getPositionId(), oldPos)).toBe(true);
    });

    test('delete sku', async () => {
        // not found sku, no delete
        expect(await dao.deleteSku(999999)).toBe(false);

        // delete sku
        expect(await dao.deleteSku(fakeId)).toBe(true);
    });

});
//#endregion

//#region SkuItems
describe('[DB] SkuItems functions', () => {
    let fakeP = new Position("345634563456", "3456", "3456", "3456", 100., 100., 0., 0.);
    let fakeSku = new Sku("test", 20., 20., "notes", 234., 0, fakeP.getPositionId(), [], null);
    let fakeRFID = "09876543217654327654345678987612"

    beforeAll(async () => {
        await dao.storePosition(fakeP);
        fakeSku = await dao.storeSku(fakeSku);
    });

    afterAll(async () => {
        await dao.deleteSku(fakeSku.getId());
        await dao.deletePosition(fakeP.getPositionId());
    });

    test('get sku item by rfid', async () => {
        // not found sku item, no get
        expect(await dao.getSkuItemByRfid("1")).toBe(null);

        // get sku item of id 12345678901234567890123456789011
        let skuItem = await dao.getSkuItemByRfid("12345678901234567890123456789011");
        expect(skuItem).toBeInstanceOf(SkuItem);
        expect(skuItem.getSkuId()).toBeGreaterThan(0.);
        expect(skuItem.getAvailable()).toBeGreaterThanOrEqual(0);
        expect(skuItem.getAvailable()).toBeLessThanOrEqual(1);
        expect(skuItem.getDateOfStock()).toBeDefined();

        // test setters
        skuItem.setRfid('abcd');
        skuItem.setAvailable(1);
        skuItem.setDateOfStock('data');
        skuItem.setTestResults([22, 66]);

        expect(skuItem.getRfid()).toEqual('abcd');
        expect(skuItem.getAvailable()).toEqual(1);
        expect(skuItem.getDateOfStock()).toEqual('data');
        expect(skuItem.getTestResults()).toEqual([22, 66]);
    });

    test('get all sku items', async () => {
        // get all sku items
        let skuItems = await dao.getAllSkuItems();
        for (skuItem of skuItems) {
            expect(skuItem).toBeInstanceOf(SkuItem);
            expect(skuItem.getRfid()).toMatch(/^[0-9]{32}$/);
            expect(skuItem.getSkuId()).toBeGreaterThan(0.);
            expect(skuItem.getAvailable()).toBeGreaterThanOrEqual(0);
            expect(skuItem.getAvailable()).toBeLessThanOrEqual(1);
            expect(skuItem.getDateOfStock()).toBeDefined();
        }
    });

    test('get sku items of sku', async () => {
        // not found sku, no get
        expect(await dao.getSkuItemsOf(999999)).toEqual([]);

        // get sku items of sku
        let skuItems = await dao.getSkuItemsOf(1);
        for (skuItem of skuItems) {
            expect(skuItem).toBeInstanceOf(SkuItem);
            expect(skuItem.getRfid()).toMatch(/^[0-9]{32}$/);
            expect(skuItem.getSkuId()).toEqual(1);
            expect(skuItem.getAvailable()).toBeGreaterThanOrEqual(0);
            expect(skuItem.getAvailable()).toBeLessThanOrEqual(1);
            expect(skuItem.getDateOfStock()).toBeDefined();
        }
    });

    test('get available sku items of sku', async () => {
        // not found sku, no get
        expect(await dao.getAvailableSkuItemsOf(999999)).toEqual([]);

        // get sku items of sku
        let skuItems = await dao.getAvailableSkuItemsOf(1);
        for (skuItem of skuItems) {
            expect(skuItem).toBeInstanceOf(SkuItem);
            expect(skuItem.getRfid()).toMatch(/^[0-9]{32}$/);
            expect(skuItem.getSkuId()).toEqual(1);
            expect(skuItem.getAvailable()).toEqual(1);
            expect(skuItem.getDateOfStock()).toBeDefined();
        }
    });

    test('store sku item', async () => {
        let fakeSI = new SkuItem(fakeRFID, fakeSku.getId(), "2022/05/22");
        // store sku item
        let skuItem = await dao.storeSkuItem(fakeSI);
        expect(skuItem).toBeInstanceOf(SkuItem);
        expect(skuItem.getRfid()).toEqual(fakeSI.getRfid());
        expect(skuItem.getSkuId()).toEqual(fakeSI.getSkuId());
        expect(skuItem.getAvailable()).toEqual(fakeSI.getAvailable());
        expect(skuItem.getDateOfStock()).toBe(fakeSI.getDateOfStock());
    });

    test('update sku item', async () => {
        let fakeSI = new SkuItem(fakeRFID, fakeSku.getId(), "2022/05/22", 1);
        // no existing sku item
        let oldRfid = fakeSI.getRfid();
        expect(await dao.updateSkuItem(123, fakeSI)).toBe(false);

        let newSI = new SkuItem("88887777666655554444333311110000", 1, "2022/05/21", 0);

        // update sku item
        result = await dao.updateSkuItem(oldRfid, newSI);
        expect(result).toBe(true);

        let newFromDb = await dao.getSkuItemByRfid(newSI.getRfid());
        expect(newFromDb.toJSON()).toEqual(newSI.toJSON());

        // restore sku item
        expect(await dao.updateSkuItem(newSI.getRfid(), fakeSI)).toBe(true);
    });

    test('delete sku item', async () => {
        // not found sku item, no delete
        expect(await dao.deleteSkuItem("1")).toBe(false);

        // delete sku item
        expect(await dao.deleteSkuItem(fakeRFID)).toBe(true);
    });
})
//#endregion

//#region Items
describe('[DB] Items functions', () => {
    const fakeItem1 = new Item(99991, "desc", 88.0, 3, 1);
    const fakeItem2 = new Item(99992, "desc", 177.0, 5, 1);
    let storedItem1, storedItem2;

    beforeAll(async () => {
        storedItem1 = await dao.storeItem(fakeItem1);
        storedItem2 = await dao.storeItem(fakeItem2);
    });

    afterAll(async () => {
        await dao.deleteItem(storedItem1.getId());
        await dao.deleteItem(storedItem2.getId());
    });

    test('get all items test', async () => {
        const allItems = await dao.getAllItems();

        for (let item of allItems) {
            expect(item).toBeInstanceOf(Item);
            expect(item.getId()).toBeGreaterThan(0);
            expect(item.getDescription()).toBeDefined();
            expect(item.getPrice()).toBeGreaterThanOrEqual(0);
            expect(item.getSkuId()).toBeGreaterThan(0);
            expect(item.getSupplierId()).toBeGreaterThan(0);
        }
    });

    test('get item by id', async () => {
        // item not found
        expect(await dao.getItemById(11110000)).toBe(null);

        const item1 = await dao.getItemById(fakeItem1.getId());
        expect(item1).toBeInstanceOf(Item);
        expect(item1.getId()).toBeGreaterThan(0);
        expect(item1.getDescription()).toBeDefined();
        expect(item1.getPrice()).toBeGreaterThanOrEqual(0);
        expect(item1.getSkuId()).toBeGreaterThan(0);
        expect(item1.getSupplierId()).toBeGreaterThan(0);

        expect(item1.toJSON()).toEqual(storedItem1.toJSON());

        // test references
        const relatedSku = await dao.getSkuById(item1.getSkuId());
        expect(relatedSku).toBeInstanceOf(Sku);
        expect(relatedSku.getId()).toEqual(item1.getSkuId());

        const relatedSupplier = await dao.getUserByIdAndType(item1.getSupplierId(), 'supplier');
        expect(relatedSupplier).toBeInstanceOf(User);
        expect(relatedSupplier.getId()).toEqual(item1.getSupplierId());

        // test setters
        item1.setDescription('modified desc');
        item1.setPrice(9);
        item1.setSkuId(2);

        expect(item1.getDescription()).toEqual('modified desc');
        expect(item1.getPrice()).toEqual(9);
        expect(item1.getSkuId()).toEqual(2);
    });

    test('get item by sku id and supplier', async () => {
        // item not found
        expect(await dao.getItemBySkuIdAndSupplier(10, 100)).toBe(null);

        const item1 = await dao.getItemBySkuIdAndSupplier(storedItem1.getSkuId(), storedItem1.getSupplierId());
        expect(item1).toBeInstanceOf(Item);
        expect(item1.toJSON()).toEqual(storedItem1.toJSON());
        expect(item1.toJSON()).not.toBe(storedItem1.toJSON());
        expect(item1.getSkuId()).toEqual(storedItem1.getSkuId());
        expect(item1.getSupplierId()).toEqual(storedItem1.getSupplierId());
    });

    test('store item test', async () => {
        const fakeNewItem = new Item(2222, 'pappa', 99, 5, 2);
        const createdItem = await dao.storeItem(fakeNewItem);

        expect(createdItem).toBeInstanceOf(Item);
        expect(createdItem).not.toBe(fakeNewItem);
        expect(createdItem.toJSON()).toEqual(fakeNewItem.toJSON());

        expect(dao.storeItem(fakeNewItem)).rejects.toThrow();   // insert the same item the 2nd time
        await dao.deleteItem(createdItem.getId());
    });


    test('update item test', async () => {
        // item not found
        const itemToNotUpdate = new Item(200 * storedItem1.getId(), 'mod desc', 10000, storedItem1.getSkuId(), storedItem1.getSupplierId());
        let wasItemUpdated = await dao.updateItem(itemToNotUpdate);
        expect(wasItemUpdated).toBe(false);

        // update item
        const itemToUpdate = new Item(storedItem1.getId(), 'mod desc', 10000, storedItem1.getSkuId(), storedItem1.getSupplierId());

        wasItemUpdated = await dao.updateItem(itemToUpdate);
        expect(wasItemUpdated).toBe(true);

        const itemUpdated = await dao.getItemById(storedItem1.getId());
        expect(itemUpdated).toBeInstanceOf(Item);
        expect(itemUpdated).not.toEqual(storedItem1);
        expect(itemUpdated.getId()).toEqual(storedItem1.getId());
        expect(itemUpdated.getDescription()).not.toEqual(storedItem1.getDescription());
        expect(itemUpdated.getDescription()).toEqual('mod desc');
        expect(itemUpdated.getPrice()).not.toEqual(storedItem1.getPrice());
        expect(itemUpdated.getPrice()).toEqual(10000);
        expect(itemUpdated.getSkuId()).toEqual(storedItem1.getSkuId());
        expect(itemUpdated.getSupplierId()).toEqual(storedItem1.getSupplierId());

        // throw err
        expect(dao.updateItem(new Item(storedItem1.getId(), '', '', '', ''))).rejects.toThrow();

        // restore item
        await dao.updateItem(storedItem1);
    });

    test('delete item test', async () => {
        // delete item
        expect(await dao.deleteItem(storedItem1.getId())).toBe(true);

        // not found item, no delete
        expect(await dao.deleteItem(storedItem1.getId())).toBe(false);

        // restore item
        expect(await dao.storeItem(storedItem1)).toBeInstanceOf(Item);
    });
});
//#endregion

//#region FORCING to reject
describe('[DB] close db and testing functions', () => {
    beforeAll(async () => {
        dao.closeDb();
    })
    test(' getPosition reject', async () => {
        try {
            await dao.getPosition(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test(' storeInternalOrder reject', async () => {
        try {
            await dao.storeInternalOrder(new InternalOrder("123", [1, 2], 1));
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test(' get all positions reject', async () => {
        try {
            await dao.getAllPositions();
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('delete position reject', async () => {
        try {
            await dao.deletePosition(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('get occupied capacity of position reject', async () => {
        try {
            await dao.getOccupiedCapacitiesOf(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('get sku by id reject', async () => {
        try {
            await dao.getSkuById(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getSkuOfPosition reject', async () => {
        try {
            await dao.getSkuOfPosition(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getAllSkuItems reject', async () => {
        try {
            await dao.getAllSkuItems();
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getSkuItemByRfid reject', async () => {
        try {
            await dao.getSkuItemByRfid(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getSkuItemsOf reject', async () => {
        try {
            await dao.getSkuItemsOf(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getAvailableSkuItemsOf reject', async () => {
        try {
            await dao.getAvailableSkuItemsOf(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('deleteSkuItem reject', async () => {
        try {
            await dao.deleteSkuItem(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getAllItems reject', async () => {
        try {
            await dao.getAllItems();
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('getItemById reject', async () => {
        try {
            await dao.getItemById(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    });
    test('deleteItem reject', async () => {
        try {
            await dao.deleteItem(1);
        } catch (err) {
            expect(err.message).toMatch(/SQLITE_MISUSE/);
        }
    })
});
//#endregion



//#region TESTING FUNCTIONS
/*
describe('[DB] delete and fill', () =>{
    let tables = [
        "ReturnOrderSkuItem",
        "ReturnOrder",
        "RestockOrderSkuItem",
        "RestockOrderSku",
        "RestockOrder",
    ]
    for (const table of tables) {
        test(`delete ${table}`, async () => {
            let result = await dao.deleteTable(table);
            expect(typeof result === 'boolean').toBeTruthy();
        });
    }
})
*/
//#endregion
