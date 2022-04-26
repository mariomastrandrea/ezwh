# High level architecture

- **3 Layers**: *GUI* (front-end), *Application Logic*, *Data* (DB)
- **MVC** (Model-View-Controller): 
  - View -> gui (not implemented in the application logic layer)
  - Controller -> *EzWh* class - contains all the methods implementations for the APIs
  - Model -> (all other classes in the it.polito.ezwh.data package)
- **Façade** -> all the clients' requests are managed by the *EzWh* class, which represent the *façade* of the application
- **Repository** -> the *DbManager* class represents the unique access point to all the persistent data managed by the application and it is the only one interacting with the Database 


# Packages:
- **it.polito.ezwh**
	- **it.polito.ezwh.data**
	- it.polito.ezwh.exception
	- it.polito.ezwh.gui


## package it.polito.ezwh.data:

### enums
- InternalOrderState \<enum> {ISSUED, ACCEPTED, REFUSED, CANCELED, COMPLETED}
- RestockOrderState \<enum> {ISSUED, DELIVERY, DELIVERED, TESTED, COMPLETEDRETURN, COMPLETED}
- UserType \<enum> {CLERK, CUSTOMER, DELIVERYEMPLOYEE, MANAGER, QUALITYEMPLOYEE, SUPPLIER}

### classes
- **EzWh** (façade)
  
   #### *// Sku*
  	- getSkuById(id: int): Sku
	- getAllSku(): List\<Sku>
	- createSku(description: String, weight: float, volume: float, notes: String, price: float, availableQuantity: int): Sku
   - updateSku(id: int, newDescription: String, newWeight: float, newVolume: float, newNotes: String, newPrice: float, newAvailableQuantity: int): boolean
   - updateSkuPosition(id: int, position: String): boolean
	- deleteSku(id: int): boolean

   #### *// SkuItem* 
	- getAllSkuItems(): List\<SkuItem>
	- getAvailableSkuItems(skuId: int): List\<SkuItem>
	- getSkuItem(rfid: String): SkuItem
	- createSkuItem(rfid: String, skuId: int, dateOfStock: LocalDateTime): SkuItem
	- updateSkuItem(newRfid: String, newAvailable: int, newDateOfStock: LocalDateTime): boolean
   - deleteSkuItem(rfid: String): boolean
  
   #### *// Position*
	- getAllPositions(): List\<Position>
	- createPosition(positionId: String, aisleId: String, row: String, col: String, maxWeight: float, maxVolume: float) : Position
	- updatePosition(positionId: String, newAisleId: String, newRow: String, newCol: String, newMaxWeight: float, newMaxVolume: float, newOccupiedWeight: float, newOccupiedVolume: float): boolean  /* this updates also 'positionId' */
   - updatePositionId(oldPositionId: String, newPositionId: String): boolean  /* this updates also 'aisleId', 'row' and 'col' */
   - deletePosition(positionId: String): boolean

   #### *// TestDescriptor*
	- getAllTestDescriptors(): List\<TestDescriptor>
	- getTestDescriptor(id: int): TestDescriptor
	- createTestDescriptor(name: String, procedureDescription: String, idSku: int): TestDescriptor
	- updateTestDescriptor(id: int, newName: String, newProcedureDescription: String, newIdSku: int): boolean
	- deleteTestDescriptor(id: int): boolean

   #### *// TestResult*
	- getTestResultsBySkuItem(rfid: String): List\<TestResults>
	- getTestResult(rfid: String, id: int): TestResult
	- createTestResult(rfid: String, idTestDescriptor: int, date: LocalDate, result: boolean): TestResult
	- updateTestResult(rfid: String, id: int, newIdTestDescriptor: int, newDate: LocalDate, newResult: boolean): boolean
	- deleteTestResult(rfid: String, id: int): boolean

   #### *// User*
	- getUserInfo(): Map\<String, String>   /* retrieves user info from static login data */
	- getAllSuppliers(): List\<User>
	- getAllUsers(): List\<User>
	- createNewUser(username: String, name: String, surname: String, password: String, type: String): User
   - login(username: String, password: String, type: String): boolean
   - logout(): boolean
	- updateUserRights(username: String, oldType: String, newType: String): boolean
	- deleteUser(username: String, type: String): boolean

   #### *// Restock Order*
	- getAllRestockOrders(): List\<RestockOrder>
	- getIssuedRestockOrders(): List\<RestockOrder>
	- getRestockOrderById(id: int): RestockOrder
	- getReturnItemsByRestockOrderId(id: int): Map\<String, Object>
	- createRestockOrder(issueDate: LocalDateTime, products: Map\<Item, Integer>, supplierId: int): RestockOrder
	- updateRestockOrderState(id: int, newState: String): boolean
	- updateRestockOrderSkuItems(id: int, skuItems: Map\<String, Object>): boolean
	- updateRestockOrderTransportNote(id: int, transportNote: Map\<String, String>): boolean
	- deleteRestockOrder(id: int): boolean

   #### *// ReturnOrder*
   - getAllReturnOrders(): List\<ReturnOrder>
	- getReturnOrderById(id: int): ReturnOrder
	- createReturnOrder(returnDate: LocalDateTime, products: List\<Map\<String, Object>>, restockOrderId: int): ReturnOrder
	- deleteReturnOrder(id: int): boolean
	
   #### *// InternalOrder*
	- getAllInternalOrders(): List\<InternalOrder>
	- getIssuedInternalOrders(): List\<InternalOrder>
	- getAcceptedInternalOrders(): List\<InternalOrder>
	- getInternalOrderById(id: int): InternalOrder
	- createInternalOrder(issueDate: LocalDateTime, products: List\<Map\<Sku, Integer>>, customerId: int): InternalOrder
	- updateInternalOrder(id: int, newState: String, products: Map\<String, Object>): boolean
	- deleteInternalOrder(id: int): boolean

   #### *// Item*
	- getAllItems(): List\<Item>
	- getItemById(id: int): Item
	- createItem(description: String, price: float, skuId: int, supplierId: int): Item
	- updateItem(id: int, newDescription: String, newPrice: float): boolean
	- deleteItem(id: int): boolean
  
- **Sku**
	+ id: int {get; } 
	+ description: String {get; set;}
	+ weight: float {get; set;}
	+ volume: float {get; set;}
	+ notes: String {get; set;}
	+ position: String {get; set;}
	+ availableQuantity: int {get; set;}
	+ price: float	{get; set;}
	+ testDescriptors: List\<Integer> {get; set;}
	
- **SkuItem**
	+ rfid: String {get; set;}
	+ skuId: int {get; }
	+ available: int {get; set;}   // 0 or 1
	+ dateOfStock: LocalDateTime {get; set;}
	+ testResults: List\<Integer> {get; set;}
		
- **Position**
	+ positionId: String {get; set;}
	+ aisle: String {get; set;}
	+ row: String  {get; set;}
	+ col: String {get; set;}
	+ maxWeight: float {get; set;}
	+ maxVolume: float {get; set;}
	+ occupiedWeight: float {get; set;}
	+ occupiedVolume: float {get; set;}

- **TestDescriptor**
	+ id: int {get; }
	+ name: String {get; set;}
	+ procedureDescription: String {get; set;}
	+ idSku: int {get; set;}

- **TestResult**
	+ id: int {get; }
	+ rfid: String {get; }
	+ testDescriptorId: int {get; set;}
	+ date: LocalDate {get; set;}
	+ result: boolean {get; set;}

- **User**
	+ id: int {get; }
	+ name: String {get; }
	+ surname: String {get; }
	+ email: String {get; }   /* aka: username */
	+ type: UserType {get; set;}
	+ password: String {get; set;}

- **RestockOrder**
	+ id: int {get; }
	+ issueDate: LocalDateTime {get; }
	+ state: RestockOrderState {get; set;}
	+ products: Map\<Item, Integer> {get; }
	+ supplierId: int {get; }
	+ transportNote: Map\<String, String> {get; set;}
	+ skuItems: Map\<String, Object> {get; set->merge;}

- **ReturnOrder**
	+ id: int {get; }
	+ returnDate: LocalDateTime {get; }
	+ products: List\<Map\<String, Object>> {get; }
	+ restockOrderId: int {get; }

- **InternalOrder**
	+ id: int {get; }
	+ issueDate: LocalDateTime {get; }
	+ state: InternalOrderState {get; set;}
	+ products: List\<Map\<String, Object>> {get; }
	+ customerId: int {get; }

- **Item**
	+ id: int {get; }
	+ description: String {get; set;}
	+ price: float {get; set;}
	+ skuId: int {get; }
	+ supplierId: int {get; }
  
// to be reviewed

- **DbManager**
   - (private) openDbConnection(): boolean 
   - (private) closeDbConnection(): boolean
   
   *// sku*
   - getSku(id: int): Sku
	- getAllSkus(): List\<Sku>
	- storeSku(newSku: Sku): Sku
   - updateSku(updatedSku: Sku): Sku
	- deleteSku(id: int): Sku
   
   *// skuItem*
   - getAllSkuItems(): List\<SkuItem>
	- getAvailableSkuItems(skuId: int): List\<SkuItem>
	- getSkuItem(rfid: String): SkuItem
	- storeSkuItem(newSkuItem: SkuItem): SkuItem
	- updateSkuItem(updatedSkuItem: SkuItem): SkuItem
   - deleteSkuItem(rfid: String): SkuItem

   *// Position*
	- getAllPositions(): List\<Position>
	- storePosition(newPosition: Position): Position
	- updatePosition(updatedPosition: Position): Position
   - deletePosition(positionId: String): Position

   *// TestDescriptor*
	- getAllTestDescriptors(): List\<TestDescriptor>
	- getTestDescriptor(id: int): TestDescriptor
	- storeTestDescriptor(newTestDescriptor: TestDescriptor): TestDescriptor
	- updateTestDescriptor(updatedTestDescriptor: TestDescriptor): TestDescriptor
	- deleteTestDescriptor(id: int): TestDescriptor

   *// TestResult*
	- getTestResults(rfid: String): List\<TestResults>
	- getTestResult(rfid: String, id: int): TestResult
	- storeTestResult(newTestResult: TestResult): TestResult
	- updateTestResult(updatedTestResult: TestResult): TestResult
	- deleteTestResult(rfid: String, id: int): TestResult

   *// User*
	- getUser(username: String, password: String): User   
	- getAllUsersOfType(type: UserType): List\<User>
	- getAllUsers(): List\<User>
	- storeNewUser(newUser: User): User
	- updateUser(updatedUser: User): User
	- deleteUser(username: String, type: String): User

   *// Restock Order*
	- getAllRestockOrders(): List\<RestockOrder>
	- getRestockOrdersInState(state: RestockOrderState): List\<RestockOrder>
	- getRestockOrder(id: int): RestockOrder
	- storeRestockOrder(newRestockOrder: RestockOrder): RestockOrder
	- updateRestockOrder(updatedRestockOrder: RestockOrder): RestockOrder
	- deleteRestockOrder(id: int): RestockOrder

   *// ReturnOrder*
   - getAllReturnOrders(): List\<ReturnOrder>
	- getReturnOrder(id: int): ReturnOrder
	- storeReturnOrder(newReturnOrder: ReturnOrder): ReturnOrder
	- deleteReturnOrder(id: int): ReturnOrder
	
   *// InternalOrder*
	- getAllInternalOrders(): List\<InternalOrder>
	- getInternalOrdersInState(state: InternalOrderState): List\<InternalOrder>
	- getInternalOrder(id: int): InternalOrder
	- storeInternalOrder(newInternalOrder: InternalOrder): InternalOrder
	- updateInternalOrder(updatedInternalOrder: InternalOrder): InternalOrder
	- deleteInternalOrder(id: int): InternalOrder

   *// Item*
	- getAllItems(): List\<Item>
	- getItem(id: int): Item
	- storeItem(newItem: Item): Item
	- updateItem(updatedItem: Item): Item
	- deleteItem(id: int): Item

## Notes
- All data types (class attributes, method parameters and method return types) refers to Java primitive types or Java main classes, and are expressed according to Java language conventions
