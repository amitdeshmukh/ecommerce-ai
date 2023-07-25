import readline from "readline";

async function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(`AI: ${question} \nCustomer: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export { askQuestion };