const TestDescriptorService = require('../../services/testDescriptorService');
const dao = require('../mock/mockDbManager');
const TestDescriptor = require('../../models/testDescriptor');
const Sku = require('../../models/sku');

const testDescriptorService = new TestDescriptorService(dao);

describe('get all test descriptors', () => {

    beforeEach(() => {
        dao.getAllTestDescriptors.mockReset()
            .mockReturnValueOnce([]) //200 empty
            .mockReturnValueOnce(
                [new TestDescriptor(1, 'test desc 1', 'this test is...', 1),
                new TestDescriptor(2, 'test desc 2', 'this test is...', 2),
                new TestDescriptor(3, 'test desc 3', 'this test is...', 3),
                ]); //200 data
    });

    test('get all test descriptors', async () => {
        let res = await testDescriptorService.getAllTestDescriptors();

        // expect 200 but empty
        expect(res.code).toBe(200);
        expect(res.obj).toEqual([]);

        // expect 200 and data
        res = await testDescriptorService.getAllTestDescriptors();
        expect(res.code).toBe(200);
        for (const td of res.obj) {
            expect(td).toBeInstanceOf(TestDescriptor);
        }
    });
})

describe('get test descriptor by id', () => {

    beforeEach(() => {
        dao.getTestDescriptor.mockReset()
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //202
            .mockReturnValueOnce(null); //404
    });

    test('get test descriptor by id', async () => {
        let res = await testDescriptorService.getTestDescriptor(1);

        // expect 200
        expect(res.code).toBe(200);
        expect(res.obj.toJSON()).toEqual(new TestDescriptor(1, 'test desc 1', 'this test is...', 1).toJSON());

        // expect 404
        res = await testDescriptorService.getTestDescriptor(1);
        expect(res.code).toBe(404);
    });
})

describe('create test descriptor', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(new Sku("", 20, 20, "", 10, 1, "", [], 1)) //201
            .mockReturnValueOnce(new Sku("", 20, 20, "", 10, 1, "", [], 1)) //503
            .mockReturnValueOnce(null); //404

        dao.storeTestDescriptor.mockReset()
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //201
            .mockReturnValueOnce('ErrorDB'); //503
    });

    test('create test descriptor', async () => {
        let res = await testDescriptorService.createTestDescriptor('test desc 1', 'this test is...', 1);

        //expect 201
        expect(res.code).toBe(201);
        expect(dao.storeTestDescriptor.mock.calls[0][0].toJSON()).toEqual(
            new TestDescriptor(null, 'test desc 1', 'this test is...', 1).toJSON()
        );

        //expect 503
        res = await testDescriptorService.createTestDescriptor('string', 'string', 'string');
        expect(res.code).toBe(503);

        //expect 404 sku not found
        res = await testDescriptorService.createTestDescriptor('test desc 1', 'this test is...', 1);
        expect(res.code).toBe(404);
    });
})

describe('update test descriptor', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(new Sku("", 20, 20, "", 10, 1, "", [], 1)) //200
            .mockReturnValueOnce(new Sku("", 20, 20, "", 10, 1, "", [], 1)) //503
            .mockReturnValueOnce(null); //404 no sku

        dao.getTestDescriptor.mockReset()
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //200
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //503
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //404 no sku
            .mockReturnValueOnce(null); //404 no test

        dao.updateTestDescriptor.mockReset()
            .mockReturnValueOnce(1) //200
            .mockReturnValueOnce(0) //503
    });

    test('update test descriptor', async () => {
        let res = await testDescriptorService.updateTestDescriptor(1, 'update test desc 1', 'this is updated test ...', 1);

        //expect 200
        expect(res.code).toBe(200);
        expect(dao.updateTestDescriptor.mock.calls[0][0].toJSON()).toEqual(
            new TestDescriptor(1, 'update test desc 1', 'this is updated test ...', 1).toJSON()
        );

        //expect 503
        res = await testDescriptorService.updateTestDescriptor(1, 'update test desc 1', 'this is updated test ...', 1);
        expect(res.code).toBe(503);

        //expect 404 no sku
        res = await testDescriptorService.updateTestDescriptor(1, 'update test desc 1', 'this is updated test ...', 999);
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Sku not found');

        //expect 404 no test
        res = await testDescriptorService.updateTestDescriptor(999, 'update test desc 1', 'this is updated test ...', 1);
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Test descriptor not found');
    })
})

describe('delete test descriptor', () => {

    beforeEach(() => {
        dao.getTestDescriptor.mockReset()
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //204
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //503
            .mockReturnValueOnce(null); //422

        dao.deleteTestDescriptor.mockReset()
            .mockReturnValueOnce(1) //204
            .mockReturnValueOnce(0); //503
    });
    
    test('delete test descriptor', async () => {
        let res = await testDescriptorService.deleteTestDescriptor(1);

        //expect 204
        expect(res.code).toBe(204);

        //expect 503
        res = await testDescriptorService.deleteTestDescriptor(1);
        expect(res.code).toBe(503);

        //expect 422 not found
        res = await testDescriptorService.deleteTestDescriptor(1);
        expect(res.code).toBe(422);
    });
})