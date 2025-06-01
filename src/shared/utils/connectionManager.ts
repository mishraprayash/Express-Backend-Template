import { connectDatabase, disconnectDatabase } from '../../config/database';
import { connectRedis, disconnectRedis } from '../../config/redis';

export interface ConnectionStatus {
  dbConnected: boolean;
  redisConnected: boolean;
}

export class ConnectionManager {
  private status: ConnectionStatus = {
    dbConnected: false,
    redisConnected: false,
  };

  async initializeConnections() {
    try {
      await this.connectDatabase();
      await this.connectRedis();
      return this.status;
    } catch (error) {
      throw new Error('Failed to initialize connections');
    }
  }

  private async connectDatabase() {
    try {
      await connectDatabase();
      this.status.dbConnected = true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
    }
  }

  private async connectRedis() {
    try {
      await connectRedis();
      this.status.redisConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async cleanup() {
    if (this.status.dbConnected) await disconnectDatabase();
    if (this.status.redisConnected) await disconnectRedis();
  }

  getStatus() {
    return this.status;
  }
}
