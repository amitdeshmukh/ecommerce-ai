import readline from "readline";

async function reply(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(`AI: ${message.message} \nCustomer: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export { reply };