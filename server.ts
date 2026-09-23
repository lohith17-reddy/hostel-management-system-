import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './server/routes/api.routes.js';
import { initDatabaseSchema } from './server/db/schema.js';
import { seedDatabase } from './server/db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Initialize Database Schema & Seed Data
  try {
    await initDatabaseSchema();
    await seedDatabase();
  } catch (dbErr) {
    console.error('Database initialization error:', dbErr);
  }

  // API Routes
  app.use('/api', apiRoutes);

  // Development: Mount Vite middlewares; Production: serve static build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hostel Management System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
