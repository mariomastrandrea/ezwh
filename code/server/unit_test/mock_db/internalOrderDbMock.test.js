const InternalOrderService = require('../../services/internalOrderService');
const dao = require('../mock/mockDbManager');
const InternalOrder = require('../../models/internalOrder');
const Sku = require("../../models/sku");
const SkuItem = require("../../models/skuItem");



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
            1)).mockReturnValue(null);

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
        dao.getUserByIdAndType.mockReset();

        dao.getSkuById
            .mockReturnValue(new Sku(
                "description",
                123,
                123,
                "note",
                123,
                123,
                "12345678",
                [],
                1
            ));
        dao.getUserByIdAndType.mockReturnValue(1);
        dao.storeInternalOrder.mockReturnValue(
            new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ISSUED",
                1,
            )
        );
        dao.storeInternalOrderSku
            .mockReturnValueOnce(1)
            .mockReturnValue(0);

        dao.getInternalOrder
            .mockReturnValue(new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ISSUED",
                1,
            )
            );

        dao.updateInternalOrder
            .mockReturnValueOnce(1)
            .mockReturnValue(0);

        dao.getSkuItemByRfid
            .mockReturnValue(new SkuItem(
                "123456789",
                1,
                "123",
                1,
                []
            ));
        dao.deleteInternalOrder
            .mockReturnValueOnce(0)
            .mockReturnValue(1);
    });

    test('create internal order', async () => {
        issueDate = "2020/01/01 00:00";
        products = [{
            "SKUId": 1,
            "description": "description",
            "price": 10.99,
            "qty": 2,
        }];
        customerId = 1
        let res = await internalOrderService.createInternalOrder(issueDate, products, customerId);
        expect(dao.getSkuById.mock.calls[0][0]).toEqual(1);

        expect(dao.getUserByIdAndType.mock.calls[0][0]).toEqual(1);
        expect(res.code).toBe(201);

        res = await internalOrderService.createInternalOrder(issueDate, products, customerId);
        expect(res.code).toBe(503);
    });

    test('update state of internal order', async () => {
        let id = 1;
        let body = { newState: "ACCEPTED" };
        let res = await internalOrderService.updateInternalOrder(id, body);
        expect(dao.updateInternalOrder.mock.calls[0][0].toJSON()).toEqual(new InternalOrder(
            "2020/01/01 00:00",
            [],
            1,
            "ACCEPTED",
            1,
        ).toJSON());

        expect(res.code).toBe(200);

        res = await internalOrderService.updateInternalOrder(id, body);
        expect(res.code).toBe(503);
    })

    test('update state and sku items of internal order', async () => {
        let id = 1;
        let body = {
            newState: "COMPLETED",
            products: [{
                SkuID: 1,
                RFID: "123456789"
            }]
        };
        let res = await internalOrderService.updateInternalOrder(id, body);

        expect(res.code).toBe(200);

        res = await internalOrderService.updateInternalOrder(id, body);

        expect(res.code).toBe(503);
    });

    test('delete internal order', async () => {
        let res = await internalOrderService.deleteInternalOrder(1);
        expect(res.code).toBe(503);

        res = await internalOrderService.deleteInternalOrder(1);
        expect(res.code).toBe(204);

        dao.getInternalOrder.mockReturnValue(undefined);
        res = await internalOrderService.deleteInternalOrder(1);
        expect(res.code).toBe(404);

    });
});

describe('forcing L111, L122-123 of internal order', () => {
    beforeEach(() => {
        dao.getInternalOrder.mockReset();
        dao.getInternalOrderSkuItems.mockReset();
        dao.getSkuById.mockReset();
        dao.getSkuItemByRfid.mockReset();

        dao.getInternalOrder
            .mockReturnValueOnce(0)
            .mockReturnValue(new InternalOrder(
                "2020/01/01 00:00",
                [],
                1,
                "ISSUED",
                1
            ));
        dao.getSkuItemByRfid.mockReturnValue(0);
    });
    test('force 111', async () => {
        let res = await internalOrderService.updateInternalOrder(1, 1);
        expect(res.code).toBe(404);
    })

    test('force 122-123', async () => {
        let res = await internalOrderService.updateInternalOrder(1, 2);
        expect(res.code).toBe(404);

        let body = {
            newState: "COMPLETED",
            products: [{
                SkuID: 1,
                RFID: "123456789"
            }]
        }
        res = await internalOrderService.updateInternalOrder(1, body);
        expect(res.code).toBe(422);
    })
})