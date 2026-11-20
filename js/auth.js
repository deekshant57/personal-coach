// Supabase Auth
import { getClient } from './supabase.js';

let currentSession = null;
let currentProfile = null;

export function getSession() {
  return currentSession;
}

export function getProfile() {
  return currentProfile;
}

async function loadProfile(userId) {
  const client = getClient();
  if (!client || !userId) return;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (!error && data) currentProfile = data;
}

export function setSession(session) {
  currentSession = session || null;
  if (session?.user) {
    loadProfile(session.user.id);
  } else {
    currentProfile = null;
  }
  return currentSession;
}

export async function loadSession() {
  const client = getClient();
  if (!client) return currentSession;

  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    console.error('loadSession:', error);
    return currentSession;
  }

  return setSession(session);
}

/**
 * Auth lifecycle listener.
 * INITIAL_SESSION only syncs module state — cold boot uses loadSession()/enterApp.
 * SIGNED_IN covers post-login (and multi-tab); SIGNED_OUT returns to the gate.
 */
export function initAuthListeners(onSignedIn, onSignedOut) {
  const client = getClient();
  if (!client) return;

  client.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') {
      setSession(session);
      return;
    }

    setSession(session);

    if (event === 'SIGNED_OUT' || !session?.user) {
      onSignedOut?.();
      return;
    }

    if (event === 'SIGNED_IN') {
      onSignedIn?.(session);
    }
  });
}

export async function signIn(email, password) {
  const client = getClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  setSession(data.session);
  return data;
}

export async function signUp(email, password, displayName) {
  const client = getClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || email.split('@')[0] } },
  });
  if (error) throw error;
  if (data.session) setSession(data.session);
  return data;
}

export async function signOut() {
  const client = getClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
  currentSession = null;
  currentProfile = null;
}
