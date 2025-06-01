import { Server } from 'http';
import { ConnectionManager } from './connectionManager';

export class SignalHandler {
  static setup(server: Server, connectionManager: ConnectionManager) {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      await this.gracefulShutdown(server, connectionManager, 1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err: Error) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      await this.gracefulShutdown(server, connectionManager, 1);
    });

    // Handle SIGTERM (sent by service managers like PM2, Docker, etc.)
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      await this.gracefulShutdown(server, connectionManager, 0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      await this.gracefulShutdown(server, connectionManager, 0);
    });
  }

  private static async gracefulShutdown(
    server: Server,
    connectionManager: ConnectionManager,
    exitCode: number
  ) {
    return new Promise((resolve) => {
      server.close(async () => {
        await connectionManager.cleanup();
        console.log('Server shutdown complete.');
        process.exit(exitCode);
        resolve(undefined);
      });
    });
  }
}
