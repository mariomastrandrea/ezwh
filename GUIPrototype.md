# Graphical User Interface Prototype  
Authors: Samuele Lo Truglio, Mario Mastrandrea, Kristi Gjerko

Last Update: 12/04/2022


Date: 10/04/2022

Version: 1.0


## Contents
- [Graphical User Interface Prototype](#graphical-user-interface-prototype)
  - [Contents](#contents)
    - [How to read](#how-to-read)
  - [Shared Interfaces](#shared-interfaces)
    - [Login](#login)
      - [Recover password](#recover-password)
      - [My profile](#my-profile)
      - [My profile edit](#my-profile-edit)
  - [IT Admin / Manager View](#it-admin--manager-view)
    - [Homepage](#homepage)
    - [Manage Users](#manage-users)
      - [Edit/Add User (template is the same)](#editadd-user-template-is-the-same)
    - [Manage Suppliers](#manage-suppliers)
      - [Edit/Add Supplier (template is the same)](#editadd-supplier-template-is-the-same)
    - [Manage Inventory](#manage-inventory)
    - [Manage Catalogue](#manage-catalogue)
      - [Edit/Add Item (template is the same)](#editadd-item-template-is-the-same)
    - [Manage Warehouse Structure](#manage-warehouse-structure)
      - [WH Spaces - map view](#wh-spaces---map-view)
        - [WH Spaces - list view](#wh-spaces---list-view)
      - [WH Spaces - edit view](#wh-spaces---edit-view)
      - [Add Structure Space](#add-structure-space)
      - [Edit Structure Space](#edit-structure-space)
    - [External Orders](#external-orders)
      - [Place new order](#place-new-order)
    - [Internal Orders](#internal-orders)
  - [Quality Office View](#quality-office-view)
    - [Homepage](#homepage-1)
      - [After click on a order](#after-click-on-a-order)
      - [Outcome](#outcome)
  - [OU View](#ou-view)
    - [Homepage](#homepage-2)
    - [Orders List](#orders-list)
    - [New Order](#new-order)
      - [Order basket](#order-basket)
  - [WH Worker View](#wh-worker-view)
    - [Homepage](#homepage-3)
    - [Scan Item](#scan-item)
    - [Move Item](#move-item)
      - [Edit final position of item](#edit-final-position-of-item)
      - [Move to pickup area for ou orders](#move-to-pickup-area-for-ou-orders)
  - [Notes](#notes)

### How to read
The GUI is composed of five main parts and a few sub-parts. The purpose of these parts is to provide a clear way to navigate the system. 


## Shared Interfaces
Interfaces shared between different users

### Login
![login](./assets/gui/all/login.png)

#### Recover password
![recovery](./assets/gui/all/login_recovery.png)

#### My profile
![profile](./assets/gui/all/all-myprofile.png)

#### My profile edit
![profile edit](./assets/gui/all/all-myprofile_change_password.png)

## IT Admin / Manager View
### Homepage
![homepage](./assets/gui/it/it-homepage.png)


*In WH Manager homepage there aren't CRUD options*
### Manage Users
![manage_users](./assets/gui/it/it-manage_users.png)

#### Edit/Add User (template is the same)


![edit_user](./assets/gui/it/it-edit_add_user.png)

### Manage Suppliers
![manage_suppliers](./assets/gui/it/it-manage_suppliers.png)

#### Edit/Add Supplier (template is the same)
![edit_user](./assets/gui/it/it-edit_add_supplier.png)

### Manage Inventory
![manage_inventory](./assets/gui/it/it-manage_inventory.png)

### Manage Catalogue
![manage_catalogue](./assets/gui/it/it-manage_catalogue.png)
![manage_catalogue_popup](assets/gui/it/it-manage_catalogue_popup_suppliers.png)

#### Edit/Add Item (template is the same)
![edit_item](./assets/gui/it/it-edit_add_catalogue_item.png)

### Manage Warehouse Structure
#### WH Spaces - map view
![manage_warehouse_map](./assets/gui/it/it-structure.png)


![structure_on_hover](./assets/gui/it/it-structure_on_hover.png)

##### WH Spaces - list view
![manage_warehouse](./assets/gui/it/it-structure_list.png)

#### WH Spaces - edit view
![structure_edit](./assets/gui/it/it-structure_edit.png)


*Delete icon become clickable only if there are no items inside (0 busy slots)*


#### Add Structure Space
![add_structure](./assets/gui/it/it-edit_add_structure_space.png)

*You can decide to not make active a space on adding. This feature could be useful in case of you first create a space on the software and then you let the physical space ready to store items*

*Different look for already assigned spaces on virtual map*

#### Edit Structure Space
![edit_structure](./assets/gui/it/it-edit_structure_space.png)


*When you edit the position of an existing space you can see his position and other already assigned spaces*

### External Orders
![external_orders](./assets/gui/it/it-ext_order_list.png)

#### Place new order
![new_order](./assets/gui/it/it-ext_order_new.png)

*You can see maximum quantity that you can order*

### Internal Orders
![internal_orders](./assets/gui/it/it-int_order_list.png)


## Quality Office View

### Homepage
![qo_homepage](./assets/gui/qo/qo-homepage.png)


#### After click on a order
![qo_homepage_selection](./assets/gui/qo/qo-homepage_selection.png)


#### Outcome
![qo_outcome](./assets/gui/qo/qo-report.png)


## OU View

### Homepage
![ou_homepage](./assets/gui/ou/ou-homepage.png)

### Orders List
![ou_order_list](./assets/gui/ou/ou-int_order_list.png)

### New Order
![ou_new_order](./assets/gui/ou/ou-int_order_new.png)


#### Order basket
![ou_order_basket](./assets/gui/ou/ou-int_order_basket.png)


## WH Worker View
These interfaces have big buttons to facilitate warehouse workers actions due to touchscreen sensibility of common tablets.

### Homepage
![wh_homepage](./assets/gui/whw/whw-homepage.png)

### Scan Item
![wh_scan_item](./assets/gui/whw/whw-scan_item.png)

### Move Item
After scanning you see where to put the item

![wh_move_item](./assets/gui/whw/whw-identified_item.png)

*In some circumstances the suggested final space can be unexpectedly unavailable, so the warehouse worker is able to edit this information*

#### Edit final position of item
![wh_move_item_custom](./assets/gui/whw/whw-identified_item_edit_space.png)

#### Move to pickup area for ou orders
![wh_move_to_pickup](./assets/gui/whw/whw-identified_pickup.png)

## Notes
In our system all users will use the software on a PC, except for the Warehouse Worker.
