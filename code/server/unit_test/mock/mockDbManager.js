
/** Sku
 * methods of sku
 */

exports.getSkuById = jest.fn();
exports.getAllSkus = jest.fn();
exports.storeSku = jest.fn();
exports.updateSku = jest.fn();
exports.deleteSku = jest.fn();
exports.updateSkuPosition = jest.fn();
exports.getSkuOfPosition = jest.fn();

/**
 * SkuItems
 */

exports.getAllSkuItems = jest.fn();
exports.getSkuItemByRfid = jest.fn();
exports.getSkuItem = jest.fn();
exports.getSkuItemsOf = jest.fn();
exports.getAvailableSkuItemsOf = jest.fn();
exports.storeSkuItem = jest.fn();
exports.updateSkuItem = jest.fn();
exports.deleteSkuItem = jest.fn();

/**
 * Item
 */

exports.getAllItems = jest.fn();
exports.getItemById = jest.fn();
exports.getItemBySkuIdAndSupplier = jest.fn();
exports.storeItem = jest.fn();
exports.updateItem = jest.fn();
exports.deleteItem = jest.fn();

/**
 * TestDescriptor
 */

exports.getAllTestDescriptors = jest.fn();
exports.getTestDescriptor = jest.fn();
exports.getTestDescriptorsOf = jest.fn();
exports.storeTestDescriptor = jest.fn();
exports.updateTestDescriptor = jest.fn();
exports.deleteTestDescriptor = jest.fn();

/**
 * TestResult
 */

exports.getAllTestResultsBySkuItem = jest.fn();
exports.getTestResult = jest.fn();
exports.storeTestResult = jest.fn();
exports.updateTestResult = jest.fn();
exports.deleteTestResult = jest.fn();
exports.getNegativeTestResultsOf = jest.fn();

/**
 * Position
 */

exports.getPosition = jest.fn();
exports.getAllPositions = jest.fn();
exports.storePosition = jest.fn();
exports.updatePosition = jest.fn();
exports.deletePosition = jest.fn();
exports.getOccupiedCapacitiesOf = jest.fn();

/*
 * RestockOrder
 */

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

/*
 * ReturnOrder
 */

exports.getAllReturnOrders = jest.fn();
exports.getReturnOrder = jest.fn();
exports.getReturnOrderSkuItems = jest.fn();
exports.storeReturnOrder = jest.fn();
exports.storeReturnOrderSkuItems = jest.fn();
exports.deleteReturnOrder = jest.fn();

/*
 * InternalOrder
 */

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

/**
 * User
 */

exports.getUserByIdAndType = jest.fn();
exports.getUser = jest.fn();
exports.getAllUsersOfType = jest.fn();
exports.getAllUsers = jest.fn();
exports.storeNewUser = jest.fn();
exports.updateUser = jest.fn();
exports.deleteUser = jest.fn();
