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
        for(const io of res.obj){
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });

    test('get internal order', async () => {
        let res = await internalOrderService.getInternalOrderById(1);
        // expect 200 + sku items
        expect (res.obj.toJSON()).toEqual(new InternalOrder(
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
            expect (res.obj.toJSON()).toEqual(new InternalOrder(
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
        for(const io of res.obj){
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });

    test('get accepted internal orders', async () => {
        let res = await internalOrderService.getAcceptedInternalOrders();

        // expect 200
        for(const io of res.obj){
            expect(io).toBeInstanceOf(InternalOrder);
        }
        expect(res.code).toBe(200);
    });


})
