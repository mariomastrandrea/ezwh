
# Requirements Document 
Last-Modified: 3 april 2022
Date: 22 march 2022

Version: 0.3

 
| Version number | Change                          |
| -------------- | :------------------------------ |
| 0.1            | added stakeholders              |
| 0.2            | context diagram, functional req |
| 0.3            | fr, nfr req                     |

# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Requirements Document](#requirements-document)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
  - [Personas](#personas)
  - [Stories](#stories)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
        - [Scenario 1.1](#scenario-11)
        - [Scenario 1.2](#scenario-12)
        - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

Medium companies and retailers need a simple application to manage the relationship with suppliers and the inventory of physical items stocked in a physical warehouse. 
The warehouse is supervised by a manager, who supervises the availability of items. When a certain item is in short supply, the manager issues an order to a supplier. In general the same item can be purchased by many suppliers. The warehouse keeps a list of possible suppliers per item. 

After some time the items ordered to a supplier are received. The items must be quality checked and stored in specific positions in the warehouse. The quality check is performed by specific roles (quality office), who apply specific tests for item (different items are tested differently). Possibly the tests are not made at all, or made randomly on some of the items received. If an item does not pass a quality test it may be rejected and sent back to the supplier. 

Storage of items in the warehouse must take into account the availability of physical space in the warehouse. Further the position of items must be traced to guide later recollection of them.

The warehouse is part of a company. Other organizational units (OU) of the company may ask for items in the warehouse. This is implemented via internal orders, received by the warehouse. Upon reception of an internal order the warehouse must collect the requested item(s), prepare them and deliver them to a pick up area. When the item is collected by the other OU the internal order is completed. 

EZWH (EaSy WareHouse) is a software application to support the management of a warehouse.



# Stakeholders

| Stakeholder name    | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| Company             | Takes business decisions regarding the use of the application       |
| Organizational Unit | Requests internal orders by means of the application                |
| OU executive        | employee of OU who personally request internal orders               |
| Warehouse manager   | Supervises the availability of items and issues orders to suppliers |
| Warehouse worker    | Deals with physical items in the warehouse                          |
| Quality office      | In charge of quality testing on new arrived items                   |
| Supplier            | Provides items to the warehouse                                     |
| Software house      | Develops, updates and maintains the software system                 |
| IT administrator    | Manages daily functioning of the application                        |
| Security manager    | Supervises the security of the system                               |
| DB manager          | In charge of the DBMS                                               |
| DBMS                | DataBase Management System used by the company                      |
| Payment Service     | Manages payments to suppliers                                       |
| Shipping company    | In charge of delivering items                                       |

# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>
![alt text](./assets/context_diagram_1.png)

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor            |   Logical Interface    |               Physical Interface |
| ---------------- | :--------------------: | -------------------------------: |
| WH Manager       |          GUI           |                 Screen, Keyboard |
| WH Worker        | GUI, Scan Item Command | Screen, Buttons, Barcode scanner |
| QO Employee      |          GUI           |                 Screen, Keyboard |
| OU Executive     |          GUI           |                 Screen, Keyboard |
| Security Manager |          GUI           |                 Screen, Keyboard |
| IT Administrator |          GUI           |                 Screen, Keyboard |
| Payment Service  |          Data          |              Internet Connection |
| Company's DBMS   |          Data          |               Network Connection |
| Supplier         |          GUI           |                 Screen, Keyboard |

# Stories and personas
## Personas

* **Al** is a 40 y/o man, he's one of the warehouse workers of the warehouse. [...]. He starts at 7:00 AM and finishes at 5:00 PM. He is married and he has two children.

* **John** is 50 y/o quality office employee, He is very accurate and careful. [...]

* **Jack** is 30 y/o man, he is the warehouse manager of the warehouse. [...]

* **Marisa** is 30 y/o woman, she's the marketing (one of OU) executive of the company. [...]
  
[...]

## Stories
* Al [...]
* John [...]
* Jack [...]
* Marisa [...]
[...]



\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID       |                 Description                  |
| -------- | :------------------------------------------: |
| **FR1**  |                 Manage users                 |
| FR1.1    |                   Add user                   |
| FR1.2    |                  Edit user                   |
| FR1.3    |                 Delete user                  |
| **FR2**  |               Manage suppliers               |
| FR2.1    |                 Add supplier                 |
| FR2.2    |                Edit supplier                 |
| FR2.3    |               Delete supplier                |
| **FR3**  |            Handle external orders            |
| FR3.1    |       Find possible suppliers per item       |
| FR3.2    |          Create order to a supplier          |
| FR3.3    | Notify payment service about the transaction |
| FR3.4    |     Notify supplier about the new order      |
| FR3.5    |         Change external order status         |
| **FR4**  |            Handle delivered items            |
| FR4.1    |       Insert outcome of quality check        |
| FR4.2    | Notify supplier about a failed quality check |
| FR4.3    |      Suggest position for accepted item      |
| **FR5**  |                  Show items                  |
| FR5.1    |                  Show by id                  |
| FR5.2    |               Show by features               |
| **FR6**  |                Authentication                |
| FR6.1    |                    Login                     |
| FR6.2    |                    Logout                    |
| FR6.3    |               Recover password               |
| FR6.4    |               Change password                |
| **FR7**  |          Manage catalogue of items           |
| FR7.1    |                   Add item                   |
| FR7.2    |                  Edit item                   |
| FR7.3    |                 Delete item                  |
| **FR8**  |          Manage warehouse structure          |
| FR8.1    |           Add new warehouse space            |
| FR8.2    |             Edit warehouse space             |
| FR8.3    |            Delete warehouse space            |
| **FR9**  |          Manage physical inventory           |
| FR9.1    |            Search for item by ID             |
| FR9.2    |         Search for items by features         |
| FR9.3    |        Visualize warehouse inventory         |
| FR9.4    |    Check for available space in warehouse    |
| FR9.5    |         Place new item in a position         |
| FR9.6    |            Change item's position            |
| FR9.7    |          Remove item from position           |
| **FR10** |        Monitor items in short supply         |
| **FR11** |           Identify item by barcode           |
| **FR12** |             Show orders history              |
| FR12.1   |         Show internal orders history         |
| FR12.2   |         Show external orders history         |
| **FR13** |     Place an internal order to warehouse     |
| **FR14** |            Manage internal orders            |
| FR14.1   |         Change internal order status         |
| FR14.2   |          Show items in pickup area           |


## Non Functional Requirements


\<Describe constraints on functional requirements>

| ID   | Type (efficiency, reliability, ..) |                            Description                            |   Refers to |
| ---- | :--------------------------------: | :---------------------------------------------------------------: | ----------: |
| NFR1 |            reliability             |                 availability at least 80% of time                 |     All FRs |
| NFR2 |              security              |   System must provide safe password to access employees' pages    |         FR7 |
| NFR3 |              security              |                System must follow GDPR guidelines                 | FR1,FR2,FR7 |
| NFR4 |             usability              | Employee must be able to use the system after 2 hours of training |     All FRs |
| NFR5 |                size                |                manage a maximum of 2000 item types                |             |
| NFR6 |                size                |                 manage a maximum of 200 employees                 |     FR1,FR7 |
| NFR7 |             efficiency             |            response time to any button pressed <2 sec             |     All FRs |
| NFR8 |             efficiency             |            System must support 100 simultaneous users             |     All FRs |

# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1
| Actors Involved  |                                                                      |
| ---------------- | :------------------------------------------------------------------: |
| Precondition     | \<Boolean expression, must evaluate to true before the UC can start> |
| Post condition   |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
| Variants         |                      \<other normal executions>                      |
| Exceptions       |                        \<exceptions, errors >                        |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1   |                                                                            |
| -------------- | :------------------------------------------------------------------------: |
| Precondition   | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
| Step#          |                                Description                                 |
| 1              |                                                                            |
| 2              |                                                                            |
| ...            |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>
![alt text](./assets/system_diagram_0.png)
# Deployment Diagram 

\<describe here deployment diagram >
![alt text](./assets/deployment_diagram_0.png)



