import { parseArgs } from 'node:util';
import { indexDocs } from './index-docs';

const { values } = parseArgs({
  options: {
    force: { type: 'boolean', default: false },
  },
});

try {
  await indexDocs({ force: values.force });
} catch (error) {
  console.error('Indexing failed:', error);
  process.exitCode = 1;
}
