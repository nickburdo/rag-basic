import {OpenAIEmbeddings} from "@langchain/openai";
import {embeddingModel, geminiConfig} from "./constants";
import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";

export const embeddings = new OpenAIEmbeddings({
  ...geminiConfig,
  model: embeddingModel,
  dimensions: 1536,
});

export function getVectorStore() {
  return PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL
    },
    tableName: 'chunks',
    distanceStrategy: 'cosine',
  });
}