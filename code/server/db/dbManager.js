const io_test = require('../controller/utility') 

function DbManager() {
    this.db = io_test();
    
    // internal orders functions
    this.getAllInternalOrders = () => this.db;
    this.getInternalOrderInState = (state) => this.db.filter(io => io.getState() === state);
    this.getInternalOrder = (id) => this.db.filter(io => io.getId() === id);
    this.getNextAvailableIOId = () => this.db.length;
    this.storeInternalOrder = (io) => this.db.push(io);
    this.updateInternalOrder = function (io) { 
        this.db = this.db.map(oldIo => oldIo.getId() == io.getId() ? io : oldIo)
    };
    this.deleteInternalOrder = function (id) { 
        this.db = this.db.filter(io => io.getId() !== id)
    };
}

module.exports = DbManager;