import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.OPENAI_API_KEY,
});

const r = await client.embeddings.create({
  model: "gemini-embedding-2",
  input: ["кошка сидит на окне"],
  dimensions: 1536,
});

console.log(r.data[0].embedding.length);
