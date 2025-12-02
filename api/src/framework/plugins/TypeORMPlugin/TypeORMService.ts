import { createConnection, getConnection } from 'typeorm';

export class TypeORMService {
  constructor(private readonly config) {
  }

  async createConnections() {
    const promises = this.config.connections.map((connectionConfig) => createConnection(connectionConfig));
    return Promise.all(promises);
  }

  getConnection = getConnection;
}
