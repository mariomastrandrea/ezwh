const InternalOrderService = require('../../services/internalOrderService');
const dao = require('../../db/mock/mockOrders');
const InternalOrder = require('../../models/internalOrder');

const internalOrderService = new InternalOrderService(dao);
const fakeInternalOrder = new InternalOrder(
    "2020/01/01 00:00",
    [{
        SKUId: 2,
        RFID: "123456779",
    }],
    1,
    "ISSUED",
    1
);
const fakeAcceptedInternalOrder = new InternalOrder(
    "2020/01/01 00:00",
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
    "ACCEPTED",
    1
);
const fakeCompletedInternalOrder = new InternalOrder(
    "2020/01/01 00:00",
    [
        {
            SKUId: 1,
            RFID: "123456789",
        },
        {
            SKUId: 2,
            RFID: "123456779",
        },
    ],
    1,
    "COMPLETED",
);

describe('get internal orders', () => {
    beforeAll(() => {
        dao.getInternalOrdersInState.mockReset();
    })
    beforeEach(() => {
        dao.getAllInternalOrders.mockReset();
        dao.getInternalOrder.mockReset();
        dao.getInternalOrderSku.mockReset();
        dao.getInternalOrderSkuItems.mockReset();

        dao.getAllInternalOrders.mockReturnValueOnce([]).mockReturnValue([
            new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ISSUED",
                1
            ),
            new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ACCEPTED",
                2
            )
        ]);

        dao.getInternalOrder.mockReturnValueOnce(new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "COMPLETED",
            1
        )).mockReturnValueOnce(new InternalOrder("2020/01/01 00:00",
            [],
            1,
            "ISSUED",
            1)).mockReturnValue(undefined);

        dao.getInternalOrdersInState.mockReturnValueOnce([new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "ISSUED",
            1
        )]).mockReturnValue([new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "ACCEPTED",
            2)]);

        dao.getInternalOrderSku.mockReturnValueOnce([
            {
                SKUId: 1,
                description: "row.description",
                price: 20,
                qty: 1,
            }
        ]).mockReturnValue([
            {
                SKUId: 2,
                description: "row.description 2",
                price: 20,
                qty: 1,
            }
        ]);

        dao.getInternalOrderSkuItems.mockReturnValueOnce([{
            SKUId: 1,
            RFID: "123456789",
        }]).mockReturnValue([{
            SKUId: 2,
            RFID: "123456779",
        }]);

    });

    test('get all internal orders', async () => {
        let res = await internalOrderService.getAllInternalOrders();

        // expect 200 but empty
        expect(res.obj).toEqual([]);
        expect(res.code).toBe(200);

        // expect 200 and data
        res = await internalOrderService.getAllInternalOrders();
        for (const io of res.obj) {
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });

    test('get internal order', async () => {
        let res = await internalOrderService.getInternalOrderById(1);
        // expect 200 + sku items
        expect(res.obj.toJSON()).toEqual(new InternalOrder(
            "2020/01/01 00:00",
            [{
                SKUId: 1,
                description: "row.description",
                price: 20,
                RFID: "123456789",
            }],
            1,
            "COMPLETED",
            1
        ).toJSON());
        expect(res.code).toBe(200);

        // expect 200 + sku
        res = await internalOrderService.getInternalOrderById(1);
        expect(res.obj.toJSON()).toEqual(new InternalOrder(
            "2020/01/01 00:00",
            [
                {
                    SKUId: 2,
                    description: "row.description 2",
                    price: 20,
                    qty: 1,
                }
            ],
            1,
            "ISSUED",
            1,
        ).toJSON());
        expect(res.code).toBe(200);

        // expect 404
        res = await internalOrderService.getInternalOrderById(2);
        expect(res.code).toBe(404);
    });

    test('get issued internal orders', async () => {
        let res = await internalOrderService.getIssuedInternalOrders();

        // expect 200
        for (const io of res.obj) {
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });

    test('get accepted internal orders', async () => {
        let res = await internalOrderService.getAcceptedInternalOrders();

        // expect 200
        for (const io of res.obj) {
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });


});

describe('create edit delete internal orders', () => {
    beforeEach(() => {
        dao.storeInternalOrder.mockReset();
        dao.storeInternalOrderSku.mockReset();
        dao.storeInternalOrderSkuItems.mockReset();
        dao.getInternalOrder.mockReset();
        dao.getInternalOrderSkuItems.mockReset();
        dao.updateInternalOrder.mockReset();
        dao.deleteInternalOrder.mockReset();
        dao.deleteInternalOrderSku.mockReset();

        dao.storeInternalOrder.mockReturnValue(new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "ISSUED",
            1
        ));

        dao.storeInternalOrderSku.mockReturnValueOnce(1).mockReturnValue(0);

        dao.getInternalOrder.mockReturnValueOnce(undefined)
            .mockReturnValueOnce(new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ISSUED",
                1
            )).mockReturnValue(new InternalOrder(new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ACCEPTED",
                1
            )));

        dao.updateInternalOrder.mockReturnValueOnce(1).mockReturnValue(0);
        dao.storeInternalOrderSkuItems.mockReturnValueOnce(1).mockReturnValue(0);
        dao.getInternalOrderSkuItems.mockReturnValueOnce([]).mockReturnValue(["abc"]);
        dao.deleteInternalOrder.mockReturnValue(1);
        dao.deleteInternalOrderSku.mockReturnValue(1);
    });

    test('create internal order', async () => {
        let res = await internalOrderService.createInternalOrder(
            "2020/01/01 00:00",
            [{
                SKUId: 2,
                RFID: "123456779",
            }],
            1
        );

        // expect 201
        expect(dao.storeInternalOrder.mock.calls[0][0].toJSON()).toEqual(
            new InternalOrder(
                "2020/01/01 00:00",
                [{
                    SKUId: 2,
                    RFID: "123456779",
                }],
                1,
                "ISSUED",
                null
            ).toJSON()
        );
        expect(res.code).toBe(201);

        // expect 503
        res = await internalOrderService.createInternalOrder(new InternalOrder(
            "2020/01/01 00:00",
            [{
                SKUId: 2,
                RFID: "123456779",
            }],
            1
        ));
        expect(res.code).toBe(503);

    });

    test('update state internal order', async () => {
        let body = { newState: "ACCEPTED" };
        let res = await internalOrderService.updateInternalOrder(1, body);

        // expect 404
        expect(res.code).toBe(404);

        // expect 200
        res = await internalOrderService.updateInternalOrder(1, body);
        expect(dao.updateInternalOrder.mock.calls[0][0].toJSON()).toEqual(new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "ACCEPTED",
            1
        ).toJSON());
        expect(res.code).toBe(200);

        // expect 503
        body = {};
        res = await internalOrderService.updateInternalOrder(1, body);
        expect(res.code).toBe(503);
    });

    test('update state and sku items internal order', async () => {
        let body = { newState: "COMPLETED", skuItems: [
            {
                SKUId: 1,
                RFID: "123456789",
            },
            {
                SKUId: 2,
                RFID: "123456779",
            },
        ], };
        let res = await internalOrderService.updateInternalOrder(1, body);

        // expect 404
        expect(res.code).toBe(404);

        // expect 200
        res = await internalOrderService.updateInternalOrder(1, body);
        expect(dao.updateInternalOrder.mock.calls[0][0].toJSON()).toEqual(new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "COMPLETED",
            1
        ).toJSON());
        expect(res.code).toBe(200);

        // expect 503
        body = {};
        res = await internalOrderService.updateInternalOrder(1, body);
        expect(res.code).toBe(503);
    });

    test('delete internal order', async() => {
        let res = await internalOrderService.deleteInternalOrder(1);

        // expect 404
        expect(res.code).toBe(404);

        // expect 204
        res = await internalOrderService.deleteInternalOrder(1);
        expect(dao.deleteInternalOrder.mock.calls[0][0]).toBe(1);
        expect(res.code).toBe(204);

        // expect 503
        res = await internalOrderService.deleteInternalOrder(1);
        expect(res.code).toBe(503);
    });
});
