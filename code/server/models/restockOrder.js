function RestockOrder(id, issueDate, products, supplierId, transportNote){
    this.restockOrderStates = ['ISSUED', 'DELIVERY', 'DELIVERED', 'TESTED', 'COMPLETED', 'COMPLETEDRETURN'];
    this.id = id;
    this.issueDate = issueDate;
    this.state = 'ISSUED';
    this.products = products;
    this.supplierId = supplierId;
    this.transportNote = transportNote;
    this.skuItems = [];
    
    this.getId = () => this.id;
    this.getIssueDate = () => this.issueDate;
    this.getState = () => this.state;
    this.getProducts = () => this.products;
    this.getSupplierId = () => this.supplierId;
    this.getTransportNote = () => this.transportNote;
    this.getSkuItems = () => this.skuItems;
    
    this.setState = (state) => this.state = state;
    this.setTransportNote = (transportNote) => this.transportNote = transportNote;
    this.setSkuItems = (skuItems) => this.skuItems.push(skuItems);
    
}