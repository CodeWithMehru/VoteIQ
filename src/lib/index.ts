/**
 * Singularity Architecture: Domain Entry Point (CLEAN)
 * Strictly decoupled from infrastructure and IoC to prevent bundle leaks.
 */

export * from './domain/types';
export * from './domain/branding';
export * from './domain/interfaces';
export * from './domain/exceptions';
export * from './domain/schemas';
export * from './domain/logic';

// Client-safe infrastructure only
export * from './infrastructure/firebase';
export * from './infrastructure/wasm-hash';
