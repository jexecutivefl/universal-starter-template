'use client';

import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '@/amplify/data/resource';

/**
 * Amplify Data Client
 *
 * Type-safe GraphQL client for interacting with your Amplify backend.
 * Uncomment and use when amplify_outputs.json is available.
 *
 * @example
 * import { client } from '@/lib/api/client';
 *
 * // List all items
 * const { data: users } = await client.models.User.list();
 *
 * // Get a single item
 * const { data: user } = await client.models.User.get({ id: 'abc123' });
 *
 * // Create an item
 * const { data: newUser } = await client.models.User.create({
 *   email: 'user@example.com',
 *   firstName: 'John',
 * });
 *
 * // Update an item
 * const { data: updatedUser } = await client.models.User.update({
 *   id: 'abc123',
 *   firstName: 'Jane',
 * });
 *
 * // Delete an item
 * await client.models.User.delete({ id: 'abc123' });
 */

// Uncomment when Schema is available:
// export const client = generateClient<Schema>();

// Placeholder until backend is deployed:
export const client = generateClient();

/**
 * Error handling wrapper for Amplify operations
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export async function apiCall<T>(
  operation: () => Promise<{ data: T; errors?: unknown[] }>
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();

    if (result.errors && result.errors.length > 0) {
      return {
        data: null,
        error: new Error(
          result.errors.map((e) => String(e)).join(', ')
        ),
      };
    }

    return { data: result.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
