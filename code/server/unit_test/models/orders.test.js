const RestockOrder = require('../../models/restockOrder');
const ReturnOrder = require('../../models/returnOrder');

describe('create orders', () => {
    test('create return order', async() => {
        const id = 1;
        const date = "2020/01/01 00:00";
        const products = [];
        const refId = 1;
        let res = new ReturnOrder(date, products, refId, id);
        expect(res).toBeInstanceOf(ReturnOrder);
        expect(res.getId()).toBe(id);
        expect(res.getReturnDate()).toBe(date);
        expect(res.getProducts()).toBe(products);
        expect(res.getRestockOrderId()).toBe(refId);

        expect(res.toJSON()).toEqual({
            id: id,
            returnDate: date,
            products: products,
            restockOrderId: refId,
        });

        res.setProducts([123,123]);
        expect(res.getProducts()).toEqual([123,123]);
    });

    test('create restock order', async() => {
        const id = 1;
        const date = "2020/01/01 00:00";
        const products = [
            123,234
        ];
        const refId = 1;
        const transportNote = "test";
        const skuItems = [123, 234];
        const state = "DELIVERED";
        let res = new RestockOrder(date, [], refId, "",id);
        expect(res).toBeInstanceOf(RestockOrder);
        expect(res.getId()).toBe(id);
        expect(res.getIssueDate()).toBe(date);
        expect(res.getProducts()).toEqual([]);
        expect(res.getSupplierId()).toBe(refId);

        expect(res.toJSON()).toEqual({
            id: id,
            issueDate: date,
            products: [],
            state: "ISSUED",
            supplierId: refId,
            skuItems:[],
            
        });

        res.setProducts(products);
        expect(res.getProducts()).toEqual(products);

        res.setSkuItems(skuItems);
        expect(res.getSkuItems()).toEqual(skuItems);

        res.setTransportNote(transportNote);
        expect(res.getTransportNote()).toEqual(transportNote);
        res.setState(state);
        expect(res.toJSON()).toEqual({
            id: id,
            issueDate: date,
            state: state,
            products: products,
            supplierId: refId,
            transportNote: transportNote,
            skuItems: skuItems,
        });
        res.setSkuItems(skuItems);
        expect(res.getSkuItems()).toEqual([...skuItems, ...skuItems]);
    });
});