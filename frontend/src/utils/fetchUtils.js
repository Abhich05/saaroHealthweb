// Shared fetch utilities for caching and transient error detection
// Usage: import { cacheGet, cacheSet, isTransientError, makeCacheKey, sleep } from '../utils/fetchUtils';

export const cacheGet = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const cacheSet = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const isTransientError = (err) => {
  const status = err?.response?.status;
  return (
    !status ||
    (status >= 500 && status < 600) ||
    err.code === 'ECONNABORTED' ||
    (typeof err.message === 'string' && err.message.includes('Network Error'))
  );
};

export const makeCacheKey = (prefix, parts = []) => {
  const safe = parts.map(p => (p === undefined || p === null ? '' : String(p)));
  return `${prefix}:${safe.join(':')}`;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
