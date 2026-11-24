import { answerChain, formatContext } from './rag';
import { BaseRetrieverInterface } from '@langchain/core/retrievers';

export async function ask(
  retriever: BaseRetrieverInterface,
  question: string,
): Promise<void> {
  const docs = await retriever.invoke(question);
  const context = formatContext(docs);
  const answer = await answerChain.invoke({ question, context });

  console.log(answer);
  console.log('\nДжерела:');
  docs.forEach((doc, i) =>
    console.log(`[${i + 1}] ${doc.metadata.title} (${doc.metadata.source})`),
  );
}
