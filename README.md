# E-commerce ai bot
This AI bot uses [llm-client](https://github.com/dosco/llm-client) to take a question from a user and lookup a database to be able to answer the question. It uses the function calling capabilities of OpenAI's GPT-3.5 to be able to call functions and return data from the `sqlite3` database.

## Installation

1. Clone the repository

```bash
git clone https://github.com/amitdeshmukh/ecommerce-ai.git
cd ecommerce-ai
```

2. Install the dependencies

```bash
npm install
```

3. Install `sqlite3` if you don't have it already

```bash
brew install sqlite3
```

4. Create the database from the `create_database.sql` file
```bash
sqlite3 ecommerce.db < create_database.sql
```

## Usage

Run the bot
```bash
npm start # or node index.js
```
