const dayjs = require('dayjs');
const InternalOrder = require('../models/internalOrder');

const generateInternalOrders = function () {
    const io1 = new InternalOrder(0, dayjs(), [1, 2, 3], 1);
    const io2 = new InternalOrder(1, dayjs(), [4, 5, 6], 2);
    const io3 = new InternalOrder(2, dayjs(), [7, 8, 9], 3);

    io1.setState('COMPLETED');
    io2.setState('ACCEPTED');

    return [io1, io2, io3];
}

module.exports = generateInternalOrders