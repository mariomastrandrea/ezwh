const SkuService = require('../../services/skuService');
const dao = require('../mock/mockDbManager');
const Sku = require('../../models/Sku');
const Position = require('../../models/position');

const skuService = new SkuService(dao);

describe('get all sku', () => {

    beforeEach(() => {
        dao.getAllSkus.mockReset()
            .mockReturnValueOnce([]) //200 empty
            .mockReturnValueOnce(
                [new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1),
                new Sku('another sku', 100, 50, 'second sku', 19.99, 2, '800234523418', [], 2),
                new Sku('other sku', 100, 50, 'third sku', 29.99, 2, '800234523419', [], 3)
                ]); //200 data

        dao.getTestDescriptorsOf.mockReset()
            .mockReturnValueOnce([1, 2, 3]) //200
            .mockReturnValueOnce([11, 12, 13])
            .mockReturnValueOnce([21, 22, 23]);
    });

    test('get all sku', async () => {
        let res = await skuService.getAllSkus();

        // expect 200 but empty
        expect(res.code).toBe(200);
        expect(res.obj).toEqual([]);

        // expect 200 and data
        res = await skuService.getAllSkus();
        expect(res.code).toBe(200);
        for (const s of res.obj) {
            expect(s).toBeInstanceOf(Sku);
        }
    });
})

describe('get sku by id', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //200
            .mockReturnValueOnce(null); //404

        dao.getTestDescriptorsOf.mockReset()
            .mockReturnValueOnce([1, 2, 3]) //200
            .mockReturnValueOnce(null); //404
    });

    test('get sku by id', async () => {
        let res = await skuService.getSkuById(1);

        // expect 200
        expect(res.code).toBe(200);
        expect(res.obj.toJSON()).toEqual(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [1, 2, 3], 1).toJSON());

        // expect 404
        res = await skuService.getSkuById(1);
        expect(res.code).toBe(404);
    });
})

describe('create sku', () => {

    beforeEach(() => {
        dao.storeSku.mockReset()
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, "", [], 1)) //201
            .mockReturnValueOnce(null); //503
    });

    test('create sku', async () => {
        let res = await skuService.createSku('a sku', 100, 50, 'first sku', 9.99, 2);

        //expect 201
        expect(res.code).toBe(201);
        expect(dao.storeSku.mock.calls[0][0].toJSON()).toEqual(
            new Sku('a sku', 100, 50, 'first sku', 9.99, 2, "", [], null).toJSON()
        );

        //expect 503
        res = await skuService.createSku(null);
        expect(res.code).toBe(503);
    });
})

describe('update sku', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //422
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //503
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //200

        dao.getPosition.mockReset()
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 100, 200, 100, 200)) //422
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 1000, 2000, 0, 0)) //503
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 1000, 2000, 0, 0)) //200

        dao.updatePosition.mockReset()
            .mockReturnValueOnce(true) //503
            .mockReturnValueOnce(true) //200

        dao.updateSku.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true) //200
    });

    test('update sku', async () => {
        let res = await skuService.updateSku(1, 'new desc', 20, 50, 'new note', 19.99, 5);

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await skuService.updateSku(1, 'new desc', 20, 50, 'new note', 19.99, 5);
        expect(res.code).toBe(422);

        //expect 503
        res = await skuService.updateSku(1, 'new desc', 20, 50, 'new note', 19.99, 5);
        expect(res.code).toBe(503);

        //expect 200
        res = await skuService.updateSku(1, 'new desc', 20, 50, 'new note', 19.99, 5);
        expect(res.code).toBe(200);
        expect(dao.updateSku.mock.calls[0][0].toJSON()).toEqual(
            new Sku('new desc', 20, 50, 'new note', 19.99, 5, '800234523417', [], 1).toJSON()
        );
    })
})

describe('update sku position', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404 no sku
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //404 no pos
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //422 occupied
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //422 cant hold
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //503
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //200

        dao.getPosition.mockReset()
            .mockReturnValueOnce(null) //404 no pos
            .mockReturnValueOnce(new Position('800234523418', '8002', '3452', '3418', 100, 200, 100, 200)) //422 occupied
            .mockReturnValueOnce(new Position('800234523418', '8002', '3452', '3418', 100, 200, 100, 200)) //422 cant hold
            .mockReturnValueOnce(new Position('800234523418', '8002', '3452', '3418', 1000, 2000, 0, 0)) //503
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 200, 200, 150, 150))
            .mockReturnValueOnce(new Position('800234523418', '8002', '3452', '3418', 1000, 2000, 0, 0)) //200
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 200, 200, 150, 150))

        dao.getSkuOfPosition.mockReset()
            .mockReturnValueOnce(new Sku('a sku', 100, 50, 'sku in position', 9.99, 2, '800234523418', [], 8)) //422 occupied
            .mockReturnValueOnce(null) //422 cant hold

        dao.updateSku.mockReset()
            .mockReturnValueOnce(true) //503
            .mockReturnValueOnce(true) //200

        dao.updatePosition.mockReset()
            .mockReturnValueOnce(true) //503
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true) //200 
            .mockReturnValueOnce(true)
    });

    test('update sku position', async () => {
        let res = await skuService.updateSkuPosition(1, '800234523418');

        //expect 404 no sku
        expect(res.code).toBe(404);
        expect(res.error).toContain('Sku');

        //expect 404 no pos
        res = await skuService.updateSkuPosition(1, '800234523418');
        expect(res.code).toBe(404);
        expect(res.error).toContain('Position');

        //expect 422
        res = await skuService.updateSkuPosition(1, '800234523418');
        expect(res.code).toBe(422);
        expect(res.error).toContain('is already occupied');

        //expect 422
        res = await skuService.updateSkuPosition(1, '800234523418');
        expect(res.code).toBe(422);
        expect(res.error).toContain('Exceeding capacities');

        //expect 503
        res = await skuService.updateSkuPosition(1, '800234523418');
        expect(res.code).toBe(503);

        //expect 200
        res = await skuService.updateSkuPosition(1, '800234523418');
        expect(res.code).toBe(200);
        expect(dao.updatePosition.mock.calls[1][0]).toEqual('800234523418');
        expect(dao.updatePosition.mock.calls[1][1].toJSON()).toEqual(
            new Position('800234523418', '8002', '3452', '3418', 1000, 2000, 2 * 100, 2 * 50).toJSON()
        );
    })
})

describe('delete sku', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Sku('a sku', 50, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //503
            .mockReturnValueOnce(new Sku('a sku', 50, 50, 'first sku', 9.99, 2, '800234523417', [], 1)); //204

        dao.deleteSku.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //204

        dao.getPosition.mockReset()
            .mockReturnValueOnce(new Position('800234523417', '8002', '3452', '3417', 200, 200, 100, 100)); //204

        dao.updatePosition.mockReset()
            .mockReturnValueOnce(true); //204
    });

    test('delete sku', async () => {
        let res = await skuService.deleteSku(1);

        //expect 422
        expect(res.code).toBe(422);

        //expect 503
        res = await skuService.deleteSku(1);
        expect(res.code).toBe(503);

        //expect 204
        res = await skuService.deleteSku(1);
        expect(res.code).toBe(204);
    });
})