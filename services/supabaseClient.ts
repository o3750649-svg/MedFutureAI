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
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            // @ts-ignore
            return process.env[key];
        }
    } catch (e) {
        // Ignore reference errors in strict browser environments
    }

    return undefined;
};

// CONFIGURATION:
// 1. Try to get keys from Render Environment Variables (Secure)
// 2. Fallback to hardcoded credentials (Reliability Guarantee)
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://bzibmjooqgfobdmtzyxv.supabase.co';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aWJtam9vcWdmb2JkbXR6eXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjQ3NTYsImV4cCI6MjA4MTAwMDc1Nn0.ERdh3Mww9fJFVGNBI_YQXoQ2F2GGvgkIlw01t61Gsb0';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("FATAL: Amr Ai Database Connection Failed. Credentials missing.");
} else {
    console.log("Amr Ai Database: Connected Securely.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
