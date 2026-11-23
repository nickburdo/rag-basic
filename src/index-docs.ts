import {getVectorStore} from "./store";
import {loadDocuments, splitDocuments} from "./prepare-documents";

export async function indexDocs() {
  const store = await getVectorStore();
  const docs = await loadDocuments();

  for (const doc of docs) {
    const chunks = await splitDocuments([doc]);
    // First, we remove old fragments of this file so that a re-run does not duplicate them.
    await store.delete({ filter: { source: doc.metadata.source } });
    await store.addDocuments(chunks);

    console.log(`${doc.metadata.source} -> ${chunks.length} chunks`);
  }

  await store.end();
}