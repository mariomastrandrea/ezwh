const DbManagerFactory = require('../../db/dbManager3');
const dao = DbManagerFactory();
const RestockOrder = require('../../models/restockOrder');

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
        expect(ro).toBe(undefined);
    });
    test('get sku of a restock order', async () => {
        let id = 1;
        const skus = await dao.getRestockOrderSku(id);
        for (const sku of skus) {
            expect(sku).toEqual({
                SKUId: expect.any(Number),
                description: expect.any(String),
                price: expect.any(Number),
                quantity: expect.any(Number),
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
                RFID: expect.any(String),
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
        quantity: 2,
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
            "test",
            2
        );
    });

    // **** NOT WORKING ****

     test('create restock order', async () => {
         newOrder = await dao.storeRestockOrder(newOrder);
         expect(newOrder).toBeInstanceOf(RestockOrder);
         expect(newOrder.getId()).toBe(exOrder.getId() + 1);
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

    /*
    test('delete restock order', async () => {
        let result = await dao.deleteRestockOrder(exOrder.getId() + 1);
        expect(result).toBe(true);
    });
    */
});

