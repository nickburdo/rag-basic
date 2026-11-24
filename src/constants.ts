export const textOutModel =
  process.env.TEXT_OUT_MODEL ?? 'gemini-3.5-flash-lite';
export const embeddingModel =
  process.env.EMBEDDING_MODEL ?? 'gemini-embedding-2';
export const geminiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  },
};
