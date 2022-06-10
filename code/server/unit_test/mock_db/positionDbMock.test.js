const PositionService = require('../../services/positionsService');
const dao = require('../mock/mockDbManager');
const Position = require('../../models/position');

const positionService = new PositionService(dao);

describe('get all positions', () => {

    beforeEach(() => {
        dao.getAllPositions.mockReset()
            .mockReturnValueOnce([]) //200 empty
            .mockReturnValueOnce(
                [new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0),
                new Position('800234523416', '8002', '3452', '3416', 200, 100, 100, 50),
                new Position('800234523417', '8002', '3452', '3417', 200, 200, 50, 50)
                ]); //200 data
    });

    test('get all positions', async () => {
        let res = await positionService.getAllPositions();

        // expect 200 but empty
        expect(res.code).toBe(200);
        expect(res.obj).toEqual([]);

        // expect 200 and data
        res = await positionService.getAllPositions();
        expect(res.code).toBe(200);
        for (const s of res.obj) {
            expect(s).toBeInstanceOf(Position);
        }
    });
})

describe('create position', () => {

    beforeEach(() => {
        dao.getPosition.mockReset()
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //422
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(null) //201

        dao.storePosition.mockReset()
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0)); //201
    });

    test('create position', async () => {
        let res = await positionService.createPosition('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0);

        //expect 422
        expect(res.code).toBe(422);

        //expect 503
        res = await positionService.createPosition('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0);
        expect(res.code).toBe(503);

        //expect 201
        res = await positionService.createPosition('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0);
        expect(res.code).toBe(201);
        expect(dao.storePosition.mock.calls[0][0].toJSON()).toEqual(
            new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 0, 0).toJSON()
        );
    });
})

describe('update position', () => {

    beforeEach(() => {
        dao.getPosition.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //422 already present
            .mockReturnValueOnce(new Position('800234523416', '8002', '3452', '3415', 1000, 1000, 100, 100))
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //422 not enough space
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //503
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //200
            .mockReturnValueOnce(null)

        dao.updatePosition.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //200
    });

    test('update position', async () => {
        let res = await positionService.updatePosition('800234523415', '8002', '3452', '3416', 900, 900, 200, 200);

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await positionService.updatePosition('800234523415', '8002', '3452', '3416', 900, 900, 200, 200);
        expect(res.code).toBe(422);
        expect(res.error).toContain('already present');

        //expect 422
        res = await positionService.updatePosition('800234523415', '8002', '3452', '3416', 900, 900, 1200, 1200);
        expect(res.code).toBe(422);
        expect(res.error).toContain('no enough volume/weight');

        //expect 503
        res = await positionService.updatePosition('800234523415', '8002', '3452', '3416', 900, 900, 200, 200);
        expect(res.code).toBe(503);

        //expect 200
        res = await positionService.updatePosition('800234523415', '8002', '3452', '3416', 900, 900, 200, 200);
        expect(res.code).toBe(200);
        expect(dao.updatePosition.mock.calls[0][0]).toEqual('800234523415');
        expect(dao.updatePosition.mock.calls[0][1].toJSON()).toEqual(
            new Position('800234523416', '8002', '3452', '3416', 900, 900, 200, 200).toJSON()
        );
    })
})

describe('update position id', () => {

    beforeEach(() => {
        dao.getPosition.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //422 already present
            .mockReturnValueOnce(new Position('800234523416', '8002', '3452', '3415', 1000, 1000, 100, 100))
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //503
            .mockReturnValueOnce(null)
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //200
            .mockReturnValueOnce(null)

        dao.updatePosition.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //200

        dao.updateSkuPosition.mockReset()
            .mockReturnValueOnce(true) //200
    });

    test('update position id', async () => {
        let res = await positionService.updatePositionId('800234523415', '800234523416', '8002', '3452', '3416');

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await positionService.updatePositionId('800234523415', '800234523416', '8002', '3452', '3416');
        expect(res.code).toBe(422);

        //expect 503
        res = await positionService.updatePositionId('800234523415', '800234523416', '8002', '3452', '3416');
        expect(res.code).toBe(503);

        //expect 200
        res = await positionService.updatePositionId('800234523415', '800234523416', '8002', '3452', '3416');
        expect(res.code).toBe(200);
        expect(dao.updatePosition.mock.calls[0][0]).toEqual('800234523415');
        expect(dao.updatePosition.mock.calls[0][1].toJSON()).toEqual(
            new Position('800234523416', '8002', '3452', '3416', 1000, 1000, 100, 100).toJSON()
        );
    })
})

describe('delete position', () => {

    beforeEach(() => {
        dao.getPosition.mockReset()
            .mockReturnValueOnce(null) //422
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //503
            .mockReturnValueOnce(new Position('800234523415', '8002', '3452', '3415', 1000, 1000, 100, 100)) //204

        dao.deletePosition.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //204
    });

    test('delete position', async () => {
        let res = await positionService.deletePosition('800234523415');

        //expect 422
        expect(res.code).toBe(422);

        //expect 503
        res = await positionService.deletePosition('800234523415');
        expect(res.code).toBe(503);

        //expect 204
        res = await positionService.deletePosition('800234523415');
        expect(res.code).toBe(204);
    });
})