const RestockOrderService = require('../../services/restockOrderService');
const dao = require('../mock/mockDbManager');
const RestockOrder = require('../../models/restockOrder');
const Item = require('../../models/item');

const restockOrderService = new RestockOrderService(dao);
const fakeRestockOrder = new RestockOrder(
    "2021/11/29 09:33",
    [
        {
            SKUId: 1,
            itemId: 1,
            description: "description",
            price: 10.99,
            qty: 2,
        },
        {
            SKUId: 2,
            itemId: 2,
            description: "description 2",
            price: 10.99,
            qty: 2,
        },
    ],
    1,
    { deliveryDate: "2021/11/30" },
    1,
    [
        {
            SKUId: 1,
            itemId: 1,
            RFID: "123456789",
        },
        {
            SKUId: 1,
            itemId: 1,
            RFID: "123456709",
        }
    ],
    "DELIVERY"
);
const fakeIssuedRestockOrder = new RestockOrder(
    "2021/11/29 09:33",
    [
        {
            SKUId: 1,
            itemId: 1,
            description: "description",
            price: 10.99,
            qty: 2,
        },
        {
            SKUId: 2,
            itemId: 2,
            description: "description 2",
            price: 10.99,
            qty: 2,
        },
    ],
    1,
);

// test case definition
describe('get restock orders', () => {

    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.getRestockOrder.mockReturnValueOnce(
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                1,
                { deliveryDate: "2021/11/30" },
                1,
                [],
                "DELIVERY"
            )
        ).mockReturnValueOnce(
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                1,
                "delivered on 2021/12/05",
                1,
                [],
                "COMPLETEDRETURN"
            )
        ).mockReturnValue();

        dao.getRestockOrderSku.mockReset();
        dao.getRestockOrderSku.mockReturnValueOnce([
            {
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            },
            {
                SKUId: 2,
                itemId: 2,
                description: "description 2",
                price: 10.99,
                qty: 2,
            },
        ]).mockReturnValue([
            {
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            },
            {
                SKUId: 2,
                itemId: 2,
                description: "description 2",
                price: 10.99,
                qty: 2,
            },
        ]);

        dao.getRestockOrderSkuItems.mockReset();
        dao.getRestockOrderSkuItems.mockReturnValueOnce([
            {
                SKUId: 1,
                itemId: 1,
                RFID: "123456789",
            },
            {
                SKUId: 1,
                itemId: 1,
                RFID: "123456709",
            }
        ]).mockReturnValue([
            {
                SKUId: 2,
                itemId: 2,
                RFID: "133456789",
            },
            {
                SKUId: 2,
                itemId: 2,
                RFID: "113456709",
            }
        ]);

        dao.getAllRestockOrders.mockReset();
        dao.getAllRestockOrders.mockReturnValueOnce([
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                1,
                "delivered on 2021/12/05",
                1,
                [],
                "DELIVERED"
            ),
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                1,
                "delivered on 2021/12/05",
                2,
                [],
                "DELIVERED"
            ),
        ]).mockReturnValue([]);

        dao.getRestockOrdersInState.mockReset();
        dao.getRestockOrdersInState.mockReturnValueOnce([
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                1
            ),
            new RestockOrder(
                "2021/11/29 09:33",
                [],
                2
            ),
        ]).mockReturnValue([]);

        dao.getReturnItemsByRestockOrderId.mockReset();
        dao.getReturnItemsByRestockOrderId.mockReturnValue(
            [
                {
                    SKUId: 1,
                    itemId: 1,
                    RFID: "123456789",
                },
                {
                    SKUId: 1,
                    itemId: 1,
                    RFID: "123456709",
                }
            ]
        );
    });

    test('get restock Order By Id', async () => {
        const id = 1;
        let res = await restockOrderService.getRestockOrderById(id);
        // expected 200
        expect(res.obj.toJSON()).toEqual(fakeRestockOrder.toJSON());
        expect(res.code).toEqual(200);

        res = await restockOrderService.getRestockOrderById(id + 1);
        expect(res.obj.getState()).toEqual("COMPLETEDRETURN");
        expect(res.code).toEqual(200);
        // expected 404
        const notId = 2938329;
        res = await restockOrderService.getRestockOrderById(notId);
        expect(res.error).toEqual(expect.stringContaining('Not Found'));
        expect(res.code).toEqual(404);
    });

    test('get all restock orders', async () => {
        let res = await restockOrderService.getAllRestockOrders();
        // expected 200
        for (const item of res.obj) {
            expect(item).toBeInstanceOf(RestockOrder);
        }
        expect(res.code).toEqual(200);

        // expected 200 but empty
        res = await restockOrderService.getAllRestockOrders();
        expect(res.obj).toEqual([]);
        expect(res.code).toEqual(200);
    });

    test('get issued restock orders', async () => {
        let res = await restockOrderService.getIssuedRestockOrders();
        // expected 200
        for (const item of res.obj) {
            expect(item).toBeInstanceOf(RestockOrder);
            expect(item.getState()).toEqual('ISSUED');
        }
        expect(res.code).toEqual(200);

        // expected 200 but empty
        res = await restockOrderService.getIssuedRestockOrders();
        expect(res.obj).toEqual([]);
        expect(res.code).toEqual(200);
    });

    test('get return items by restock order', async () => {
        const id = 1;
        let res = await restockOrderService.getReturnItemsByRestockOrderId(id);
        // expected 422 because not completed return
        expect(res.error).toEqual(expect.stringContaining('Unprocessable Entity'));
        expect(res.code).toEqual(422);

        // expected 200
        res = await restockOrderService.getReturnItemsByRestockOrderId(id + 1);
        expect(res.obj).toEqual([
            {
                SKUId: 1,
                itemId: 1,
                RFID: "123456789",
            },
            {
                SKUId: 1,
                itemId: 1,
                RFID: "123456709",
            }
        ]);
        expect(res.code).toEqual(200);

        // expect 404 because no restock order with id
        res = await restockOrderService.getReturnItemsByRestockOrderId(id + 2);
        expect(res.error).toEqual(expect.stringContaining('Not Found'));
        expect(res.code).toEqual(404);
    });
});

describe("create restock order", () => {
    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.getRestockOrderSku.mockReset();

        dao.storeRestockOrder.mockReturnValue(
            new RestockOrder(
                "2021/11/29 09:33",
                [{
                    SKUId: 1,
                    itemId: 1,
                    description: "description",
                    price: 10.99,
                    qty: 2,
                }],
                1,
                "",
                1
            )
        );

        dao.storeRestockOrderSku
            .mockReturnValueOnce(1)
            .mockReturnValue(0);
    })
    test('add restock order', async () => {
        dao.getUserByIdAndType.mockReset();
        dao.getUserByIdAndType.mockReturnValue(1);
        dao.getSkuById.mockReset();
        dao.getSkuById.mockReturnValue(1);
        dao.getItemById.mockReset();
        dao.getItemById.mockReturnValue(new Item(1, 'item1', 1.99, 1, 101));
        //expected 200
        let res = await restockOrderService.createRestockOrder(
            "2021/11/29 09:33",
            [{
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            }],
            1
        );

        expect(dao.storeRestockOrder.mock.calls[0][0].toDatabase()).toEqual(
            new RestockOrder(
                "2021/11/29 09:33",
                [{
                    SKUId: 1,
                    itemId: 1,
                    description: "description",
                    price: 10.99,
                    qty: 2,
                }],
                1
            ).toDatabase()
        );

        expect(dao.storeRestockOrderSku.mock.calls[0][0]).toEqual(1);
        expect(dao.storeRestockOrderSku.mock.calls[0][1]).toEqual([
            {
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            }
        ]);

        expect(res.code).toEqual(201);

        // expected 503
        res = await restockOrderService.createRestockOrder(
            "2021/11/29 09:33",
            [{
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            }],
            1
        );

        expect(dao.storeRestockOrder.mock.calls[0][0].toDatabase()).toEqual(
            new RestockOrder(
                "2021/11/29 09:33",
                [{
                    SKUId: 1,
                    itemId: 1,
                    description: "description",
                    price: 10.99,
                    qty: 2,
                }],
                1
            ).toDatabase()
        );

        expect(dao.storeRestockOrderSku.mock.calls[0][0]).toEqual(1);
        expect(dao.storeRestockOrderSku.mock.calls[0][1]).toEqual([
            {
                SKUId: 1,
                itemId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            }
        ]);

        expect(res.error).toEqual(expect.stringContaining('Service Unavailable'));
        expect(res.code).toEqual(503);
    });

});

describe("update restock order", () => {
    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.updateRestockOrder.mockReset();
        dao.storeRestockOrderSkuItems.mockReset();

        dao.getRestockOrder
            .mockReturnValueOnce(undefined)
            .mockReturnValue(fakeRestockOrder);


        dao.updateRestockOrder.mockReturnValueOnce(1)
            .mockReturnValue(0);

        dao.storeRestockOrderSkuItems.mockReturnValueOnce(1)
            .mockReturnValue(0);

        dao.getSkuById.mockReturnValue(1);
        dao.getSkuItemByRfid.mockReturnValue(1);
    })

    test('update state of restock order', async () => {
        let type = "state"
        let body = { newState: "test" }
        let res = await restockOrderService.updateRestockOrder(type, 1, body);

        expect(res.code).toEqual(404);

        let oldState = fakeRestockOrder.getState();
        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(200);

        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(503);

        fakeRestockOrder.setState(oldState);
    });

    test('update transport note of restock order', async () => {
        let type = "transportNote"
        let body = { transportNote: { deliveryDate: "2021/12/29" } }

        let res = await restockOrderService.updateRestockOrder(type, 1, body);

        expect(res.code).toEqual(404);

        let oldTranportNote = fakeRestockOrder.getTransportNote();
        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(200);

        let oldState = fakeRestockOrder.getState();
        fakeRestockOrder.setState("DELIVERED");
        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(422);

        dao.updateRestockOrder.mockReturnValueOnce(0)
        fakeRestockOrder.setState(oldState);
        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(503);

        fakeRestockOrder.setTransportNote(oldTranportNote);
    });

    test('update skuItems of restock order', async () => {
        let type = "skuItems"
        let body = { skuItems: [{ SKUId: 1, rfid: "123" }] }

        let res = await restockOrderService.updateRestockOrder(type, 1, body);

        expect(res.code).toEqual(404);

        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(422);

        let oldState = fakeRestockOrder.getState();
        fakeRestockOrder.setState("DELIVERED");
        res = await restockOrderService.updateRestockOrder(type, 1, body);

        res = await restockOrderService.updateRestockOrder(type, 1, body);
        expect(res.code).toEqual(503);

        fakeRestockOrder.setState(oldState);
    });




});

describe("delete restock order", () => {
    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.getRestockOrderSkuItems.mockReset();

        dao.getRestockOrder.mockReturnValueOnce(fakeIssuedRestockOrder)
            .mockReturnValueOnce(null).mockReturnValue(fakeRestockOrder);

        dao.getRestockOrderSkuItems.mockReturnValueOnce([])
            .mockReturnValueOnce([{ SKUId: 123, rfid: "123" }])
            .mockReturnValue([]);

        dao.deleteRestockOrder.mockReturnValueOnce(true).mockReturnValue(false);
        dao.deleteRestockOrderSku.mockReturnValue(true);
        dao.deleteRestockOrderSkuItems.mockReturnValue(true);
    })

    test('delete restock order', async () => {
        // expected 200
        const id = 1;
        let res = await restockOrderService.deleteRestockOrder(id);

        expect(res.code).toEqual(204);

        // expected 404
        res = await restockOrderService.deleteRestockOrder(id + 1);
        expect(res.code).toEqual(422);

    });

});

describe('restock model return checkers', () => {
    beforeAll(() => {
        dao.getRestockOrder.mockReset();
        dao.getRestockOrderSkuItems.mockReset();

        dao.getRestockOrder.mockReturnValue(fakeRestockOrder)

        dao.getRestockOrderSkuItems.mockReturnValueOnce([])
            .mockReturnValue([{ SKUId: 123, rfid: "123" }])
    })
    test('get transport note as string', async () => {
        let ro = await dao.getRestockOrder(1);
        expect(ro.getTransportNoteString()).toEqual(`deliveryDate: ${fakeRestockOrder.getTransportNote().deliveryDate}`);
    });
    test('get correct skuItems according to state', async () => {
        let ro = await dao.getRestockOrder(1);
        ro.setState("DELIVERED");
        expect(ro.toJSON().skuItems).toEqual(fakeRestockOrder.getSkuItems());
    })
});