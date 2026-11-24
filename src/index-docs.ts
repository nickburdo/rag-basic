import { getRecordManager, getVectorStore } from './store';
import { loadDocuments, splitDocuments } from './prepare-documents';
import { index } from '@langchain/core/indexing';

export async function indexDocs() {
  const recordManager = getRecordManager();
  await recordManager.createSchema();

  const vectorStore = await getVectorStore();
  const docs = await loadDocuments();
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

  await recordManager.end();
  await vectorStore.end();
}
