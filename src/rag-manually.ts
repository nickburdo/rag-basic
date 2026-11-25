import OpenAI from 'openai';
import { cosine } from './cosine';
import { readdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const openai = new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.OPENAI_API_KEY,
});

const textOutModel = process.env.TEXT_OUT_MODEL ?? 'gemini-3.5-flash-lite';
const embeddingModel = process.env.EMBEDDING_MODEL ?? 'gemini-embedding-2';

// 1.Indexing: for now, each file is a single fragment.
const docs: { source: string; text: string; vector: number[] }[] = [];
for (const file of await readdir('knowledge-base')) {
  if (!file.endsWith('.md')) continue;
  const text = await readFile(`knowledge-base/${file}`, 'utf8');
  const { data } = await openai.embeddings.create({
    model: embeddingModel,
    input: text,
  });
  docs.push({ source: file, text, vector: data[0].embedding });
}

// 2.Search: the two documents closest in content
const rl = readline.createInterface({ input, output });
const question = await rl.question('Your question: ');
rl.close();

const { data } = await openai.embeddings.create({
  model: embeddingModel,
  input: question,
});

const top = docs
  .map((doc) => ({ ...doc, score: cosine(data[0].embedding, doc.vector) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 2);
console.log(
  'Знайдено:',
  top.map((doc) => `${doc.source} (${doc.score.toFixed(3)})`).join(', '),
);

// 3. Generation: response based solely on the found information
const context = top
  .map((doc, i) => `[${i + 1}] ${doc.source}\n${doc.text}`)
  .join('\n\n');

const response = await openai.chat.completions.create({
  model: textOutModel,
  messages: [
    {
      role: 'system',
      content:
        'Ти асистент компанії «Твоя Галера». Відповідай лише на основі контексту. ' +
        'Якщо відповіді в контексті немає, скажи, що не знаєш. ' +
        'Після кожного факту став посилання на джерело: [1], [2].',
    },
    {
      role: 'user',
      content: `Контекст:\n${context}\n\nПитання: ${question}`,
    },
  ],
});

console.log(response.choices[0].message.content);

// The list of available models
// const models = await client.models.list();
// for await (const m of models) {
//   console.log(m.id);
// }
