-- Create the Products table
CREATE TABLE Products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT NOT NULL,
    product_description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
);

-- Insert data into the Products table
INSERT INTO Products (product_id, product_name, product_description, price, stock) VALUES
(1, 'Apple iPhone 13', 'Latest Apple iPhone 13 with 128GB storage', 699.99, 100),
(2, 'Samsung Galaxy S21', 'Samsung Galaxy S21 with 128GB storage', 799.99, 50),
(3, 'Google Pixel 6', 'Google Pixel 6 with 128GB storage', 599.99, 75),
(4, 'Apple MacBook Pro', 'Apple MacBook Pro with M1 chip', 1299.99, 80),
(5, 'Dell XPS 15', 'Dell XPS 15 with Intel i7 processor', 1499.99, 70),
(6, 'Sony WH-1000XM4', 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones', 349.99, 120);

-- Create the Customers table
CREATE TABLE Customers (
    customer_id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL
);

-- Insert data into the Customers table
INSERT INTO Customers (customer_id, first_name, last_name, email, address) VALUES
(1, 'John', 'Doe', 'johndoe@example.com', '123 Main St, Anytown, USA'),
(2, 'Jane', 'Smith', 'janesmith@example.com', '456 Maple Ave, Anytown, USA');

-- Create the Orders table
CREATE TABLE Orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    order_date DATE NOT NULL,
    status TEXT,
    FOREIGN KEY (customer_id) REFERENCES Customers (customer_id),
    FOREIGN KEY (product_id) REFERENCES Products (product_id)
);

-- Insert data into the Orders table
INSERT INTO Orders (order_id, customer_id, product_id, quantity, order_date, status) VALUES
(1, 1, 2, 1, '2023-07-19', 'Shipped'),
(2, 2, 3, 2, '2023-07-20', 'Shipped'),
(3, 1, 4, 1, '2023-07-21', 'Shipped'),
(4, 1, 6, 2, '2023-07-22', 'In progress'),
(5, 2, 5, 1, '2023-07-23', 'In progress'),
(6, 2, 1, 1, '2023-07-24', 'Delivered');
