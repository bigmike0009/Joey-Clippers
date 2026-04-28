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
