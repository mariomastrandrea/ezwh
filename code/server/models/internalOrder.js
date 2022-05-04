function InternalOrder(id, issueDate, products, customerId) {
    this.internalOrderStates = ['ISSUED', 'ACCEPTED', 'REFUSED', 'CANCELED', 'COMPLETED'];
    
    this.id = id;
    this.issueDate = issueDate;
    this.state = 'ISSUED';
    this.products = products;
    this.customerId = customerId;

    this.getId = () => this.id;
    this.getIssueDate = () => this.issueDate;
    this.getState = () => this.state;
    this.getProducts = () => this.products;
    this.getCustomerId = () => this.customerId;

    this.setState = (state) => this.state = state;
    this.setProducts = () => this.products = products;

}

module.exports = InternalOrder;