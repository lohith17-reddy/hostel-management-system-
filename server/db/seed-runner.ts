import { flushSaveToDisk } from './database.js';
import { initDatabaseSchema } from './schema.js';
import { seedDatabase } from './seed.js';

async function runSeed() {
  try {
    await initDatabaseSchema();
    await seedDatabase();
    flushSaveToDisk();
    console.log('🎉 Seed execution finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed execution failed:', err);
    process.exit(1);
  }
}

runSeed();
