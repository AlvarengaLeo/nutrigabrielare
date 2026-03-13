import { createClient } from '@supabase/supabase-js';
import {
  hasRequiredPublicRuntimeConfig,
  publicRuntimeConfig,
  publicRuntimeConfigErrorMessage,
} from '../config/runtimeConfig.js';

function createMissingConfigProxy(path = 'supabase') {
  return new Proxy(function missingSupabaseClient() {}, {
    get(_target, property) {
      if (property === Symbol.toStringTag) return 'MissingSupabaseClient';
      if (property === 'toString') {
        return () => `[MissingSupabaseClient:${path}]`;
      }
      return createMissingConfigProxy(`${path}.${String(property)}`);
    },
    apply() {
      throw new Error(publicRuntimeConfigErrorMessage);
    },
    construct() {
      throw new Error(publicRuntimeConfigErrorMessage);
    },
  });
}

export const supabase = hasRequiredPublicRuntimeConfig
  ? createClient(
      publicRuntimeConfig.supabaseUrl,
      publicRuntimeConfig.supabaseAnonKey
    )
  : createMissingConfigProxy();
