import { db, getOrderById, getOrdersByCustomerId, getProducts, createNewOrder } from './db.js';
import { askQuestion } from './utils.js';
import 'dotenv/config'

const debugStatus = process.argv[2] === 'debug' ? true : false;

// Setup LLM client
import { OpenAI, SPrompt, OpenAIGenerateModel, OpenAIDefaultOptions, Memory } from '@dosco/llm-client';
const mem = new Memory();
const conf = OpenAIDefaultOptions();
conf.model = OpenAIGenerateModel.GPT35Turbo16K;

const ai = new OpenAI(process.env.OPENAI_APIKEY, conf);

const responseSchema = {
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
    description: 'Get detailed information about orders placed by a customer based on their customer_id',
    inputSchema: {
      type: 'integer',
      description: 'The Customer ID',
    },
    func: getOrdersByCustomerId,
  },
  {
    name: 'getOrderById',
    description: 'Get detailed information about an Order by its order_id',
    inputSchema: {
      type: 'integer',
      description: 'The Order ID',
    },
    func: getOrderById,
  },
  {
    name: 'getProducts',
    description: 'Get product details, price and available stock.',
    inputSchema: {
      type: 'string',
      description: 'a query term',
    },
    func: getProducts,
  },
  {
    name: 'askQuestion',
    description: 'Ask a question to the customer or clarify something.',
    inputSchema: {
      type: 'string',
      description: 'The question to ask',
    },
    func: askQuestion,
  },
  {
    name: 'createNewOrder',
    description: 'Create a new order for a customer.',
    inputSchema: {
      type: 'object',
      description: 'The order details',
      properties: {
        customerId: { type: 'number' },
        productId: { type: 'number' },
        quantity: { type: 'number' }
      },
      required: ['customerId', 'productId', 'quantity']
    },
    func: createNewOrder,
  }
];

const prompt = new SPrompt(responseSchema, functions);
prompt.setDebug(debugStatus);

// Handle a conversation from a customer
async function handleConversation(customerId) {
  let aiMessage = '';
  const promptText = `
  You are a helpful customer support agent for an ecommerce company. 
  You are helping a customer with their questions. 
  The customers ID in our database is ${customerId}.
  Introduce yourself and ask how you can help the customer.
  Ask any clarifying questions if required.
  Set 'endConversation' to 'true' when the conversation is complete.
  Here is the conversation so far:

  ${mem.history()}
  `;

  // Use the LLM client to generate a response
  try {
    const response = await prompt.generate(ai, promptText, { memory: mem });
    aiMessage = response.values[0].text;
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
  return aiMessage;
}

//// Main function ////
const main = async (customerId) => {
  let aiMessage = await handleConversation(customerId);
  let content = JSON.parse(aiMessage).message;
  console.log(`AI: ${content}`)
  // If the AI's response includes the endConversation property, end chat
  if (aiMessage.endConversation) {
    process.exit(0);
  }
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