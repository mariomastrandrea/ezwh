# Graphical User Interface Prototype  

Authors: Samuele Lo Truglio, Mario Mastrandrea, Kristi Gjerko, Alessandro Migliardi

Date: 07/04/2022

Version: 0.1

\<Report here the GUI that you propose. You are free to organize it as you prefer. A suggested presentation matches the Use cases and scenarios defined in the Requirement document. The GUI can be shown as a sequence of graphical files (jpg, png)  >

## Contents
- [Graphical User Interface Prototype](#graphical-user-interface-prototype)
  - [Contents](#contents)
    - [How to read](#how-to-read)
  - [Autenthication](#autenthication)
    - [Login](#login)
  - [Admin / Manager View](#admin--manager-view)
    - [Homepage](#homepage)
    - [Manage Users](#manage-users)
    - [Manage Suppliers](#manage-suppliers)
    - [Manage Inventory](#manage-inventory)
    - [Manage Catalogue](#manage-catalogue)
    - [Manage Warehouse Structure](#manage-warehouse-structure)
    - [External Orders](#external-orders)
    - [Internal Orders](#internal-orders)
  - [Quality Office View](#quality-office-view)
    - [Homepage](#homepage-1)
  - [OU View](#ou-view)
    - [Homepage](#homepage-2)
    - [Orders List](#orders-list)
    - [New Order](#new-order)
  - [WH Worker View](#wh-worker-view)
    - [Homepage](#homepage-3)
    - [Scan Item](#scan-item)
    - [Move Item](#move-item)

### How to read
The GUI is composed of five main parts and a few sub-parts. The purpose of these parts is to provide a clear way to navigate the system. 

## Autenthication
### Login
![login](./assets/gui/auth/login.png)
Recover password
![recovery](./assets/gui/auth/login_recovery.png)
## Admin / Manager View
### Homepage
![homepage](./assets/gui/it/it-homepage.png)
### Manage Users
![manage_users](./assets/gui/it/it-manage_users.png)
Edit/Add User (template is the same)
![edit_user](./assets/gui/it/it-edit_add_user.png)
### Manage Suppliers
![manage_suppliers](./assets/gui/it/it-manage_suppliers.png)
Edit/Add Supplier (template is the same)
![edit_user](./assets/gui/it/it-edit_add_supplier.png)
### Manage Inventory
![manage_inventory](./assets/gui/it/it-manage_inventory.png)
### Manage Catalogue
![manage_catalogue](./assets/gui/it/it-manage_catalogue.png)
Edit/Add Item (template is the same)
![edit_item](./assets/gui/it/it-edit_add_catalogue_item.png)
### Manage Warehouse Structure
![manage_warehouse](./assets/gui/it/it-structure_list.png)
![structure_onhover](./assets/gui/it/it-structure_on_hover.png)
Add Structure Space
![add_structure](./assets/gui/it/it-edit_add_structure_space.png)
Edit Structure Space
![edit_structure](./assets/gui/it/it-edit_structure_space.png)
### External Orders
![external_orders](./assets/gui/it/it-ext_order_list.png)
Place new order
![new_order](./assets/gui/it/it-ext_order_new.png)
### Internal Orders
![internal_orders](./assets/gui/it/it-int_order_list.png)
## Quality Office View
### Homepage
![qo_homepage](./assets/gui/qo/qo-homepage.png)
After click on a order
![qo_homepage_selection](./assets/gui/qo/qo-homepage_selection.png)
Outcome
![qo_outcome](./assets/gui/qo/qo-report.png)
## OU View
### Homepage
![ou_homepage](./assets/gui/ou/ou-homepage.png)
### Orders List
![ou_order_list](./assets/gui/ou/ou-int_order_list.png)
### New Order
![ou_new_order](./assets/gui/ou/ou-int_order_new.png)
Order basket
![ou_order_basket](./assets/gui/ou/ou-int_order_basket.png)
## WH Worker View
### Homepage
![wh_homepage](./assets/gui/whw/whw-homepage.png)
### Scan Item
![wh_scan_item](./assets/gui/whw/whw-scan_item.png)
### Move Item
After scanning you see where to put the item
![wh_move_item](./assets/gui/whw/whw-identified_item.png)
Edit final position of item
![wh_move_item_custom](./assets/gui/whw/whw-identified_item_edit_space.png)
Move to pickup area for ou orders
![wh_move_to_pickup](./assets/gui/whw/whw-identified_pickup.png)
