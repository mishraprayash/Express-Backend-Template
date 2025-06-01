import app from './app';
import { config } from './config';
import { ConnectionManager } from './shared/utils/connectionManager';

const startServer = async () => {
  try {
    
    // Connect to Database, Redis and other services which needs to be connected before startinf server 
    const connectionManager =  new ConnectionManager();
    await connectionManager.initializeConnections();

    // Start the server
    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.env} mode`);
    });

    // Handle server errors
    server.on('error', async (error: Error) => {
      console.error('Server Error:', error);
      await connectionManager.cleanup();
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', async (reason: Error) => {
      console.error('Unhandled Rejection:', reason);
      server.close(async () => {
        await connectionManager.cleanup();
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error: Error) => {
      console.error('Uncaught Exception:', error);
      server.close(async () => {
        await connectionManager.cleanup();
        process.exit(1);
      });
    });

    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        await connectionManager.cleanup();
        console.log('Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(async () => {
        console.error('Could not close connections in time, forcefully shutting down');
        await connectionManager.cleanup();
        process.exit(1);
      }, 10000);
    };

    // Handle process termination
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
