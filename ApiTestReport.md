# Integration and API Test Report


Last modified Date: 20/06/2022

Version: 1.1

| Version Number | Description     |
| :------------: | :-------------- |
|      1.0       | Initial version |
|      1.1       | change 1        |

# Contents

- [Integration and API Test Report](#integration-and-api-test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Integration approach](#integration-approach)
- [Integration Tests](#integration-tests)
    - [UPDATE Change 1](#update-change-1)
  - [Step 1 - Unit testing dbManager with real db by Jest (A)](#step-1---unit-testing-dbmanager-with-real-db-by-jest-a)
  - [Step 2 - Unit testing Services with mock db by Jest (B)](#step-2---unit-testing-services-with-mock-db-by-jest-b)
  - [Step 3 - API testing with Mocha and Chai (A+B+C)](#step-3---api-testing-with-mocha-and-chai-abc)
- [Coverage of Scenarios and FR](#coverage-of-scenarios-and-fr)
- [Coverage of Non Functional Requirements](#coverage-of-non-functional-requirements)
  



# Dependency graph 
<img src="./assets/coding/dependency.png" alt="EzWh Dependency graph">
     
# Integration approach

We followed the bottom up integration sequence.
First of all we tested dbManager and Services classes as Unit with Jest.

*For dbManager we used the real database, for Services we used the mock database to remove the dependency on the database.*

Then we did API testing with Mocha and Chai. In this phase we tested also services classes with real interaction with dbManager.

In summary this is the sequence we followed:

1.  STEP 1: Unit testing dbManager with real db by Jest (A)
2.  STEP 2: Unit testing Services with mock db by Jest (B)
3.  STEP 3: API testing with Mocha and Chai (A+B+C), *where C is the route functions*


#  Integration Tests

Jest test cases are in the folder code/server/unit_test
Integration test cases are in the folder code/server/test

### UPDATE Change 1
Tests' implementation have been changed to satisfy change 1. Tests' names and description have been kept the same as before for simplicity.

*The first two steps correspond to unit testing presented in UnitTestReport.md*

## Step 1 - Unit testing dbManager with real db by Jest (A)

The db used for testing is code/server/db/EZWHDB.sqlite

| Classes   | Jest test groups                                    |
| --------- | --------------------------------------------------- |
| DBManager | [DB] restock orders GET functions                   |
|           | [DB] restock orders CREATE UPDATE DELETE functions  |
|           | [DB] restock model return checkers                  |
|           | [DB] return orders functions                        |
|           | [DB] internal orders GET functions                  |
|           | [DB] internal orders CREATE UPDATE DELETE functions |
|           | [DB] test descriptor GET functions                  |
|           | [DB] test descriptor CREATE UPDATE DELETE functions |
|           | [DB] test result GET functions                      |
|           | [DB] test result CREATE UPDATE DELETE functions     |
|           | [DB] user GET functions                             |
|           | [DB] user CREATE UPDATE DELETE functions            |
|           | [DB] position functions                             |
|           | [DB] get occupied capacities of a position          |
|           | [DB] sku functions                                  |
|           | [DB] SkuItems functions                             |
|           | [DB] Items functions                                |
|           | [DB] close db and testing functions                 |


*Single test names are in the UnitTestReport*

## Step 2 - Unit testing Services with mock db by Jest (B)
| Classes               | mock up used                           | Jest test groups                   |
| --------------------- | -------------------------------------- | ---------------------------------- |
| InternalOrderService  | code/server/unit_test/mockDbManager.js | get internal orders                |
|                       | code/server/unit_test/mockDbManager.js | create edit delete internal orders |
|                       | code/server/unit_test/mockDbManager.js | specific internal order errors     |
| RestockOrderService   | code/server/unit_test/mockDbManager.js | get restock orders                 |
|                       | code/server/unit_test/mockDbManager.js | create restock order               |
|                       | code/server/unit_test/mockDbManager.js | update restock order               |
|                       | code/server/unit_test/mockDbManager.js | delete restock order               |
| ReturnOrderService    | code/server/unit_test/mockDbManager.js | get return orders                  |
|                       | code/server/unit_test/mockDbManager.js | create return order                |
|                       | code/server/unit_test/mockDbManager.js | delete return order                |
| TestDescriptorService | code/server/unit_test/mockDbManager.js | get all test descriptors           |
|                       | code/server/unit_test/mockDbManager.js | get test descriptor by id          |
|                       | code/server/unit_test/mockDbManager.js | create test descriptor             |
|                       | code/server/unit_test/mockDbManager.js | update test descriptor             |
|                       | code/server/unit_test/mockDbManager.js | delete test descriptor             |
| TestResultService     | code/server/unit_test/mockDbManager.js | get test results of skuItem        |
|                       | code/server/unit_test/mockDbManager.js | get test result                    |
|                       | code/server/unit_test/mockDbManager.js | create test result                 |
|                       | code/server/unit_test/mockDbManager.js | update test result                 |
|                       | code/server/unit_test/mockDbManager.js | delete test result                 |
| UserService           | code/server/unit_test/mockDbManager.js | get  user info                     |
|                       | code/server/unit_test/mockDbManager.js | get all suppliers                  |
|                       | code/server/unit_test/mockDbManager.js | get all users                      |
|                       | code/server/unit_test/mockDbManager.js | create new user                    |
|                       | code/server/unit_test/mockDbManager.js | login                              |
|                       | code/server/unit_test/mockDbManager.js | logout                             |
|                       | code/server/unit_test/mockDbManager.js | update user rights                 |
|                       | code/server/unit_test/mockDbManager.js | delete user                        |
| SkuService            | code/server/unit_test/mockDbManager.js | get all sku                        |
|                       | code/server/unit_test/mockDbManager.js | get sku by id                      |
|                       | code/server/unit_test/mockDbManager.js | create sku                         |
|                       | code/server/unit_test/mockDbManager.js | update sku                         |
|                       | code/server/unit_test/mockDbManager.js | update sku position                |
|                       | code/server/unit_test/mockDbManager.js | delete sku                         |
|                       | code/server/unit_test/mockDbManager.js | update sku forcing 503             |
| SkuItemService        | code/server/unit_test/mockDbManager.js | get all sku items                  |
|                       | code/server/unit_test/mockDbManager.js | get sku items of skuid             |
|                       | code/server/unit_test/mockDbManager.js | get sku item                       |
|                       | code/server/unit_test/mockDbManager.js | create skuItem                     |
|                       | code/server/unit_test/mockDbManager.js | update skuItem                     |
|                       | code/server/unit_test/mockDbManager.js | delete skuItem                     |
| PositionService       | code/server/unit_test/mockDbManager.js | get all positions                  |
|                       | code/server/unit_test/mockDbManager.js | create position                    |
|                       | code/server/unit_test/mockDbManager.js | update position                    |
|                       | code/server/unit_test/mockDbManager.js | update position id                 |
|                       | code/server/unit_test/mockDbManager.js | delete position                    |
| ItemService           | code/server/unit_test/mockDbManager.js | get all items                      |
|                       | code/server/unit_test/mockDbManager.js | get item by id                     |
|                       | code/server/unit_test/mockDbManager.js | create item                        |
|                       | code/server/unit_test/mockDbManager.js | update item                        |
|                       | code/server/unit_test/mockDbManager.js | delete item                        |


*Single test names are in the UnitTestReport*


## Step 3 - API testing with Mocha and Chai (A+B+C)

   
| Classes        | Mocha Test Suite         |
| -------------- | ------------------------ |
| RestockOrder   | test restock order apis  |
| ReturnOrder    | test return order apis   |
| InternalOrder  | test internal order apis |
| Position       | test position apis       |
| User           | test user apis           |
| Sku            | Sku API tests            |
| SkuItem        | SkuItem API tests        |
| Item           | Item API tests           |
| TestDescriptor | test testDescriptor apis |
| TestResult     | test testResult apis     |


# Coverage of Scenarios and FR


| Scenario ID | Functional Requirements covered | Mocha  Test(s) Suite                                                                                           |
| :---------: | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
|  1 - (UC1)  | FR2                             | Sku API Test                                                                                                   |
|  2 - (UC2)  | FR3.1                           | test position apis                                                                                             |
|  3 - (UC3)  | FR5                             | test restock order apis, test user apis                                                                        |
|  4 - (UC4)  | FR1                             | test user apis                                                                                                 |
|  5 - (UC5)  | FR5.8                           | test restock order apis, SkuItem API tests, test testDescriptor apis, test testResult apis, test position apis |
|  6 - (UC6)  | FR5.9                           | test return order apis, test testResult apis, SkuItem API tests                                                |
|  7 - (UC7)  | FR1.5                           | test user apis                                                                                                 |
|  9 - (UC9)  | FR6.1 -> FR6.6                  | test internal order apis, Sku API Test, test position apis, test user apis                                     |
| 10 - (UC10) | FR6.7 -> 6.10                   | test internal order apis, Sku API Test, test position apis, SkuItem API tests                                  |
| 11 - (UC11) | FR7                             | Item API tests, Sku API Test, test user apis                                                                   |
| 12 - (UC12) | FR3.2                           | test testDescriptor apis, test testResult apis, Sku API Test                                                   |



# Coverage of Non Functional Requirements

| Non Functional Requirement                                                                        | Test suite                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR2 - no function completes in >= 0.5s                                                           | all tests                                                                                                                                                    |
| NFR4                                                                                              | test position apis                                                                                                                                           |
| NFR6                                                                                              | SkuItem API tests                                                                                                                                            |
| NFR9 - Note that date format can be YYYY/MM/DD HH:mm, but in same case (TestResult) is YYYY/MM/DD | SkuItemAPI tests, test internal order api, test restock order api, test return order api, test position api, test testDescription apis, test testResult apis |


