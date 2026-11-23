import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import {getVectorStore} from "./store";
import {ask} from "./ask";

export async function chat() {
  const store = await getVectorStore();

  const retriever = store.asRetriever({ k: 4 });
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const question = (await rl.question("Your question ('end' for finish): ")).trim();
      if (question === 'end') break;
      if (!question) continue;

      try {
        await ask(retriever, question);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  } finally {
    rl.close();
    await store.end();
  }
}