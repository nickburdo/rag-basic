import { getRecordManager, getVectorStore } from './store';
import { loadDocuments, splitDocuments } from './prepare-documents';
import { index } from '@langchain/core/indexing';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

type IndexDocsParams = { force?: boolean };

export async function indexDocs({ force = false }: IndexDocsParams = {}) {
  const recordManager = getRecordManager();
  let vectorStore: PGVectorStore | undefined;

  try {
    await recordManager.createSchema();
    vectorStore = await getVectorStore();
    const docs = await loadDocuments();

    if (docs.length === 0) {
      throw new Error(
        'No documents found in knowledge-base/, refusing to index (would delete all chunks)',
      );
    }

    if (force) {
      await recordManager.pool.query(
        `TRUNCATE ${vectorStore.computedTableName}, ${recordManager.finalTableName}`,
      );
      console.log('Force mode: chunks and records cleared');
    }

    const docsSource = await splitDocuments(docs);

    const { numAdded, numUpdated, numSkipped, numDeleted } = await index({
      docsSource,
      recordManager,
      vectorStore,
      options: {
        cleanup: 'full',
        sourceIdKey: 'source',
      },
    });

    console.log('Indexing complete');
    console.log('Total added records', numAdded);
    console.log('Total updated records', numUpdated);
    console.log('Total skipped records', numSkipped);
    console.log('Total deleted', numDeleted);
  } finally {
    await Promise.allSettled([recordManager.end(), vectorStore?.end()]);
  }
}
