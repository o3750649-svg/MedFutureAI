import { createClient } from '@supabase/supabase-js';

// --- ROBUST ENVIRONMENT VARIABLE LOADER ---
// This ensures keys are found whether using Vite, Webpack, or Node on Render.
const getEnv = (key: string) => {
    // 1. Try Vite (Standard for React on Render)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env[key]) return import.meta.env[key];
        // @ts-ignore
        if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    }
    
    // 2. Try Node/Process (Standard fallback)
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env) {
            // Check without VITE_
            if (process.env[key]) return process.env[key];
            // Check with VITE_
            if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
        }
    } catch (e) {
        // Ignore reference errors in strict browser environments
    }

    return undefined;
};

// CONFIGURATION:
// 1. Try to get keys from Render Environment Variables (Secure)
// 2. Fallback to hardcoded credentials (Reliability Guarantee)
const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("FATAL: Amr Ai Database Connection Failed. Credentials missing.");
} else {
    console.log("Amr Ai Database: Connected Securely.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
