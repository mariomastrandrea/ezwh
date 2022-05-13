const DbManagerFactory = require('../../db/dbManager3');
const dao = DbManagerFactory();
const RestockOrder = require('../../models/restockOrder');

describe('[DB] test restock orders functions', () => {
    test('get all restock orders', async()   => {
        const ros = await dao.getAllRestockOrders();
        for(const ro of ros){
            expect(ro).toBeInstanceOf(RestockOrder);
        }
    });
    test('get restock order in state: delivered', async()   => {
        const ros = await dao.getRestockOrdersInState('DELIVERED');
        for(const ro of ros){
            expect(ro).toBeInstanceOf(RestockOrder);
            expect(ro.getState()).toBe('DELIVERED');
        }
    });
    test('get restock order by id', async()   => {
        const ro = await dao.getRestockOrder(1);
        expect(ro).toBeInstanceOf(RestockOrder);
        expect(ro.getId()).toBe(1);
    })
})