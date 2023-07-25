import { db, getOrderById, getOrdersByCustomerId, getProducts } from './db.js';
import 'dotenv/config'

// Setup LLM client
import { OpenAI, SPrompt, OpenAIGenerateModel, OpenAIDefaultOptions, Memory } from '@dosco/llm-client';
const mem = new Memory();
const conf = OpenAIDefaultOptions();
conf.model = OpenAIGenerateModel.GPT35Turbo16K;
console.log(conf);

const ai = new OpenAI(process.env.OPENAI_APIKEY, conf);

const responseSchema = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'response message for the sender',
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
      description: 'a search query term',
    },
    func: getProducts,
  }  
];

const prompt = new SPrompt(responseSchema, functions);
prompt.setDebug(false);

// Handle a conversation from a customer
async function handleConversation(customerId, conversation) {
  let conversationHistory = '';

  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    conversationHistory += `\n${message.role}: ${message.content}`;

    if (message.role === 'ai') {
      const promptText = `
      You are a helpful customer support agent for an ecommerce company. 
      You are helping a customer with their questions. 
      The customers ID in our database is ${customerId}.
      Ask any clarifying questions if required.
      Here is the conversation so far:

      ${conversationHistory}
      `;

      // Use the LLM client to generate a response
      const response = await prompt.generate(ai, promptText, { memory: mem });
      const aiMessage = response.values[0].text;

      // Add the AI's response to the conversation history
      conversationHistory += `\nAI: ${JSON.parse(aiMessage).message}`;

      // If the AI's response is a question, break the loop and return the conversation history
      if (aiMessage.endsWith('?')) {
        break;
      }
    }
  }
  return conversationHistory;
}

const main = async () => {
  let customerId = 1;
  let conversation = [
    { role: 'user', content: 'What products do you have in stock?' },
    { role: 'ai', content: '' }  // Placeholder for the AI's response
  ];

  let conversationHistory = await handleConversation(customerId, conversation);
  return conversationHistory;
}

// once db loads, run main function
db.on('open', () => {
  main()
    .then(response => console.log(response))
    .catch(err => console.log(err));
});