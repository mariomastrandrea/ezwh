const sqlite = require('sqlite3').verbose();
const dbSource = './ezwh.sqlite';

// tables' names
const tables = [
    'sku',
    'skuitem',
    'item',
    'restockOrder',
    'restockOrderSkuItem',
    'returnOrder',
    'internalOrder',
    'internalOrderSkuItem',
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
        'testDescriptor text'
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
        'supplierId numeric ',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
    ],
    restockOrder: [
        'id INTEGER',
        'issueDate text',
        'state text',
        'skuId numeric',
        'description text',
        'price numeric',
        'supplierId numeric',
        'transportNote text',
        'quantity numeric',
        'PRIMARY KEY(id, skuId)',
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
        'id INTEGER',
        'returnDate text',
        'skuId numeric',
        'description text',
        'price numeric',
        'rfid text',
        'restockOrderId numeric',
        'PRIMARY KEY(id, rfid)',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)',
        'FOREIGN KEY(skuId) REFERENCES sku(id)',
        'FOREIGN KEY(rfid) REFERENCES skuitem(RFID)'
    ],
    internalOrder: [
        'id INTEGER',
        'issueDate text',
        'state text',
        'skuId text',
        'description text',
        'price numeric',
        'quantity numeric',
        'customerId numeric',
        'PRIMARY KEY(id, SKUId)',
        'FOREIGN KEY(SKUId) REFERENCES sku(id)',
        'FOREIGN KEY(customerId) REFERENCES customer(id)'
    ],
    internalOrderSkuItem: [
        'internalOrderId numeric',
        'skuId numeric',
        'RFID text',
        'PRIMARY KEY(internalOrderId, skuId, RFID)',
    ],
}

// db connection 
const db = new sqlite.Database(dbSource, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the SQLite database.');
});

// tables creation
tables.forEach(table => {
    db.run(`CREATE TABLE IF NOT EXISTS ${table} 
            (${params[table].join(', ')})`);
})

// module export
module.exports = { db };