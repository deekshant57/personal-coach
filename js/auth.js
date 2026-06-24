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
  currentSession = session;
  if (session?.user) {
    loadProfile(session.user.id);
  } else {
    currentProfile = null;
  }
  return session;
}

export async function loadSession() {
  const client = getClient();
  if (!client) return currentSession;

  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    console.error('loadSession:', error);
    return currentSession;
  }

  if (session) {
    setSession(session);
  }
  return currentSession;
}

export function initAuthListeners(onSignedIn, onSignedOut) {
  const client = getClient();
  if (!client) return;

  client.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return;

    setSession(session);
    if (session?.user) {
      onSignedIn?.(session);
    } else {
      onSignedOut?.();
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
