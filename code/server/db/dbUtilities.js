const sqlite = require('sqlite3').verbose();
const dbSource = './ezwh.sqlite';

// tables' names
const tables = [
    'sku',
    'skuitem',
    'item',
    'restockOrder',
    'returnOrder',
    'internalOrder'
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
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'products text',
        'supplierId numeric',
        'transportNote numeric',
        'skuItems text',
    ],
    returnOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'returnDate text',
        'products text',
        'restockOrderId numeric',
        'FOREIGN KEY(restockOrderId) REFERENCES restockOrder(id)'
    ],
    internalOrder: [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'issueDate text',
        'state text',
        'products text',
        'customerId numeric',
    ]
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