# Authentication Patterns

Common patterns for implementing authentication with AWS Amplify Cognito.

## Basic Auth Provider

```tsx
// lib/auth/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp, fetchAuthSession } from 'aws-amplify/auth';

interface User {
  userId: string;
  email: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || '',
        emailVerified: !!session.tokens,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    const result = await signIn({ username: email, password });
    if (result.isSignedIn) {
      await checkAuth();
    }
  }

  async function handleSignUp(email: string, password: string) {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: { email },
      },
    });
  }

  async function handleConfirmSignUp(email: string, code: string) {
    await confirmSignUp({ username: email, confirmationCode: code });
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  async function refreshSession() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Protected Route Component

```tsx
// components/auth/protected-route.tsx
'use client';

import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  if (isLoading) {
    return fallback;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

## Login Form Component

```tsx
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/common';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError('');
    try {
      await signIn(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground p-2 rounded"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
```

## Role-Based Access Control

```tsx
// lib/auth/rbac.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type Permission =
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:settings'
  | 'write:settings'
  | 'manage:billing'
  | 'manage:organization';

const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'read:users',
    'write:users',
    'delete:users',
    'read:settings',
    'write:settings',
    'manage:billing',
    'manage:organization',
  ],
  admin: [
    'read:users',
    'write:users',
    'read:settings',
    'write:settings',
    'manage:billing',
  ],
  member: ['read:users', 'read:settings'],
  viewer: ['read:users'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
```

## Permission Guard Component

```tsx
// components/auth/permission-guard.tsx
'use client';

import { useAuth } from '@/lib/auth/auth-provider';
import { hasPermission, type Permission } from '@/lib/auth/rbac';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Fetch user's role from your User model
  const userRole = 'member'; // Replace with actual role lookup

  if (!hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## Session Refresh Hook

```tsx
// lib/hooks/use-session.ts
'use client';

import { useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/lib/auth/auth-provider';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useSession() {
  const { refreshSession, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check and refresh token periodically
    const interval = setInterval(async () => {
      try {
        const session = await fetchAuthSession();
        const expiresAt = session.tokens?.accessToken?.payload.exp;

        if (expiresAt) {
          const expiresIn = expiresAt * 1000 - Date.now();
          // Refresh if less than 5 minutes remaining
          if (expiresIn < 5 * 60 * 1000) {
            await fetchAuthSession({ forceRefresh: true });
            await refreshSession();
          }
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshSession]);
}
```
