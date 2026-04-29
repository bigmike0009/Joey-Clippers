import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: new Error('Not signed in') };
  const response = await supabase.functions.invoke('delete-account');
  return { error: response.error ?? null };
}
