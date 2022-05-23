# Unit Testing Report

Date:

Version:

# Contents

- [Black Box Unit Tests](#black-box-unit-tests)




- [White Box Unit Tests](#white-box-unit-tests)


# Black Box Unit Tests

Because of complexity of the system, we have decided to test only some of the most significant functions through Black Box Unit Testing. In this section we will test the following functions of DbManager (dao):
  

  - getUser(username, type)
  - updatePosition(oldPositionId, newPosition)
  - deleteTestDescriptor(id)
  - storeRestockOrderSku(id, products)
  - storeInternalOrder(io)


        <Define here criteria, predicates and the combination of predicates for each function of each class.
        Define test cases to cover all equivalence classes and boundary conditions.
        In the table, report the description of the black box test case and (traceability) the correspondence with the Jest test case writing the 
        class and method name that contains the test case>
        <Jest tests  must be in code/server/unit_test  >


 ### **Class DbManager - method getUser(username, type)**

**Criteria for method getUser(username, type):**
	

 - username is string
 - type is string
 - User with the given username exists in the database




**Predicates for method getUser(username, type):**


| Criteria           | Predicate |
| ------------------ | :-------: |
| username is string |    yes    |
|                    |    not    |
| type is string     |    yes    |
|                    |    not    |
| User exists        |    yes    |
|                    |    not    |



**Boundaries**:


| Criteria           | Boundary values |
| ------------------ | :-------------: |
| username is string |        0        |
| type is string     |        0        |
| User exists        |        0        |



**Combination of predicates**:


| username is string | type is string | username exists | Valid / Invalid | Description of the test case                                                   | Test case                            |
| :----------------: | :------------: | :-------------: | :-------------: | ------------------------------------------------------------------------------ | ------------------------------------ |
|        yes         |      yes       |       yes       |      Valid      | The parameters are correct and User exists, it will return an instance of User | getUser("username", "type1") -> User |
|        yes         |      yes       |       not       |     Invalid     | The parameters are in a correct form, but User doesn't exist                   | getUser("username", "type1") -> Null |
|        yes         |      not       |   yes or not    |     Invalid     | type is not defined, it will throw an error                                    | getUser("username", null) -> Error   |
|        not         |      yes       |   yes or not    |     Invalid     | username is not defined, it will throw an error                                | getUser(null, "type1) -> Error       |
|        not         |      not       |   yes or not    |     Invalid     | username and type are not defined, it will throw an error                      | getUser(null, null) -> Error         |

 ### **Class DbManager - method updatePosition(oldPositionId, newPosition)**

 **Criteria for method updatePosition(oldPositionId, newPosition):**
	

 - oldPositionId is a Well Formed Number (WFN) (see below)
 - newPosition is a Well Formed Position (WFP) (see below)
 - Position with id  oldPositionId exists in the database


<i>A Well Formed Number (WFN) is a Number or a String that can be converted correctly to a Number </i>


<i>A Well Formed Position (WFP) is an instance of Position in which attributes satisfy ALL the following constraints:</i>


| Attribute                  | Constraints    |
| -------------------------- | -------------- |
| newPosition.positionId     | === 12         |
| newPosition.aisle          | === 4          |
| newPosition.row            | === 4          |
| newPosition.col            | === 4          |
| newPosition.maxWeight      | 0 to maxDouble |
| newPosition.maxVolume      | 0 to maxDouble |
| newPosition.OccupiedWeight | 0 to maxDouble |
| newPosition.OccupiedVolume | 0 to maxDouble |

**Predicates for method updatePosition(oldPositionId, newPosition):**


| Criteria                              |     Predicate     |
| ------------------------------------- | :---------------: |
| oldPositionId is a WFN                |        yes        |
|                                       |        no         |
| newPosition is a WFP                  |        yes        |
|                                       |        no         |
| Position with id oldPositionId exists |        yes        |
|                                       |        no         |
| oldPositionId length                  |    equal to 12    |
|                                       | different than 12 |



**Boundaries**:


| Criteria                              | Boundary values |
| ------------------------------------- | :-------------: |
| oldPositionId is a WFN                |        0        |
| newPosition is a WFP                  |        0        |
| Position with id oldPositionId exists |        0        |
| oldPositionId length                  |     === 12      |
| type is string                        |        0        |
| username exists                       |        0        |



**Combination of predicates**:


| oldP is WFN | newP is WFP | Position exists | oldPositionId length | Valid / Invalid | Description of the test case                                     | Test case                                        |
| :---------: | :---------: | :-------------: | :------------------: | :-------------: | ---------------------------------------------------------------- | ------------------------------------------------ |
|     yes     |     yes     |       yes       |     equal to 12      |      Valid      | Parameters are correct and position exists                       | updatePosition("123456789012", newP1) -> true    |
|     yes     |     yes     |       not       |  different than 12   |      Valid      | If Id is different than 12, there is not a position with this id | updatePosition("123", newP1) -> false            |
|     yes     |     yes     |       not       |     equal to 12      |      Valid      | If position don't exist, no changes, return false                | updatePosition("123456789012", newP1) -> false   |
| yes or not  |     not     |   yes or not    |         any          |     Invalid     | If newP is not WFP, it will throw an error                       | updatePosition("123456789012", "newP2") -> Error |
|     not     |     yes     |   yes or not    |         any          |     Invalid     | If oldP is not WFN, no match in table of DB                      | updatePosition("abc", newP1) -> false            |




### **Class DbManager - method deleteTestDescriptor(id)**

 **Criteria for method deleteTestDescriptor(id):**
	
 - id is a Well Formed Number (WFN) (see below)
 - Test Descriptor with id exists in the database


<i>A Well Formed Number (WFN) is a Number or a String that can be converted correctly to a Number </i>


**Predicates for method deleteTestDescriptor(id):**


| Criteria                       | Predicate |
| ------------------------------ | --------- |
| id is a WFN                    | yes       |
|                                | no        |
| Test Descriptor with id exists | yes       |
|                                | no        |



**Boundaries**:


| Criteria                       | Boundary values |
| ------------------------------ | --------------- |
| is is a WFN                    | 0               |
| Test Descriptor with id exists | 0               |



**Combination of predicates**:


| id is a WFN | TestDescriptor exists | Valid / Invalid | Description of the test case                             | Test case                            |
| :---------: | :-------------------: | :-------------: | -------------------------------------------------------- | ------------------------------------ |
|     yes     |          yes          |      Valid      | Parameters are correct and Test Descriptor exists        | deleteTestDescriptor("123") -> true  |
|     yes     |          not          |     Invalid     | Parameters are correct but Test Descriptor doesn't exist | deleteTestDescriptor(123) -> false   |
|     not     |      yes or not       |     Invalid     | id is not a WFN, it will throw an error                  | deleteTestDescriptor("abc") -> Error |



 ### **Class DbManager - method storeRestockOrderSku(id, products)**

 **Criteria for method storeRestockOrderSku(id, products):**
	
 - id is a Well Formed Number (WFN) (see below)
 - products is a Well Formed Array of Products (WFP) (see below)


<i> A Well Formed Number (WFN) is a Number or a String that can be converted correctly to a Number </i>


<i> A Well Formed Array of Products (WFP) is an array of Products in which attributes of all of the items inside satisfy ALL the following constraints: </i>


| Attribute of Item | Constraints              |
| ----------------- | ------------------------ |
| SKUId             | is a String of 12 digits |
| description       | is a String              |
| price             | 0 to maxDouble           |
| qty               | 1 to maxInt              |

**Predicates for method storeRestockOrderSku(id, products):**


| Criteria        | Predicate |
| --------------- | :-------: |
| id is WFN       |    yes    |
|                 |    not    |
| products is WFP |    yes    |
|                 |    not    |



**Boundaries**:


| Criteria        | Boundary values |
| --------------- | :-------------: |
| id is WFN       |        0        |
| products is WFP |        0        |



**Combination of predicates**:


| id is WFN | products is WFP | Valid / Invalid | Description of the test case                         | Test case                                          |
| :-------: | :-------------: | :-------------: | ---------------------------------------------------- | -------------------------------------------------- |
|    yes    |       yes       |      Valid      | Parameters are correct                               | storeRestockOrderSku("123", goodProducts) -> true  |
|    yes    |       not       |     Invalid     | Products is not WFP, it will throw an error          | storeRestockOrderSku(123, badProducts) -> Error    |
|    not    |       yes       |     Invalid     | If id is not WFN, it will throw an error             | storeRestockOrderSku("abc", goodProducts) -> Error |
|    not    |       not       |     Invalid     | If parameters aren't correct, it will throw an error | storeRestockOrderSku("abc", badProducts) -> Error  |


 ### **Class DbManager - method storeInternalOrder(io)**

 **Criteria for method storeInternalOrder(io):**
	
 - io is an instance of InternalOrder
 - io.issueDate is a Well Formed DateTime(WFD)
 - io.customerId is a Well Formed Number (WFN)
 - io.state is a String


<i> A Well Formed Number (WFN) is a Number or a String that can be converted correctly to a Number </i>


**Predicates for method storeInternalOrder(io):**


| Criteria                           | Predicate |
| ---------------------------------- | :-------: |
| io is an instance of InternalOrder |    yes    |
|                                    |    not    |
| io.issueDate is a WFD              |    yes    |
|                                    |    not    |
| io.customerId is a WFN             |    yes    |
|                                    |    not    |
| io.state is a String               |    yes    |
|                                    |    not    |



**Boundaries**:


| Criteria                           | Boundary values |
| ---------------------------------- | :-------------: |
| io is an instance of InternalOrder |        0        |
| io.issueDate is a WFD              |        0        |
| io.customerId is a WFN             |        0        |
| io.state is a String               |        0        |

**Combination of predicates**:


| io is InternalOrder | io.issueDate is WFD | io.customerId is WFN | io.state is String | Valid / Invalid |         Description of the test case         |                Test case                |
| :-----------------: | :-----------------: | :------------------: | :----------------: | :-------------: | :------------------------------------------: | :-------------------------------------: |
|         yes         |         yes         |         yes          |        yes         |      Valid      |            Parameters are correct            | storeInternalOrder(io) -> InternalOrder |
|         yes         |     yes or not      |      yes or not      |        not         |     Invalid     |  State not String causes an error in the DB  |     storeInternalOrde(io) -> Error      |
|         yes         |     yes or not      |         not          |     yes or not     |     Invalid     | CustomerId not WFN causes an error in the DB |     storeInternalOrde(io) -> Error      |
|         yes         |         not         |      yes or not      |     yes or not     |     Invalid     | IssueDate not WFD causes an error in the DB  |     storeInternalOrde(io) -> Error      |
|         not         |         --          |          --          |         --         |     Invalid     |    io is not an instance of InternalOrder    |    storeInternalOrde(null) -> Error     |



# White Box Unit Tests

### Test cases definition
    
    
    <Report here all the created Jest test cases, and the units/classes under test >
    <For traceability write the class and method name that contains the test case>


| Unit name | Jest test case |
| --------- | -------------- |
|           |                |
|           |                |
|           |                |

### Code coverage report

    <Add here the screenshot report of the statement and branch coverage obtained using
    the coverage tool. >


### Loop coverage analysis

    <Identify significant loops in the units and reports the test cases
    developed to cover zero, one or multiple iterations >

| Unit name | Loop rows | Number of iterations | Jest test case |
| --------- | --------- | -------------------- | -------------- |
|           |           |                      |                |
|           |           |                      |                |
|           |           |                      |                |
