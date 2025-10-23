/**
 * Environment Configuration
 * Centralized configuration management for all environment variables
 * 
 * IMPORTANT: This file is safe to import in both server and client contexts.
 * Server-only variables are only accessed on the server side.
 */

import path from "path";


// Validate required environment variables (server-side only)
function validateEnvVar(name: string, defaultValue?: string): string {
  const isServer = typeof window === 'undefined';
  if (!isServer) {
    return defaultValue || '';
  }
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}



export function validateEnvironment() {
  const isServer = typeof window === 'undefined';

  if (!isServer) {
    throw new Error('❌ Environment validation should only be run on the server side.');
  }

  const errors: string[] = [];

  try {
    if (!process.env.DATABASE_URL) {
      errors.push("DATABASE_URL is not set");
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters long");
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
  console.log("✅ Environment validation passed");
}



// Server-only configuration (only available on server side)
export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: validateEnvVar("DATABASE_URL"),
  JWT_SECRET: validateEnvVar("JWT_SECRET"),
  JWT_EXPIRES_IN: validateEnvVar("JWT_EXPIRES_IN", "7d"),
  PORT: parseInt(process.env.PORT || "3080"),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "104857600"), // 100MB
  UPLOAD_DIR: validateEnvVar("UPLOAD_DIR", "./uploads"),
  CONFLUENCE_API_TOKEN: validateEnvVar("CONFLUENCE_API_TOKEN"),
  CONFLUENCE_USER_EMAIL: validateEnvVar("CONFLUENCE_USER_EMAIL"),
  CONFLUENCE_BASE_URL: validateEnvVar("CONFLUENCE_BASE_URL"),
  REGISTER_URL: validateEnvVar("REGISTER_URL"),
  CONFLUENCE_ROOT_PAGE_ID: validateEnvVar("CONFLUENCE_ROOT_PAGE_ID", "1414955057"),
  NEXT_PUBLIC_APP_URL: validateEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3080"),
  OAUTH_SERVER: validateEnvVar("OAUTH_SERVER"),
  OAUTH_CLIENT_ID: validateEnvVar("OAUTH_CLIENT_ID"),
  OAUTH_CLIENT_SECRET: validateEnvVar("OAUTH_CLIENT_SECRET"),
  OAUTH_REDIRECT_URI: validateEnvVar("OAUTH_REDIRECT_URI", "/api/auth/callback"),
  GIT_LAB_TOKEN: validateEnvVar("GIT_LAB_TOKEN"),
  GIT_LAB_BASE_URL: validateEnvVar("GIT_LAB_BASE_URL"),
};

export const uploadDir = (): string => {
  //if is absolute path, return as is
  if (config.UPLOAD_DIR.startsWith("/")) {
    return config.UPLOAD_DIR;
  }
  //else, join with current working directory
  return path.join(process.cwd(), config.UPLOAD_DIR);
}
