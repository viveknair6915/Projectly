import { createApp } from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    app.listen(ENV.PORT, () => {
      console.log(`
  ======================================================
   Projectly API Server Running on port ${ENV.PORT}
   Environment: ${ENV.NODE_ENV}
   Client Origin: ${ENV.CLIENT_URL}
   Health Check: http://localhost:${ENV.PORT}/api/health
  ======================================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
