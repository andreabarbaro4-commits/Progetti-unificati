import { apiClient } from '../lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MockHandler = (body?: unknown, path?: string) => unknown;

interface HandlerRegistryEntry {
  method: string;
  pathPattern: string | RegExp;
  handler: MockHandler;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const handlerRegistry: HandlerRegistryEntry[] = [];

/** Stored original methods for potential future restoration. */
let originalMethods: {
  get: typeof apiClient.get;
  post: typeof apiClient.post;
  put: typeof apiClient.put;
  patch: typeof apiClient.patch;
  delete: typeof apiClient.delete;
} | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a random delay between 50ms and 100ms. */
function randomDelay(): number {
  return Math.floor(Math.random() * 51) + 50;
}

/** Wait for a given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Find a matching handler for the given method and path. */
function findHandler(
  method: string,
  path: string,
): HandlerRegistryEntry | undefined {
  return handlerRegistry.find((entry) => {
    if (entry.method.toUpperCase() !== method.toUpperCase()) return false;

    if (typeof entry.pathPattern === 'string') {
      return entry.pathPattern === path;
    }

    // RegExp match
    return entry.pathPattern.test(path);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a mock handler for a given HTTP method and path.
 * The handler will be called when apiClient makes a matching request.
 */
export function registerMockHandler(
  method: string,
  path: string | RegExp,
  handler: MockHandler,
): void {
  handlerRegistry.push({
    method: method.toUpperCase(),
    pathPattern: path,
    handler,
  });
}

/**
 * Patches all apiClient methods (get, post, put, patch, delete)
 * to use the handler registry instead of making real HTTP requests.
 */
export function enableMockApi(): void {
  // Store originals for later restoration
  originalMethods = {
    get: apiClient.get,
    post: apiClient.post,
    put: apiClient.put,
    patch: apiClient.patch,
    delete: apiClient.delete,
  };

  // Patch GET
  apiClient.get = async function mockGet<TResponse>(
    path: string,
  ): Promise<TResponse> {
    const entry = findHandler('GET', path);
    if (!entry) {
      throw new Error(`No mock handler registered for GET ${path}`);
    }
    await sleep(randomDelay());
    return entry.handler(undefined, path) as TResponse;
  };

  // Patch POST
  apiClient.post = async function mockPost<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    const entry = findHandler('POST', path);
    if (!entry) {
      throw new Error(`No mock handler registered for POST ${path}`);
    }
    await sleep(randomDelay());
    return entry.handler(body, path) as TResponse;
  };

  // Patch PUT
  apiClient.put = async function mockPut<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    const entry = findHandler('PUT', path);
    if (!entry) {
      throw new Error(`No mock handler registered for PUT ${path}`);
    }
    await sleep(randomDelay());
    return entry.handler(body, path) as TResponse;
  };

  // Patch PATCH
  apiClient.patch = async function mockPatch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    const entry = findHandler('PATCH', path);
    if (!entry) {
      throw new Error(`No mock handler registered for PATCH ${path}`);
    }
    await sleep(randomDelay());
    return entry.handler(body, path) as TResponse;
  };

  // Patch DELETE
  apiClient.delete = async function mockDelete<TResponse>(
    path: string,
  ): Promise<TResponse> {
    const entry = findHandler('DELETE', path);
    if (!entry) {
      throw new Error(`No mock handler registered for DELETE ${path}`);
    }
    await sleep(randomDelay());
    return entry.handler(undefined, path) as TResponse;
  };
}

