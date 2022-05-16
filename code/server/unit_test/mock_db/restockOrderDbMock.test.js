const RestockOrderService = require('../../services/restockOrderService');
const dao = require('../../db/mock/mockOrders');
const RestockOrder = require('../../models/restockOrder');

const restockOrderService = new RestockOrderService(dao);
const fakeRestockOrder = new RestockOrder(
    "2021/11/29 09:33",
    [
        {
            SKUId: 1,
            description: "description",
            price: 10.99,
            qty: 2,
        },
        {
            SKUId: 2,
            description: "description 2",
            price: 10.99,
            qty: 2,
        },
    ],
    1,
    {deliveryDate: "2021/11/30"},
    1,
    [
        {
            SKUId: 1,
            RFID: "123456789",
        },
        {
            SKUId: 1,
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
            description: "description",
            price: 10.99,
            qty: 2,
        },
        {
            SKUId: 2,
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
                {deliveryDate: "2021/11/30"},
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
                description: "description",
                price: 10.99,
                qty: 2,
            },
            {
                SKUId: 2,
                description: "description 2",
                price: 10.99,
                qty: 2,
            },
        ]).mockReturnValue([
            {
                SKUId: 1,
                description: "description",
                price: 10.99,
                qty: 2,
            },
            {
                SKUId: 2,
                description: "description 2",
                price: 10.99,
                qty: 2,
            },
        ]);

        dao.getRestockOrderSkuItems.mockReset();
        dao.getRestockOrderSkuItems.mockReturnValueOnce([
            {
                SKUId: 1,
                RFID: "123456789",
            },
            {
                SKUId: 1,
                RFID: "123456709",
            }
        ]).mockReturnValue([
            {
                SKUId: 2,
                RFID: "133456789",
            },
            {
                SKUId: 2,
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
                    RFID: "123456789",
                },
                {
                    SKUId: 1,
                    RFID: "123456709",
                }
            ]
        );
    });

    test('get restock Order By Id', async () => {
        const id = 1;
        let res = await restockOrderService.getRestockOrderById(id);
        // expected 200
        expect(res.obj.toDatabase()).toEqual(fakeRestockOrder.toDatabase());
        expect(res.obj.toJSON()).toEqual(fakeRestockOrder.toJSON());
        expect(res.code).toEqual(200);

        res = await restockOrderService.getRestockOrderById(id + 1);
        expect(res.obj.getState()).toEqual("COMPLETEDRETURN");
        expect(res.code).toEqual(200);
        // expected 404
        const notId = 2938329;
        res = await restockOrderService.getRestockOrderById(notId);
        expect(res.error).toEqual('Not Found');
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
        expect(res.error).toEqual('Unprocessable Entity');
        expect(res.code).toEqual(422);

        // expected 200
        res = await restockOrderService.getReturnItemsByRestockOrderId(id + 1);
        expect(res.obj).toEqual([
            {
                SKUId: 1,
                RFID: "123456789",
            },
            {
                SKUId: 1,
                RFID: "123456709",
            }
        ]);
        expect(res.code).toEqual(200);

        // expect 404 because no restock order with id
        res = await restockOrderService.getReturnItemsByRestockOrderId(id + 2);
        expect(res.error).toEqual('Not Found');
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

        //expected 200
        let res = await restockOrderService.createRestockOrder(
            "2021/11/29 09:33",
            [{
                SKUId: 1,
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
                description: "description",
                price: 10.99,
                qty: 2,
            }
        ]);

        expect(res.error).toEqual('Service Unavailable');
        expect(res.code).toEqual(503);
    });

});

describe("update restock order", () => {
    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.updateRestockOrder.mockReset();
        dao.storeRestockOrderSkuItems.mockReset();

        dao.getRestockOrder.mockReturnValueOnce(
            fakeRestockOrder
        ).mockReturnValueOnce().mockReturnValue(
            fakeRestockOrder
        );


        dao.updateRestockOrder.mockReturnValueOnce(1)
            .mockReturnValue(0);

        dao.storeRestockOrderSkuItems.mockReturnValueOnce(1)
            .mockReturnValue(0);
    })

    test('update state of restock order', async () => {
        // expected 200
        const id = 1;
        const body = { newState: "DELIVERED" };
        let res = await restockOrderService.updateRestockOrder(
            "state", id, body
        );

        expect(dao.updateRestockOrder.mock.calls[0][0].toDatabase())
            .toEqual(fakeRestockOrder.toDatabase());

        expect(res.code).toEqual(200);

        // expected 404
        res = await restockOrderService.updateRestockOrder(
            "state", id + 1, body
        );
        expect(res.code).toEqual(404);

        // expected 503
        res = await restockOrderService.updateRestockOrder(
            "state", id, body
        );

        expect(res.code).toEqual(503);
    });

    test('update transport note of restock order', async () => {
        // expected 200
        const id = 1;
        const body = { transportNote: { "deliveryDate": "2021/12/29" } };
        fakeRestockOrder.setState("DELIVERY");
        let res = await restockOrderService.updateRestockOrder(
            "transportNote", id, body
        );
        expect(dao.updateRestockOrder.mock.calls[0][0].toDatabase())
            .toEqual(fakeRestockOrder.toDatabase());

        expect(res.code).toEqual(200);

        // expected 404
        res = await restockOrderService.updateRestockOrder(
            "transportNote", id + 1, body
        );
        expect(res.code).toEqual(404);

        // expected 503
        res = await restockOrderService.updateRestockOrder(
            "transportNote", id, body
        );
        expect(res.code).toEqual(503);
    });

    test('update sku items of restock order', async () => {
        // expected 200
        const id = 1;
        const body = { skuItems: [{ SKUId: 12, rfid: "1234" }] };
        fakeRestockOrder.setState("DELIVERED");
        let res = await restockOrderService.updateRestockOrder(
            "skuItems", id + 2, body
        );
        expect(dao.storeRestockOrderSkuItems.mock.calls[0][0])
            .toEqual(id);
        expect(dao.storeRestockOrderSkuItems.mock.calls[0][1])
            .toEqual(body.skuItems);

        expect(res.code).toEqual(200);

        // expected 404
        res = await restockOrderService.updateRestockOrder(
            "skuItems", id + 2, body
        );
        expect(res.code).toEqual(404);

        // expected 503
        res = await restockOrderService.updateRestockOrder(
            "skuItems", id + 2, body
        );
        expect(res.code).toEqual(503);
    });

});

describe("delete restock order", () => {
    beforeEach(() => {
        dao.getRestockOrder.mockReset();
        dao.getRestockOrderSkuItems.mockReset();

        dao.getRestockOrder.mockReturnValueOnce(fakeIssuedRestockOrder)
            .mockReturnValueOnce().mockReturnValue(fakeRestockOrder);

        dao.getRestockOrderSkuItems.mockReturnValueOnce([])
            .mockReturnValueOnce([{ SKUId: 123, rfid: "123" }])
            .mockReturnValue([]);

        dao.deleteRestockOrder.mockReturnValueOnce(1).mockReturnValue(0);

        dao.deleteRestockOrderSku.mockReturnValue(1);
    })

    test('delete restock order', async () => {
        // expected 200
        const id = 1;
        let res = await restockOrderService.deleteRestockOrder(id);

        expect(res.code).toEqual(204);

        // expected 404
        res = await restockOrderService.deleteRestockOrder(id + 1);
        expect(res.code).toEqual(404);

        // expected 503
        res = await restockOrderService.deleteRestockOrder(id + 2);
        expect(res.code).toEqual(503);

        // expected 503
        res = await restockOrderService.deleteRestockOrder(id + 3);
        expect(res.code).toEqual(503);
    });
});