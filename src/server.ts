import app from './app';
import { config } from './config';
import { ConnectionManager } from './shared/utils/connectionManager';
import { SignalHandler } from './shared/utils/signalHandler';

const startServer = async () => {
  try {
    
    // Connect to Database, Redis and other services which needs to be connected before startinf server 
    const connectionManager =  new ConnectionManager();
    await connectionManager.initializeConnections();

    // Start the server
    const server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.env} mode`);
    });

    // Setup signal handlers
    SignalHandler.setup(server, connectionManager);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
