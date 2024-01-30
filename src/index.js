import { db, getOrderById, getOrdersByCustomerId, getProducts, createNewOrder } from './db.js';
import { reply } from './utils.js';
import 'dotenv/config'

const debugStatus = process.argv[2] === 'debug' ? true : false;

// Setup LLM client
import { OpenAI, SPrompt, OpenAIBestModelOptions, Memory } from 'llmclient';
const mem = new Memory();
const conf = OpenAIBestModelOptions();

const ai = new OpenAI(process.env.OPENAI_APIKEY, conf);

const resultSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'response message for the sender',
    },
    endConversation: {
      type: 'boolean',
      description: 'Indicates whether the conversation should end',
    },    
  },
};

// List of functions available to the AI
const functions = [
  {
    name: 'getOrdersByCustomerId',
    description: 'Get detailed information about orders placed by a customer based on their `customer_id`',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'integer',
          description: 'The Customer ID value for the customer in the database',
        },
      },
      required: ['customerId']
    },
    func: getOrdersByCustomerId,
  },
  {
    name: 'getOrderById',
    description: 'Get detailed information about an Order by its order_id',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'integer',
          description: 'The Order ID value for the order in the database'
        }
      },
      required: ['orderId']
    },
    func: getOrderById,
  },
  {
    name: 'getProducts',
    description: 'Get details about products, the available stock and the price of the product.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'a query term',
        },
      },
      required: ['query']
    },
    func: getProducts,
  },
  {
    name: 'reply',
    description: 'Respond to the customers query.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The response to send to the customer',
        },
      },
      required: ['message']
    },
    func: reply,
  },
  {
    name: 'createNewOrder',
    description: 'Create a new order for a customer.',
    inputSchema: {
      type: 'object',
      description: 'The order details',
      properties: {
        customerId: { 
          type: 'integer',
          description: 'The Customer ID value for the customer',
        },
        productId: {
          type: 'integer',
          description: 'The Product ID value of the product'
        },
        quantity: { 
          type: 'integer',
          description: 'The quantity of the product that the customer wishes to order'
        },
        unitPrice: { 
          type: 'number',
          description: 'The price of a single quantity of the product'
        },
      },
      required: ['customerId', 'productId', 'quantity', 'unitPrice']
    },
    func: createNewOrder,
  }
];

const prompt = new SPrompt(resultSchema, functions);
prompt.setDebug(debugStatus);

// Handle a conversation from a customer
async function handleConversation(customerId) {
  const promptText = `
  You are a helpful customer support agent for an ecommerce company. 
  You are helping a customer with their enquiry. 
  The customers ID in our database is ${customerId}.

  Check that the product is in stock. If it is not in stock, inform the customer.

  IMPORTANT instructions before placing an order!
  1. Before placing an order for a product, please
      - Check the price of the product and inform the customer of the price.
      - Read back to the customer your understanding of their order, including the product and its description
      - the quantity that they wish to purchase
      - the total price of the order
    
  2. Obtain consent from the customer that they want to go ahead and place the order.
  
  3. DO NOT place an order if the above steps are not completed.


  Before closing the conversation, ask if there is anything else you can help with. Set 'endConversation' to 'true' when the conversation is complete.
  Here is the conversation so far:

  Hello!
  ${mem.history('2736')}
  `;

  // Use the LLM client to generate a response
  try {
    const response = await prompt.generate(ai, promptText, { memory: mem, sessionId: '2736' });
    let aiResponse = response.value();
    return aiResponse;
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

//// Main function ////
const main = async (customerId) => {
  let aiResponse = await handleConversation(customerId);

  // If the AI's response includes the endConversation property, end chat
  if (aiResponse.endConversation) {
    console.log(`AI: ${JSON.stringify(aiResponse)}`)
    process.exit(0);
  }

  // let content = JSON.parse(aiMessage).message;
  console.log(`AI: ${JSON.stringify(aiResponse)}`)

  // Continue the conversation
  main(customerId);
}

// once db loads, run main function
db.on('open', () => {
  let customerId = 1;

  main(customerId)
    .catch(err => {
      console.log("An AI Error occured:", err.message)
  });
});