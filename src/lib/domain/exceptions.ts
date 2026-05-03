/**
 * Singularity Architecture: Domain-Specific Exceptions
 */

export type ExceptionDetails = Record<string, unknown>;

export abstract class BaseException extends Error {
  constructor(
    public override readonly message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, public readonly details?: ExceptionDetails) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class SecurityException extends BaseException {
  constructor(message: string) {
    super(message, 'SECURITY_VIOLATION', 403);
  }
}

export class InfrastructureException extends BaseException {
  constructor(message: string, public readonly originalError?: Error | unknown) {
    super(message, 'INFRASTRUCTURE_FAILURE', 503);
  }
}

export class NotFoundException extends BaseException {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
