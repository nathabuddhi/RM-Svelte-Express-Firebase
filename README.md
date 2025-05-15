
# Svelte + Express.js + Firebase Tasks

## 1. Project Initialization
**Prompt**:  
I am a Software Engineer currently working on an web-based e-commerce project. The technology stack for this project is Vite Svelte for the Front-end, Express.js for the Backend, and Firebase as the database. Provide the project initialization steps according to the chosen technology stack.

## 2. Task 1: User Authentication
**Prompt**:  
I am currently working on the Authentication part of my project.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Firebase Auth for login/register
- Firestore `Users` document (email + role)
- Two pages: Register and Login
- Role-based redirect and validation
- Error handling for login/register

## 3. Task 2: Product Management
**Prompt**:  
I am currently working on the Product Management part of my project.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Firestore structure: user sub-document `Products`
  - `ProductId`, `ProductName`, `ProductDescription`, `ProductImages`, `ProductPrice`, `ProductStock`
- Unique UUID for product IDs
- Single seller page: View, Edit, Delete, Create
- Success/error message display

## 4. Task 3: Product Search
**Prompt**:  
I am currently working on the Product Search part of my project.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Server-side search (no front-end filtering)
- Display products with full info (truncate long description)
- Navigate to product detail page
- Error message on no matches

## 5. Task 4: Shopping Cart System
**Prompt**:  
I am currently working on the Shopping Cart part of my project.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Firestore sub-document: `Cart` within user's document
  - `ProductId`, `Quantity`
- View cart, modify quantity, remove items
- Checkout all items
- Show error/success messages

## 6. Task 5: Checkout System
**Prompt**:  
I am currently working on the Checkout part of my project.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Firestore root collection: `Orders`
  - `OrderId`, `ProductId`, `Quantity`, `Customer`, `Status`, `Timestamp`
- Input: payment method, shipping address
- Error message on failure

## 7. Task 6: Order Management
**Prompt**:  
With the Checkout System implemented, make one final page for both sellers and customers to be able to view orders.

**Requirements**:
- Svelte (Typescript + SCSS)
- Express.js
- Seller tabs: Pending, Accepted, Shipped/Completed
- Customer list: sorted by timestamp
- Statuses: Pending, Accepted, Shipped, Completed
- Customers can mark as â€œreceivedâ€
