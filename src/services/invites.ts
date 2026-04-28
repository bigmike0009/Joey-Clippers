import { supabase } from '@/lib/supabase';

export async function getInvitePreview(token: string) {
  return supabase.rpc('get_invite_preview', { p_token: token });
}

export async function redeemInvite(token: string) {
  return supabase.rpc('redeem_invite', { p_token: token });
}

export async function generateInvite(email?: string) {
  return supabase.rpc('generate_invite', { p_email: email });
}

export async function getInviteList() {
  return supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function deleteInvite(id: string) {
  return supabase.from('invites').delete().eq('id', id).is('used_by', null);
}
