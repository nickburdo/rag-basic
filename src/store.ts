import { OpenAIEmbeddings } from '@langchain/openai';
import { embeddingModel, geminiConfig } from './constants';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PostgresRecordManager } from '@langchain/community/indexes/postgres';

export const embeddings = new OpenAIEmbeddings({
  ...geminiConfig,
  model: embeddingModel,
  dimensions: 1536,
});

export function getVectorStore() {
  return PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: 'chunks',
    distanceStrategy: 'cosine',
  });
}

export function getRecordManager() {
  return new PostgresRecordManager('pgvector/chunks', {
    postgresConnectionOptions: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: 'chunk_records',
  });
}
