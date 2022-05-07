const dayjs = require('dayjs');
const InternalOrder = require('../models/internalOrder');
const ReturnOrder = require('../models/returnOrder');
const RestockOrder = require('../models/restockOrder');

const generateInternalOrders = function () {
    const io0 = new InternalOrder(0, dayjs(), [1, 2, 3], 1);
    const io1 = new InternalOrder(1, dayjs(), [4, 5, 6], 2);
    const io2 = new InternalOrder(2, dayjs(), [7, 8, 9], 3);
    const io3 = new InternalOrder(3, dayjs(), [10, 11, 12], 4);

    io1.setState('COMPLETED');
    io2.setState('ACCEPTED');

    return [io0, io1, io2, io3];
}

const generateReturnOrders = function () {
    const ro0 = new ReturnOrder(0, dayjs(), [1, 2, 3], 1);
    const ro1 = new ReturnOrder(1, dayjs(), [4, 5, 6], 2);
    const ro2 = new ReturnOrder(2, dayjs(), [7, 8, 9], 3);
    const ro3 = new ReturnOrder(3, dayjs(), [10, 11, 12], 4);

    return [ro0, ro1, ro2, ro3];
}

const generateRestockOrders = function () {
    const ro0 = new RestockOrder(0, dayjs(), [1, 2, 3], 1, "transport");
    const ro1 = new RestockOrder(1, dayjs(), [4, 5, 6], 2, "transport");
    const ro2 = new RestockOrder(2, dayjs(), [7, 8, 9], 3, "transport");
    const ro3 = new RestockOrder(3, dayjs(), [10, 11, 12], 4, "transport");

    return [ro0, ro1, ro2, ro3];
}




module.exports = {
    generateInternalOrders, 
    generateReturnOrders, 
    generateRestockOrders
}