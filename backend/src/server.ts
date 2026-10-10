import { app } from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  await connectDB();

  const port = parseInt(ENV.PORT, 10) || 5000;
  app.listen(port, () => {
    console.log(`🚀 TechNest Backend server is running on http://localhost:${port}`);
    console.log(`📖 API Documentation available at http://localhost:${port}/api/docs`);
    console.log(`🌐 Health check available at http://localhost:${port}/health`);
  });
}

startServer();
