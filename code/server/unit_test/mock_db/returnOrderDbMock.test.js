const ReturnOrderService = require('../../services/returnOrderService');
const dao = require('../mock/mockDbManager');
const RestockOrder = require('../../models/restockOrder');
const ReturnOrder = require('../../models/returnOrder');

const returnOrderService = new ReturnOrderService(dao);

const fakeReturn = new ReturnOrder(
    "2020/01/01 00:00",
    [
        {
            SKUId: 1,
            description: "Product 1",
            price: 1.00,
            RFID: "123456789",
        },
        {
            SKUId: 2,
            description: "Product 2",
            price: 2.00,
            RFID: "123456779",
        }
    ],
    1,
    1,
)

const fakeRestockOrder = new RestockOrder(
    "2021/11/29 09:33",
    [
        {
            SKUId: 1,
            description: "description",
            price: 10.99,
            quantity: 2,
        },
        {
            SKUId: 2,
            description: "description 2",
            price: 10.99,
            quantity: 2,
        },
    ],
    1,
    "delivered on 2021/12/05",
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
    "DELIVERED"
);

describe('get return orders', () => {
    beforeEach(() => {
        dao.getAllReturnOrders.mockReset();
        dao.getReturnOrder.mockReset();
        dao.getReturnOrderSkuItems.mockReset();

        dao.getAllReturnOrders.mockReturnValueOnce([
            fakeReturn,
            new ReturnOrder(
                "2020/01/01 00:00",
                [
                    {
                        SKUId: 1,
                        description: "Product 1",
                        price: 1.00,
                        RFID: "123456789",
                    },
                    {
                        SKUId: 2,
                        description: "Product 2",
                        price: 2.00,
                        RFID: "123456779",
                    }
                ],
                2,
                2,
            ),

        ]).mockReturnValue([]);

        dao.getReturnOrder.mockReturnValueOnce(fakeReturn).mockReturnValue();

        dao.getReturnOrderSkuItems.mockReturnValueOnce([
            {
                SKUId: 1,
                description: "Product 1",
                price: 1.00,
                RFID: "123456789",
            },
            {
                SKUId: 2,
                description: "Product 2",
                price: 2.00,
                RFID: "123456779",
            }
        ]).mockReturnValue([]);
    });

    test('get all return orders', async () => {
        // expect 200
        let res = await returnOrderService.getAllReturnOrders();
        for (let ro of res.obj) {
            expect(ro).toBeInstanceOf(ReturnOrder);
        }
        expect(res.code).toEqual(200);

        // expect 200 but empty
        res = await returnOrderService.getAllReturnOrders();
        expect(res.obj).toEqual([]);
        expect(res.code).toEqual(200);
    });

    test('get return order by id', async () => {
        // expect 200
        const id = 1;
        let res = await returnOrderService.getReturnOrderById(id);
        expect(res.obj.toJSON()).toEqual(fakeReturn.toJSON());
        expect(res.code).toEqual(200);

        // expect 404
        res = await returnOrderService.getReturnOrderById(id + 1);
        expect(res.error).toEqual(expect.stringContaining('Not Found'));
        expect(res.code).toEqual(404);
    })
});

describe('create return order', () => {
    beforeEach(() => {
        dao.storeReturnOrder.mockReset();
        dao.storeReturnOrderSkuItems.mockReset();
        dao.getRestockOrder.mockReset();

        dao.getRestockOrder.mockReturnValueOnce(fakeRestockOrder)
            .mockReturnValueOnce().mockReturnValue(fakeRestockOrder);

        dao.storeReturnOrder.mockReturnValueOnce(fakeReturn)
            .mockReturnValueOnce().mockReturnValue(fakeReturn);

        dao.storeReturnOrderSkuItems
            .mockReturnValueOnce(1).mockReturnValue(0);
    });

    test('add return order', async () => {
        // expect 200
        let res = await returnOrderService.createReturnOrder(
            "2021/11/30 09:33",
            [
                {
                    SKUId: 1,
                    description: "Product 1",
                    price: 1.00,
                    RFID: "123456789",
                },
                {
                    SKUId: 2,
                    description: "Product 2",
                    price: 2.00,
                    RFID: "123456779",
                }
            ],
            1
        );
        expect(dao.storeReturnOrder.mock.calls[0][0].toJSON()).toEqual(new ReturnOrder(
            "2021/11/30 09:33",
            [
                {
                    SKUId: 1,
                    description: "Product 1",
                    price: 1.00,
                    RFID: "123456789",
                },
                {
                    SKUId: 2,
                    description: "Product 2",
                    price: 2.00,
                    RFID: "123456779",
                }
            ],
            1
        ).toJSON());
        expect(dao.storeReturnOrderSkuItems.mock.calls[0][0]).toEqual(1);
        expect(dao.storeReturnOrderSkuItems.mock.calls[0][1]).toEqual([
            {
                SKUId: 1,
                description: "Product 1",
                price: 1.00,
                RFID: "123456789",
            },
            {
                SKUId: 2,
                description: "Product 2",
                price: 2.00,
                RFID: "123456779",
            }
        ]);

        expect(res.code).toEqual(201);

        // expect 404
        res = await returnOrderService.createReturnOrder(
            '2020/01/01 00:00',
            [
                {
                    SKUId: 1,
                    description: "Product 1",
                    price: 1.00,
                    RFID: "123456789",
                },
                {
                    SKUId: 2,
                    description: "Product 2",
                    price: 2.00,
                    RFID: "123456779",
                }
            ],
            453
        );

        expect(res.error).toEqual(expect.stringContaining('Not Found'));
        expect(res.code).toEqual(404);

        // expect 503
        res = await returnOrderService.createReturnOrder(
            '2020/01/01 00:00',
            [
                {
                    SKUId: 1,
                    description: "Product 1",
                    price: 1.00,
                    RFID: "123456789",
                },
                {
                    SKUId: 2,
                    description: "Product 2",
                    price: 2.00,
                    RFID: "123456779",
                }
            ],
            1
        );

        expect(res.error).toEqual(expect.stringContaining('Unprocessable Entity'));
        expect(res.code).toEqual(422);
    });
});

describe('delete return order', () => {
    beforeEach(() => {
        dao.deleteReturnOrder.mockReset();
        dao.getReturnOrder.mockReset();

        dao.getReturnOrder.mockReturnValueOnce(fakeReturn)
        .mockReturnValueOnce().mockReturnValue(fakeReturn);

        dao.deleteReturnOrder.mockReturnValueOnce(1).mockReturnValue(0);
    });

    test('delete return order', async () => {
        // expect 200
        const id = 1;
        let res = await returnOrderService.deleteReturnOrder(1);
        expect(res.code).toEqual(204);

        // expect 404
        res = await returnOrderService.deleteReturnOrder(id + 1);
        expect(res.error).toEqual(expect.stringContaining('Not Found'));
        expect(res.code).toEqual(404);

        // expect 503
        res = await returnOrderService.deleteReturnOrder(id);
        expect(res.error).toEqual(expect.stringContaining('Service Unavailable'));
        expect(res.code).toEqual(503);
    });
});