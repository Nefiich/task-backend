// server.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import configureApp from './config/app';
import { AppError } from './utils/error.util';

const app = configureApp();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Global error handler
app.use((err: Error, req: any, res: any, _next: any) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof AppError && 'errors' in err ? { errors: (err as any).errors } : {})
    });
  }

  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Connected to the database');

    // Start listening for requests
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('Disconnected from the database');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('Disconnected from the database');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

export default app;