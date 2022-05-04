function ReturnOrder(id, returnDate, products, restockOrderId){
    this.id = id;
    this.returnDate = returnDate;
    this.products = products;
    this.restockOrderId = restockOrderId;
    
    this.getId = () => this.id;
    this.getReturnDate = () => this.returnDate;
    this.getProducts = () => this.products;
    this.getRestockOrderId = () => this.restockOrderId;
    
}