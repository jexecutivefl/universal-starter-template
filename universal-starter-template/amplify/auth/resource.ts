import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentication Configuration
 *
 * Uses Amazon Cognito for user authentication.
 * Customize authentication methods based on your needs.
 *
 * Available options:
 * - email: Email/password authentication
 * - phone: Phone number with SMS verification
 * - externalProviders: Google, Facebook, Apple, Amazon SSO
 *
 * IMPORTANT: This file is protected infrastructure.
 * Do not modify without explicit human approval.
 */

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Uncomment to enable social login:
    // externalProviders: {
    //   google: {
    //     clientId: process.env.GOOGLE_CLIENT_ID!,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   },
    // },
  },
  // Uncomment to enable MFA:
  // multifactor: {
  //   mode: 'OPTIONAL',
  //   totp: true,
  // },
});
