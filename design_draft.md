3 packages:
- it.polito.ezwh
	- it.polito.ezwh.data
	- it.polito.ezwh.exception
	- it.polito.ezwh.gui


MVC?
Façade

package it.polito.ezwh.data:

- EzWh (façade)
	- getSkuById(id: int): Sku
	- getAllSku(): List<Sku>
	- createSku(description: String, weight: float, volume: float, notes: String, price: float, availableQuantity: int): Sku
	- deleteSku(id: int): boolean
	- updateSku(id: int, description: String, weight: float, volume: float, notes: String, price: float, availableQuantity: int): boolean
	- updateSkuPosition(id: int, position: String): boolean

	- getAllSkuItems(): List<SkuItem>
	- getAvailableSkuItems(skuId: int): List<SkuItem>
	- createSkuItem(rfid: String, skuId: int, dateOfStock: LocalDate): SkuItem
	- deleteSkuItem(rfid: String): boolean
	- updateSkuItem(rfid: String, available: int, dateOfStock: LocalDate): SkuItem

	- getAllPositions(): List<Position>
	- createPosition(positionId: String, aisleId: String, row: String, col: String, maxWeight: float, maxVolume: float) : Position
	- updatePosition(positionId: String, aisleId: String, row: String, col: String, maxWeight: float, maxVolume: float)
    - deletePosition(positionId: String): boolean
	- updatePositionId(oldPositionId, newPositionId): boolean

	- getAllTestDescriptors(): List<TestDescriptor>
	- getTestDescriptor(id: int): TestDescriptor
	- createTestDescriptor(name: String, procedureDescription: String, idSku: int): TestDescriptor
	- updateTestDescriptor(id: int, name: String, procedureDescription: String, idSku: int): boolean
	- deleteTestDescriptor(id: int): boolean

	- getTestResultsBySkuItem(Rfid: String): List<TestResults>
	- getTestResult(Rfid: String, id: int): TestResult
	- createTestResult(rfid: String, idTestDescriptor: int, Date: LocalDate, Result: boolean): TestResult
	- updateTestResult(rfid: String, oldId: int, newId: int, date: LocalDate, result: boolean ): boolean
	- deleteTestResult(rfid: String, id: int): boolean

	- getAllSuppliers(): List<User>
	- getAllUsers(): List<User>
	- getUserInfo(): Map<String, String>   -- retrieves user info from static data
	- createNewUser(username: String, name: String, surname: String, password: String, type: String): User
	- updateUserRights(username: String, oldType: String, newType: String): boolean
	- deleteUser(username: String, type: String): boolean

	- getAllRestockOrders(): List<RestockOrder>
	- getIssuedRestockOrders(): List<RestockOrder>
	- getRestockOrderById(id: int): RestockOrder
	- getReturnItemsByRestockOrderId(id: int): Map<String, String>
	- createRestockOrder(issueDate: LocalDate, products: Map<Sku, int>, supplierId: int): RestockOrder
	- updateRestockOrderState(id: int, newState: String): boolean
	- updateSkuItemsListOfRestockOrder(id: int, skuItemsList: List<SkuItem>): boolean
	- addTransportNoteToRestockOrder(id: int, transportNote: Map<String, String>): boolean
	- deleteRestockOrder(id: int): boolean

	- getReturnOrder(id: int): ReturnOrder
	- createReturnOrder(returnDate: LocalDate, products: Map<String, Object>, restockOrderId: int): ReturnOrder
	- deleteReturnOrder(id: int): boolean
	
	- getInternalOrders(): List<InternalOrder>
	- getIssuedInternalOrders(): List<InternalOrder>
	- getAcceptedInternalOrders(): List<InternalOrder>
	- getInternalOrderById(id_ int): InternalOrder
	- createInternalOrder(issueDate:LocalDate, products: Map<Sku, int>, customId: int): InternalOrder
	- updateInternalOrder(id: int, state, products: Map<String, String>): boolean
	- deleteInternalOrder(id: int): boolean

	- getAllItems(): List<Item>
	- getItemById(id: int): Item
	- createNewItem(description: String, price: float, SKUId: int, supplierID: int): Item
	- updateItem(id: int, description: String, price: float): float
	- deleteItem(id: int): boolean

- InternalOrderState <enum> {ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED}
- RestockOrderState <enum> {ISSUED, DELIVERY, DELIVERED, TESTED, COMPLETEDRETURN, COMPLETED}
  
- Sku
	+ id: int {get; } 
	+ description: String {get; set}
	+ weight: float {get; set}
	+ volume: float {get; set}
	+ notes: String {get; set}
	+ position: String {get; set}
	+ availableQuantity: int {get; set}
	+ price: float	{get; set}
	+ testDescriptors: List<Integer> {get; set}
	
- SkuItem
	+ rfId: String {get; set}
	+ skuId: int {get; }
	+ available: int {get; set}
	+ dateOfStock: LocalDate {get; set}
	+ testResults: List<Integer>
		
- Position
	+ positionId: String {get; set}
	+ aisle: String {get; set}
	+ row: String  {get; set}
	+ col: String {get; set}
	+ maxWeight: float {get; set}
	+ maxVolume: float {get; set}
	+ occupiedWeight: float {get; set}
	+ occupiedVolume: float {get; set}

- TestDescriptor
	+ id: int {get; }
	+ name: String {get; set}
	+ procedureDescription: String {get; set}
	+ idSku: int {get; set}

- TestResult
	+ id: int {get; set}
	+ testDescriptorId: int {get; set}
	+ date: LocalDate {get; set}
	+ result: boolean {get; set}

- User
	+ id: int {get; }
	+ name: String {get; }
	+ surname: String {get; }
	+ email: String {get; set}
	+ type: enum {get; set}
	+ password: String {get; set}

- RestockOrder
	+ id: int {get; }
	+ issueDate: LocalDate {get}
	+ state: RestockOrderState {get; set}
	+ products: Map<String, Object> {get}
	+ supplierId: int {get}
	+ transportNote: Map<String, String> {get; set}
	+ skuItems: List<SkuItem> {get; set->merge}

- ReturnOrder
	+ id: int {get; }
	+ returnDate: Date {get; }
	+ products: Map<String, Object> {get; }
	+ restockOrderId: int {get; }

- InternalOrder
	+ id: int {get; }
	+ issueDate: LocalDate {get; }
	+ state: enum {get; set}
	+ products: List<Map<String, Object>> {get; set}
	+ customerId: int {get; }

- Item
	+ id: int {get; }
	+ description: String {get; set}
	+ price: float {get; set}
	+ SkuId: int {get; }
	+ supplierId: int {get; }

- Supplier?
- Customer?


Relevant scenarios for sequence diagrams:
- create user
- update item
- delete