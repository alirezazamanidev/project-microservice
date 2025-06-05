import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

interface UserPayload {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  sessionId: string;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: any; // Redis client type

  async onModuleInit() {
    try {
      // For now using a simple Map to simulate Redis (replace with actual Redis when redis package is installed)
      this.client = new Map();
      console.log('✅ Redis simulation connected');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      // Fallback to Map for simulation
      this.client = new Map();
    }
  }

  async onModuleDestroy() {
    if (this.client && typeof this.client.disconnect === 'function') {
      await this.client.disconnect();
    }
  }

  async setUserPayload(
    sessionId: string,
    payload: UserPayload,
    ttl: number = 3600,
  ): Promise<boolean> {
    try {
      // Simulate Redis SET with TTL
      this.client.set(sessionId, JSON.stringify(payload));

      // Simulate TTL with setTimeout (in real Redis this would be handled automatically)
      setTimeout(() => {
        this.client.delete(sessionId);
      }, ttl * 1000);

      console.log(`✅ User payload saved in Redis for session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving to Redis:', error);
      return false;
    }
  }

  async getUserPayload(sessionId: string): Promise<UserPayload | null> {
    try {
      const data = this.client.get(sessionId);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting from Redis:', error);
      return null;
    }
  }

  async deleteUserPayload(sessionId: string): Promise<boolean> {
    try {
      this.client.delete(sessionId);
      console.log(
        `✅ User payload deleted from Redis for session: ${sessionId}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error deleting from Redis:', error);
      return false;
    }
  }

  async getAllActiveSessions(): Promise<UserPayload[]> {
    try {
      const payloads: UserPayload[] = [];
      for (const [key, value] of this.client.entries()) {
        try {
          payloads.push(JSON.parse(value));
        } catch (parseError) {
          console.error('Error parsing payload:', parseError);
        }
      }
      return payloads;
    } catch (error) {
      console.error('❌ Error getting all sessions:', error);
      return [];
    }
  }
}
