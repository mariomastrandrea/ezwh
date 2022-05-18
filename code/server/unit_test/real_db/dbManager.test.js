const DbManagerFactory = require('../../db/dbManager');
const dao = DbManagerFactory();
const RestockOrder = require('../../models/restockOrder');
const ReturnOrder = require('../../models/returnOrder');
const InternalOrder = require('../../models/internalOrder');

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
    test('add sku items of a return order', async () => {
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
