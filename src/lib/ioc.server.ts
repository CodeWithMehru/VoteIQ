
/**
 * Singularity Architecture: SERVER-ONLY IoC Container
 * Strictly for Node.js environments.
 */

class ServerIoCContainer {
  private services: Map<string, unknown> = new Map();

  public register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  public resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`[Server IoC] Service not found: ${key}`);
    }
    return service as T;
  }
}

export const serverContainer = new ServerIoCContainer();

export const SERVICE_KEYS = {
  VOTING: 'VotingService',
  TRANSLATION: 'TranslationService',
  AUTH: 'AuthService',
} as const;

// Lazy-loading infrastructure to prevent premature leaks
import { FirebaseVotingService } from './infrastructure/voting';
serverContainer.register(SERVICE_KEYS.VOTING, new FirebaseVotingService());
