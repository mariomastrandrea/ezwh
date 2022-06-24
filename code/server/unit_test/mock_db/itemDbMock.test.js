const ItemService = require('../../services/ItemService');
const dao = require('../mock/mockDbManager');
const Item = require('../../models/Item');
const Sku = require('../../models/Sku');
const User = require('../../models/User');

const itemService = new ItemService(dao);

describe('get all items', () => {

    beforeEach(() => {
        dao.getAllItems.mockReset()
            .mockReturnValueOnce([]) //200 empty
            .mockReturnValueOnce(
                [new Item(1, 'first item', 9.99, 1, 1),
                new Item(2, 'second item', 19.99, 2, 1),
                new Item(3, 'third item', 29.99, 3, 1)
                ]); //200 data
    });

    test('get all items', async () => {
        let res = await itemService.getAllItems();

        // expect 200 but empty
        expect(res.code).toBe(200);
        expect(res.obj).toEqual([]);

        // expect 200 and data
        res = await itemService.getAllItems();
        expect(res.code).toBe(200);
        for (const s of res.obj) {
            expect(s).toBeInstanceOf(Item);
        }
    });
})

describe('get item by id', () => {

    beforeEach(() => {
        dao.getItemById.mockReset()
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)) //200
            .mockReturnValueOnce(null); //404
    });

    test('get item by id', async () => {
        let res = await itemService.getItemById(1, 1);

        // expect 200
        expect(res.code).toBe(200);
        expect(res.obj.toJSON()).toEqual(new Item(1, 'first item', 9.99, 1, 1).toJSON());

        // expect 404
        res = await itemService.getItemById(1, 1);
        expect(res.code).toBe(404);
    });
})

describe('create item', () => {

    beforeEach(() => {
        dao.getSkuById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValue(new Sku('a sku', 100, 50, 'first sku', 9.99, 2, '800234523417', [], 1)) //all the rest

        dao.getItemById.mockReset()
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)) //422 item exists
            .mockReturnValueOnce(null) //422 supplier not found
            .mockReturnValueOnce(null) //422 supplier already sells
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(null) //201 

        dao.getUserByIdAndType.mockReset()
            .mockReturnValueOnce(null) //422 supplier not found
            .mockReturnValueOnce(new User(1, 'name1', 'surname1', 'e1@gmail.com', 'supplier', 'pass1')) //422 supplier already sells
            .mockReturnValueOnce(new User(1, 'name1', 'surname1', 'e1@gmail.com', 'supplier', 'pass1')) //503
            .mockReturnValueOnce(new User(1, 'name1', 'surname1', 'e1@gmail.com', 'supplier', 'pass1')) //201

        dao.getItemBySkuIdAndSupplier.mockReset()
            .mockReturnValueOnce(new Item(1, 'already sold item', 9.99, 1, 1)) //422 supplier already sells
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(null) //201

        dao.storeItem.mockReset()
            .mockReturnValueOnce(null) //503
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)); //201
    });

    test('create item', async () => {
        let res = await itemService.createItem(1, 'first item', 9.99, 1, 1);

        //expect 404
        expect(res.code).toBe(404);

        //expect 422
        res = await itemService.createItem(1, 'first item', 9.99, 1, 1);
        expect(res.code).toBe(422);
        expect(res.error).toContain('item');

        //expect 422
        res = await itemService.createItem(1, 'first item', 9.99, 1, 1);
        expect(res.code).toBe(422);
        expect(res.error).toContain('supplier');

        //expect 422
        res = await itemService.createItem(1, 'first item', 9.99, 1, 1);
        expect(res.code).toBe(422);
        expect(res.error).toContain('already sells');

        //expect 503
        res = await itemService.createItem(1, 'first item', 9.99, 1, 1);
        expect(res.code).toBe(503);

        //expect 201
        res = await itemService.createItem(1, 'first item', 9.99, 1, 1);
        expect(res.code).toBe(201);
        expect(dao.storeItem.mock.calls[0][0].toJSON()).toEqual(
            new Item(1, 'first item', 9.99, 1, 1).toJSON()
        );
    });
})

describe('update item', () => {

    beforeEach(() => {
        dao.getItemById.mockReset()
            .mockReturnValueOnce(null) //404
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)) //503
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)); //200

        dao.updateItem.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true) //200
    });

    test('update item', async () => {
        let res = await itemService.updateItem(1, 1, 'updated item', 19.99);

        //expect 404
        expect(res.code).toBe(404);

        //expect 503
        res = await itemService.updateItem(1, 1, 'updated item', 19.99);
        expect(res.code).toBe(503);

        //expect 200
        res = await itemService.updateItem(1, 1, 'updated item', 19.99);
        expect(res.code).toBe(200);
        expect(dao.updateItem.mock.calls[0][0].toJSON()).toEqual(
            new Item(1, 'updated item', 19.99, 1, 1).toJSON()
        );
    })
})

describe('delete item', () => {

    beforeEach(() => {
        dao.getItemById.mockReset()
            .mockReturnValueOnce(null) //422
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)) //503
            .mockReturnValueOnce(new Item(1, 'first item', 9.99, 1, 1)); //204

        dao.deleteItem.mockReset()
            .mockReturnValueOnce(false) //503
            .mockReturnValueOnce(true) //204
    });

    test('delete item', async () => {
        let res = await itemService.deleteItem(1, 1);

        //expect 422
        expect(res.code).toBe(422);

        //expect 503
        res = await itemService.deleteItem(1, 1);
        expect(res.code).toBe(503);

        //expect 204
        res = await itemService.deleteItem(1, 1);
        expect(res.code).toBe(204);
    })
})