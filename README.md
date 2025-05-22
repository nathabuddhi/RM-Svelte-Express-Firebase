# Svelte With Express.js and Firebase Project Prompts

## a. General Prompts

### i. Project Initialization
I am a Software Engineer currently working on an web-based e-commerce project. The technology stack for this project is Vite Svelte for the Front-end, Express.js for the Backend, and Firebase as the database. Provide the project initialization steps according to the chosen technology stack.

## b. Prompt for Task 1: User Authentication

### i. Authentication
I am currently working on the Authentication part of my project. Write code to make a login and register functionality in both front-end and back-end so that this functionality is fully implemented. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. Use firebase authentication to store and check user authentications. Store a separate document using firestore called ‘Users’ to store their email and role.
3. When registering, users can choose whether to be a customer or a seller. The same email cannot be used for different roles. Store their role in another column ‘Role’ which is either ‘Customer’ or ‘Seller’.
4. You need to make 2 pages on the front-end side. One page for registration, and the other for logging in.
5. Show an error message when failing to login/register. Upon logging in, redirect the user to the appropriate page according to their role.

## c. Prompt for Task 2: Product Management

### i. Product Management
I am currently working on the Product Management part of my project. This feature will allow sellers to manage their products that they sell. Write code to make implement this functionality in the project. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. Use Firebase for the database to store product data with the document name ‘Products. Use sub-document within the user (seller) to store all their product information. The attributes needed is as follows:  
   a. ProductId.  
   b. ProductName.  
   c. ProductDescription.  
   d. ProductImages (you are free to choose how to implement product images) Using firebase storage is not available.  
   e. ProductPrice (dollar format).  
   f. ProductStock.
3. Make sure that the ID generation is unique and follows a UUID format.
4. This feature is only for the seller side. You only need to make one page to view existing products (based on the currently logged-in seller), edit or delete existing products, and create a new product.
5. Show an error or success message accordingly.

## d. Prompt for Task 3: Product Search

### i. Product Search
I am currently working on the Product Search part of my project. This feature will allow customers to view all available products that has a stock of more than 0, along with searching products based on product name. Write code to make implement this functionality in the project. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. Make sure that the search functionality fetches data from the database, not front-end filtering.
3. The page should display full product details including name, description (truncated if too long), price, pictures, and stock.
4. Show an error message if there are no products that matches the searched keyword.
5. A user can click on a product box and will be redirected to the appropriate product page, where users can view full details and add the product to their cart.

## e. Prompt for Task 4: Shopping Cart System

### i. Shopping Cart
I am currently working on the Shopping Cart part of my project. This feature will allow customers to add or remove products to or from their cart. Write code to make implement this functionality in the project. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. Users can view their cart page which will show all the products in their cart. Users can adjust the quantity between 1 and the product’s stock, along with a button to remove the item from their cart.
3. Store the following data in a sub-document within the user’s document with the name ‘Cart’. Store the following attributes:  
   a. ProductId.  
   b. Quantity.
4. Users can click checkout from within this page. Checking out will checkout the whole cart without any option to choose products. Details will be in the next task.
5. Show an error or success message accordingly.

## f. Prompt for Task 5: Checkout System

### i. Checkout
I am currently working on the Checkout part of my project. This feature will allow customers to submit orders based on their cart. Write code to make implement this functionality in the project. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. You only need to create a basic checkout system, which submits orders to stores and only requires to select a payment method (without verification) and shipping address (text) before checkouting their cart. The button will be displayed in the cart page as previously mentioned.
3. The checkout system does not need to be unique between different sellers.
4. Upon successful checkout, submit their orders into the document “Orders” within the root of firestore. Here are the details:  
   a. OrderId. which also uses UUID format.  
   b. ProductId.  
   c. Quantity.  
   d. Status  
   e. Customer (Email).  
   f. Timestamp.
5. Show an error message when an error happens, such as item no longer in stock, no items selected, etc.

## g. Prompt for Task 6: Order Management

### i. Order Management
With the Checkout System implemented, make one final page for both sellers and customers to be able to view orders. Sellers are able to view their orders and also accept and ship orders. Customers can view all their orders and their statuses. Here are a set of ground rules you must follow:

1. Write code in the appropriate languages according to the project’s technology stack, which is Svelte and Express.js. The Svelte project will use typescript and external scss.
2. For sellers, the orders will be shown in 3 different tabs, the first tab will be for pending orders, second tab for accepted orders, and lastly shipped/completed orders.
3. For customers, display all orders sorted by timestamp.
4. Orders will have 4 statuses, according to the order status:  
   a. Pending: Order submitted by customer.  
   b. Accepted: Order approved by seller.  
   c. Shipped: Order shipped by seller.  
   d. Completed: Order received by customer.
5. Customers can confirm order shipment by pressing “received” on their orders. This button is only clickable if the order is already ‘Shipped’.
