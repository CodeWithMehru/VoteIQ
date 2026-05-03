'use client';

/**
 * Singularity Architecture: CLIENT-ONLY IoC Container
 * Strictly for Browser environments.
 */

class ClientIoCContainer {
  private services: Map<string, unknown> = new Map();

  public register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  public resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`[Client IoC] Service not found: ${key}`);
    }
    return service as T;
  }
}

export const clientContainer = new ClientIoCContainer();

export const SERVICE_KEYS = {
  VOTING: 'VotingService',
  TRANSLATION: 'TranslationService',
  AUTH: 'AuthService',
} as const;
