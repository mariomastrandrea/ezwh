const TestResultService = require('../../services/testResultService');
const dao = require('../mock/mockDbManager');
const TestResult = require('../../models/testResult');
const SkuItem = require('../../models/skuItem');
const TestDescriptor = require('../../models/testDescriptor');

const testResultService = new TestResultService(dao);

describe('get test results of skuItem', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', '1', '2022/02/07', 1)) //200
            //.mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', '1', '2022/02/07', 1)) //500
            .mockReturnValueOnce(null); //404

        dao.getAllTestResultsBySkuItem.mockReset()
            .mockReturnValueOnce([new TestResult('3', '3', '2022/02/12', 0), new TestResult('2', '2', '2022/02/12', 1)]) //200
            //.mockReturnValueOnce('ErrorDB'); //500
    });

    test('get test results of skuItem', async () => {
        let res = await testResultService.getTestResultsBySkuItem('12345678901234567890123456789015');

        // expect 200
        expect(res.code).toBe(200);
        for (const td of res.obj) {
            expect(td).toBeInstanceOf(TestResult);
        }

        //expect 500
        //res = await testResultService.getTestResultsBySkuItem('12345678901234567890123456789015');
        //expect(res.code).toBe(500);

        //expect 404
        res = await testResultService.getTestResultsBySkuItem('12345678901234567890123456789015');
        expect(res.code).toBe(404);
    });
})

describe('get test result', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(null) //404 no sku
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', '1', '2022/02/07', 1)) //404 no test
            //.mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', '1', '2022/02/07', 1)) //500
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', '1', '2022/02/07', 1)); //200


        dao.getTestResult.mockReset()
            .mockReturnValueOnce(null) //404 no test            
            //.mockReturnValueOnce('ErrorDB') //500
            .mockReturnValueOnce(new TestResult('3', '3', '2022/02/12', 0)); //200
    });

    test('get test result', async () => {
        let res = await testResultService.getTestResult(3, '12345678901234567890123456789015');

        //expect 404
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Sku item not found');

        //expect 404
        res = await testResultService.getTestResult(3, '12345678901234567890123456789015');
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Test result not found');

        //expect 500
        //res = await testResultService.getTestResult(3, '12345678901234567890123456789015');
        //expect(res.code).toBe(500);

        // expect 200
        res = await testResultService.getTestResult(3, '12345678901234567890123456789015');
        expect(res.code).toBe(200);
        expect(res.obj.toJSON()).toEqual(new TestResult('3', '3', '2022/02/12', 0).toJSON());
    });
})

describe('create test result', () => {

    beforeEach(() => {
        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(null) //404 no skuItem
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)) //404 no test
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 2, '2022/02/07', 1)) //422 not same skuId
            //.mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)) //503
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)); //201


        dao.getTestDescriptor.mockReset()
            .mockReturnValueOnce(null) //404 no test
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //422 not same skuId
            //.mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //503
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)); //201

        dao.storeTestResult.mockReset()
            //.mockReturnValueOnce('ErrorDB') //503
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)); //200
    });

    test('create test result', async () => {
        let res = await testResultService.createTestResult('12345678901234567890123456789015', 1, '2022/07/04', 1);

        //expect 404 no skuItem
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Sku item not found');

        //expect 404 no test
        res = await testResultService.createTestResult('12345678901234567890123456789015', 1, '2022/07/04', 1);
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Test descriptor not found');

        //expect 422
        res = await testResultService.createTestResult('12345678901234567890123456789015', 1, '2022/07/04', 1);
        expect(res.code).toBe(422);

        //expect 503
        //res = await testResultService.createTestResult('12345678901234567890123456789015', 1, '2022/07/04', 1);
        //expect(res.code).toBe(503);

        // expect 201
        res = await testResultService.createTestResult('12345678901234567890123456789015', 1, '2022/07/04', 1);
        expect(res.code).toBe(201);
        expect(dao.storeTestResult.mock.calls[0][0].toJSON()).toEqual(
            new TestResult(null, '12345678901234567890123456789015', 1, '2022/07/04', 1).toJSON()
        );
    });
})

describe('update test result', () => {

    beforeEach(() => {

        dao.getTestResult.mockReset()
            .mockReturnValueOnce(null) //404 no test res
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)) //404 no skuItem
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)) //404 no test
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)) //422
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)) //503
            .mockReturnValueOnce(new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/04', 1)); //200

        dao.getSkuItemByRfid.mockReset()
            .mockReturnValueOnce(null) //404 no skuItem
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)) //404 no test
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 2, '2022/02/07', 1)) //422 not same skuId
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)) //503
            .mockReturnValueOnce(new SkuItem('12345678901234567890123456789015', 1, '2022/02/07', 1)); //200


        dao.getTestDescriptor.mockReset()
            .mockReturnValueOnce(null) //404 no test
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //422 not same skuId
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)) //503
            .mockReturnValueOnce(new TestDescriptor(1, 'test desc 1', 'this test is...', 1)); //200

        dao.updateTestResult.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //200
    });

    test('update test result', async () => {
        let res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);

        //expect 404 no testRes
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Test result not found for rfid');

        //expect 404 no skuItem
        res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Sku item not found');

        //expect 404 no test
        res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);
        expect(res.code).toBe(404);
        expect(res.error).toBe('Not Found - Test descriptor not found');

        //expect 422
        res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);
        expect(res.code).toBe(422);

        //expect 503
        res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);
        expect(res.code).toBe(503);

        // expect 200
        res = await testResultService.updateTestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0);
        expect(res.code).toBe(200);
        expect(dao.updateTestResult.mock.calls[0][0].toJSON()).toEqual(
            new TestResult(1, '12345678901234567890123456789015', 1, '2022/07/01', 0).toJSON()
        );
    });
})

describe('delete test result', () => {

    beforeEach(() => {
        dao.getTestResult.mockReset()
            .mockReturnValueOnce(null) //422
            .mockReturnValueOnce(new TestResult(1, 'test desc 1', 'this test is...', 1)) //503
            .mockReturnValueOnce(new TestResult(1, 'test desc 1', 'this test is...', 1)) //204

        dao.deleteTestResult.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true); //204
    });

    test('delete test result', async () => {
        let res = await testResultService.deleteTestResult(1, '12345678901234567890123456789015');

        //expect 422 not found
        expect(res.code).toBe(422);

        //expect 503
        res = await testResultService.deleteTestResult(1, '12345678901234567890123456789015');
        expect(res.code).toBe(503);

        //expect 204
        res = await testResultService.deleteTestResult(1, '12345678901234567890123456789015');
        expect(res.code).toBe(204);
    });
})