const sqlite = require('sqlite3').verbose();
const dbSource = './db/EZWHDB.sqlite';

// db connection 
const dbConnection = new sqlite.Database(dbSource, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');
});

/* tables' names
const tables = [
    'sku',
    'skuitem',
    'item',
    'restockOrder',
    'restockOrderSku',
    'restockOrderSkuItem',
    'returnOrder',
    'returnOrderSkuItem',
    'internalOrder',
    'internalOrderSku',
    'internalOrderSkuItem',
    'position'
];

// tables' parameters
const params = {
    sku: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'description text',
        'weight numeric',
        'volume numeric',
        'notes text',
        'position text',
        'availableQuantity numeric',
        'price numeric',
        'testDescriptor text',
        'FOREIGN KEY (position) REFERENCES position(id)'
    ],
    skuitem: [
        'RFID text PRIMARY KEY',
        'SKUId numeric',
        'Available numeric',
        'DateOfStock text',
        'TestResults text',
        'FOREIGN KEY(SKUId) REFERENCES sku(id)'
    ],
    item: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'description text',
        'price numeric',
        'skuId numeric',
        'supplierId numeric',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
    ],
    restockOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'supplierId numeric',
        'transportNote text',
        'FOREIGN KEY(supplierId) REFERENCES User(ID)'
    ],
    restockOrderSku: [
        'restockOrderId numeric',
        'skuId numeric',
        'description text',
        'price numeric',
        'quantity numeric',
        'PRIMARY KEY(restockOrderId, skuId)',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)'
    ],
    restockOrderSkuItem: [
        'restockOrderId numeric',
        'skuId numeric',
        'RFID text',
        'PRIMARY KEY(restockOrderId, skuId, RFID)',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(RFID) REFERENCES skuitem(RFID)'
    ],
    returnOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'returnDate text',
        'restockOrderId numeric',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
    ],
    returnOrderSkuItem: [
        'returnOrderId numeric',
        'skuId numeric',
        'description text',
        'price numeric',
        'RFID text',
        'PRIMARY KEY(returnOrderId, skuId, RFID)',
        'FOREIGN KEY(returnOrderId) REFERENCES returnOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(RFID) REFERENCES skuitem(RFID)'
    ],
    internalOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'customerId numeric',
        'FOREIGN KEY(customerId) REFERENCES User(ID)',
    ],
    internalOrderSku: [
        'internalOrderId numeric',
        'skuId numeric',
        'description text',
        'price numeric',
        'quantity numeric',
        'PRIMARY KEY(internalOrderId, skuId)',
        'FOREIGN KEY(internalOrderId) REFERENCES internalOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)'
    ],
    internalOrderSkuItem: [
        'internalOrderId numeric',
        'skuId numeric',
        'RFID text',
        'PRIMARY KEY(internalOrderId, skuId, RFID)',
        'FOREIGN KEY(internalOrderId) REFERENCES internalOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(RFID) REFERENCES skuitem(RFID)'
    ],
    position: [
        'id text',
        'aisle text',
        'row text',
        'col text',
        'maxWeight numeric',
        'maxVolume numeric',
        'occupiedWeight numeric',
        'occupiedVolume numeric',
        'PRIMARY KEY(id)'
    ]
} */

/* tables creation
tables.forEach(table => {
    db.run(`CREATE TABLE IF NOT EXISTS ${table} 
            (${params[table].join(', ')})`);
}) */

// module export
module.exports = { dbConnection };