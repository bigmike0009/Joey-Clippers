import { supabase } from '@/lib/supabase';

export async function getAllProfiles() {
  return supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });
}

export async function revokeMember(userId: string) {
  return supabase.rpc('revoke_member', { p_user_id: userId });
}

export async function savePushToken(userId: string, token: string) {
  return supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);
}
