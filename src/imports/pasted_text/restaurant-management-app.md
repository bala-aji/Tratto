Restaurant Management System (Multi-Role App)

Build a full-featured Restaurant Management Application using Oh My OpenCode with the skill:

npx oh-my-opencode --skill frontend-ui-ux

The system must support three user roles:

Cashier

Admin

Supplier

Design the app with responsive UI/UX optimized for:

Desktop (Restaurant admin office)

Tablet (Kitchen / counter)

Mobile (Suppliers and quick management)

Use modern dashboard UI patterns, component-based architecture, and clean responsive layouts.

App Overview

The application manages:

Orders

Billing

Inventory

Supplier management

Purchase orders

Sales analytics

Staff operations

The UI must be fast, minimal, and POS-friendly.

1. Cashier View (POS System)

Primary device: Tablet / Touch screen

Features

1. Order Management

Create new order

Table selection

Add menu items

Quantity control

Special instructions

Order status (Preparing / Ready / Served)

2. Billing

Automatic bill calculation

Taxes + service charge

Discount system

Split bills

Payment methods

Cash

Card

UPI

QR

3. Receipt

Print receipt

Send digital receipt (WhatsApp / SMS)

4. Quick Menu UI

POS style grid layout:

+-----------------------------+
| Burgers | Pizza | Drinks |
| Desserts | Combos | More |
+-----------------------------+

Each item card includes:

Image

Price

Quick add button

5. Order Timeline

Shows:

Active Orders
Preparing
Ready
Completed
2. Admin View (Restaurant Control Panel)

Primary device: Desktop

Dashboard

Key metrics:

Daily Sales

Orders Count

Popular Dishes

Low Stock Alerts

Supplier Deliveries

Display using:

charts

tables

KPI cards

Menu Management

Admin can:

Add menu item

Edit item

Upload image

Set price

Enable/disable item

Add categories

Example categories:

Breakfast

Lunch

Dinner

Drinks

Desserts

Inventory Management

Track ingredients:

Example:

Tomato
Cheese
Chicken
Bread
Sauce

Each ingredient contains:

Current stock

Minimum threshold

Supplier

Last purchase

Low stock alert system.

Supplier Management

Admin can:

Add supplier

Assign ingredient supplier

Track orders

Supplier details:

Name
Contact
Products supplied
Delivery schedule
Payment terms
Purchase Orders

Create purchase order:

Supplier
Ingredient list
Quantity
Expected delivery date

Track status:

Requested
Confirmed
Shipped
Delivered
Reports

Generate reports:

Daily sales

Weekly sales

Monthly revenue

Item performance

Inventory usage

Export options:

PDF
CSV
Excel
3. Supplier View (Vendor Portal)

Primary device: Mobile

Suppliers log in and see:

Dashboard

Shows:

New purchase orders

Pending deliveries

Payment status

Orders from Restaurant

Supplier receives order:

Restaurant: ABC Kitchen
Items:
- 10kg Tomato
- 5kg Cheese
- 20kg Chicken

Actions:

Accept Order
Reject Order
Confirm Shipment
Mark Delivered
Delivery Management

Supplier updates:

Dispatch date

Delivery tracking

Delivery confirmation

Invoice Management

Supplier uploads invoice.

Admin receives and approves.

UI/UX Design Requirements

Use modern SaaS dashboard UI.

Design System

Colors:

Primary: #FF6B35 (Restaurant Orange)
Secondary: #2E3A59
Accent: #22C55E
Background: #F8FAFC

Typography:

Headings: Inter SemiBold
Body: Inter Regular
Responsive Layout Rules
Desktop

3-column dashboard layout.

Sidebar navigation.

Sidebar | Main Content | Analytics Panel
Tablet

Two panel layout.

Menu Panel | Order Panel

Optimized for touch interactions.

Mobile

Bottom navigation:

Home
Orders
Inventory
Suppliers
Settings
Component System

Create reusable components:

Button
Card
Modal
Dropdown
Table
Form
Tabs
Charts
Notification
UI Screens to Generate

Generate these screens:

Cashier

POS interface

Table selection

Order summary

Payment screen

Receipt preview

Admin

Dashboard

Menu editor

Inventory management

Supplier management

Purchase order creator

Reports page

Supplier

Mobile dashboard

Order details

Delivery update

Invoice upload

Interaction Design

Include:

Smooth transitions

Real-time order updates

Toast notifications

Confirmation dialogs

Data Structure Example

Menu Item

{
  id
  name
  price
  category
  image
  availability
}

Order

{
  order_id
  table_number
  items[]
  total_price
  status
  payment_method
}

Inventory Item

{
  ingredient
  stock_quantity
  supplier_id
  threshold
}
Deliverables

Generate:

Complete UI layouts

Responsive components

POS optimized cashier interface

Admin analytics dashboard

Supplier mobile portal