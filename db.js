// Create a new instance of AJV
import Ajv from 'ajv';
const ajv = new Ajv();

const ordersSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      order_id: { type: "number" },
      customer_id: { type: "number" },
      product_id: { type: "number" },
      quantity: { type: "number" },
      order_date: { type: "string" },
      status: { type: "string" }
    },
    required: ["order_id", "customer_id", "product_id", "quantity", "order_date", "status"],
    additionalProperties: false
  }
};

const productsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      product_id: { type: "number" },
      product_name: { type: "string" },
      product_description: { type: "string" },
      price: { type: "number" },
      stock: { type: "number" }
    },
    required: ["product_id", "product_name", "product_description", "price", "stock"],
    additionalProperties: false
  }
};

// Compile your schemas into validation functions
const validateOrders = ajv.compile(ordersSchema);
const validateProducts = ajv.compile(productsSchema);

// Setup database connection
import sqlite3 from 'sqlite3';
let db = new sqlite3.Database('./ecommerce.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the ecommerce database.');
});

// Setup functions
async function getOrdersByCustomerId(customerId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Orders WHERE customer_id = ?';
    db.all(sql, [customerId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Validate the data
        if (!validateOrders(rows)) {
          // If the data is invalid, reject the promise with the validation errors
          console.error('Validation errors:', validateOrders.errors);
          reject(validateOrders.errors);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

async function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Orders WHERE order_id = ?';
    db.all(sql, [orderId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Validate the data
        if (!validateOrders(rows)) {
          // If the data is invalid, reject the promise with the validation errors
          console.error('Validation errors:', validateOrders.errors);
          reject(validateOrders.errors);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

async function getProducts(query) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Products';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Validate the data
        if (!validateProducts(rows)) {
          // If the data is invalid, reject the promise with the validation errors
          reject(validateProducts.errors);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

export { db, getOrdersByCustomerId, getOrderById, getProducts };