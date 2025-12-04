import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Backend Definition
 *
 * This file composes all backend resources (auth, data, storage, functions).
 * Add new resources here as you build features.
 *
 * IMPORTANT: This file is protected infrastructure.
 * Do not modify without explicit human approval.
 */

defineBackend({
  auth,
  data,
});
