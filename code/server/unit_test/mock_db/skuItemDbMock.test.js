const SkuItemService = require('../../services/skuItemService');
const dao = require('../mock/mockDbManager');
const Sku = require('../../models/Sku');
const SkuItem = require('../../models/SkuItem');

const skuItemService = new SkuItemService(dao);

describe('get all sku items', () => {

    beforeEach(() => {
        dao.getAllSkuItems.mockReset()
            .mockReturnValueOnce([]) //200 empty
            .mockReturnValueOnce(
                [new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1),
                new SkuItem('12345678901234567890123456789012', 2, '2021/11/29', 1),
                new SkuItem('12345678901234567890123456789013', 3, '2021/11/29', 1)
                ]); //200 data
    });

    test('get all sku items', async () => {
        let res = await skuItemService.getAllSkuItems();

        // expect 200 but empty
        expect(res.code).toBe(200);
        expect(res.obj).toEqual([]);

        // expect 200 and data
        res = await skuItemService.getAllSkuItems();
        expect(res.code).toBe(200);
        for (const s of res.obj) {
            expect(s).toBeInstanceOf(SkuItem);
        }
    });
})

describe('get sku items of skuId', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //200

        dao.getAvailableSkuItemsOf.mockReset()
            .mockReturnValueOnce(
                [new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1),
                new SkuItem('12345678901234567890123456789012', 1, '2021/11/29', 1),
                new SkuItem('12345678901234567890123456789013', 1, '2021/11/29', 1)]) //200
    });

    test('get sku items of skuId', async () => {
        let res = await skuItemService.getAvailableSkuItemsOf(1);

        // expect 404
        expect(res.code).toBe(404);

        // expect 200
        res = await skuItemService.getAvailableSkuItemsOf(1);
        expect(res.code).toBe(200);
        for (const s of res.obj) {
            expect(s.SKUId).toEqual(1);
        }
    });
})

describe('get skuItem', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //200
            .mockReturnValueOnce(null); //404
    });

    test('get skuItem', async () => {
        let res = await skuItemService.getSkuItem('12345678901234567890123456789011');

        // expect 200
        expect(res.code).toBe(200);
        expect(res.obj.toJSON()).toEqual(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1).toJSON());

        // expect 404
        res = await skuItemService.getSkuItem('12345678901234567890123456789011');
        expect(res.code).toBe(404);
    });
})

describe('create skuItem', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //422
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //503
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //201

        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //422
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(null) //201

        dao.storeSkuItem.mockReset()
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2022/02/02', 0)); //201
    });

    test('create skuItem', async () => {
        let res = await skuItemService.createSkuItem('12345678901234567890123456789011', 1, '2022/02/02');

        //expect 404        
        expect(res.code).toBe(404);

        //expect 422
        res = await skuItemService.createSkuItem('12345678901234567890123456789011', 1, '2022/02/02');
        expect(res.code).toBe(422);

        //expect 503
        res = await skuItemService.createSkuItem('12345678901234567890123456789011', 1, '2022/02/02');
        expect(res.code).toBe(503);

        //expect 201
        res = await skuItemService.createSkuItem('12345678901234567890123456789011', 1, '2022/02/02');
        expect(res.code).toBe(201);
        expect(dao.storeSkuItem.mock.calls[0][0].toJSON()).toEqual(
            new SkuItem('12345678901234567890123456789011', 1, '2022/02/02', 0).toJSON()
        );
    });
})

describe('update skuItem', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //422
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789012', 1, '2021/11/29', 1))
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //503
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //200
            .mockReturnValueOnce(null);

        dao.updateSkuItem.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true) //200
    });

    test('update skuItem', async () => {
        let res = await skuItemService.updateSkuItem('12345678901234567890123456789011', '12345678901234567890123456789012', 1, '2022/11/29');

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await skuItemService.updateSkuItem('12345678901234567890123456789011', '12345678901234567890123456789012', 1, '2022/11/29');
        expect(res.code).toBe(422);

        //expect 503
        res = await skuItemService.updateSkuItem('12345678901234567890123456789011', '12345678901234567890123456789012', 1, '2022/11/29');
        expect(res.code).toBe(503);

        //expect 200
        res = await skuItemService.updateSkuItem('12345678901234567890123456789011', '12345678901234567890123456789012', 1, '2022/11/29');
        expect(res.code).toBe(200);
        expect(dao.updateSkuItem.mock.calls[0][0]).toEqual('12345678901234567890123456789011');
        expect(dao.updateSkuItem.mock.calls[0][1].toJSON()).toEqual(
            new SkuItem('12345678901234567890123456789012', 1, '2022/11/29', 1).toJSON()
        );
    })
})

describe('delete skuItem', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(null) //422
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)) //503
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789011', 1, '2021/11/29', 1)); //204

        dao.deleteSkuItem.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //204
    });

    test('delete skuItem', async () => {
        let res = await skuItemService.deleteSkuItem('12345678901234567890123456789011');

        //expect 422
        expect(res.code).toBe(422);

        //expect 503
        res = await skuItemService.deleteSkuItem('12345678901234567890123456789011');
        expect(res.code).toBe(503);

        //expect 204
        res = await skuItemService.deleteSkuItem('12345678901234567890123456789011');
        expect(res.code).toBe(204);
    });
})