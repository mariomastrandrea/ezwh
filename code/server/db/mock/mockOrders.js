/* -- RESTOCK ORDER -- */
exports.getAllRestockOrders = jest.fn();
exports.getRestockOrdersInState = jest.fn();
exports.getRestockOrder = jest.fn();
exports.getRestockOrderSku = jest.fn();
exports.getRestockOrderSkuItems = jest.fn();
exports.getReturnItemsByRestockOrderId = jest.fn();
exports.storeRestockOrder = jest.fn();
exports.storeRestockOrderSku = jest.fn();
exports.storeRestockOrderSkuItems = jest.fn();
exports.updateRestockOrder = jest.fn();
exports.deleteRestockOrder = jest.fn();
exports.deleteRestockOrderSku = jest.fn();
exports.deleteRestockOrderSkuItems = jest.fn();

/* -- RETURN ORDER -- */
exports.getAllReturnOrders = jest.fn();
exports.getReturnOrder = jest.fn();
exports.getReturnOrderSkuItems = jest.fn();
exports.storeReturnOrder = jest.fn();
exports.storeReturnOrderSkuItems = jest.fn();
exports.deleteReturnOrder = jest.fn();

/* -- INTERNAL ORDER -- */
exports.getAllInternalOrders = jest.fn();
exports.getInternalOrdersInState = jest.fn();
exports.getInternalOrder = jest.fn();
exports.getInternalOrderSku = jest.fn();
exports.getInternalOrderSkuItems = jest.fn();
exports.storeInternalOrder = jest.fn();
exports.storeInternalOrderSku = jest.fn();
exports.storeInternalOrderSkuItems = jest.fn();
exports.updateInternalOrder = jest.fn();
exports.deleteInternalOrder = jest.fn();
exports.deleteInternalOrderSku = jest.fn();
exports.deleteInternalOrderSkuItems = jest.fn();