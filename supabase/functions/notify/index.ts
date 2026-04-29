import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
}

async function sendPush(messages: PushMessage[]): Promise<void> {
  const valid = messages.filter(m => typeof m.to === 'string' && m.to.startsWith('ExponentPushToken['));
  if (!valid.length) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (expoAccessToken) headers['Authorization'] = `Bearer ${expoAccessToken}`;

  for (let i = 0; i < valid.length; i += 100) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(valid.slice(i, i + 100)),
      });
    } catch (err) {
      console.error('Push send error:', err);
    }
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { type, table, record, old_record } = payload;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Helper: get admin push tokens
  async function getAdminTokens(): Promise<string[]> {
    const { data } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('role', 'admin')
      .not('push_token', 'is', null);
    return (data ?? []).map(r => r.push_token as string);
  }

  // Helper: get member name
  async function getMemberName(userId: string): Promise<string> {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    return data?.full_name ?? 'Someone';
  }

  // Helper: get shop day date
  async function getShopDayDate(shopDayId: string): Promise<string> {
    const { data } = await supabase
      .from('shop_days')
      .select('date')
      .eq('id', shopDayId)
      .single();
    return data?.date ? formatDate(data.date) : 'your shop day';
  }

  if (table === 'day_requests' && type === 'INSERT') {
    const [adminTokens, name] = await Promise.all([
      getAdminTokens(),
      getMemberName(record!.requested_by as string),
    ]);
    await sendPush(adminTokens.map(to => ({
      to,
      title: 'New Day Request',
      body: `${name} wants a shop day on ${formatDate(record!.requested_date as string)}`,
    })));
  }

  if (table === 'bookings' && type === 'INSERT' && record!.status === 'confirmed') {
    const [adminTokens, name, dateStr] = await Promise.all([
      getAdminTokens(),
      getMemberName(record!.member_id as string),
      getShopDayDate(record!.shop_day_id as string),
    ]);
    await sendPush(adminTokens.map(to => ({
      to,
      title: 'Slot Booked',
      body: `${name} booked a slot on ${dateStr}`,
    })));
  }

  if (table === 'bookings' && type === 'INSERT' && record!.status === 'pending') {
    const [adminTokens, name, dateStr] = await Promise.all([
      getAdminTokens(),
      getMemberName(record!.member_id as string),
      getShopDayDate(record!.shop_day_id as string),
    ]);
    await sendPush(adminTokens.map(to => ({
      to,
      title: 'Waitlist Join',
      body: `${name} joined the waitlist for ${dateStr}`,
    })));
  }

  if (table === 'bookings' && type === 'UPDATE'
    && old_record!.status === 'confirmed' && record!.status === 'cancelled') {
    const [adminTokens, name, dateStr] = await Promise.all([
      getAdminTokens(),
      getMemberName(record!.member_id as string),
      getShopDayDate(record!.shop_day_id as string),
    ]);
    await sendPush(adminTokens.map(to => ({
      to,
      title: 'Booking Cancelled',
      body: `${name} cancelled their booking on ${dateStr}`,
    })));
  }

  if (table === 'shop_days' && type === 'INSERT') {
    const { data: members } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('role', 'member')
      .not('push_token', 'is', null);
    const tokens = (members ?? []).map(m => m.push_token as string);
    const formatted = formatDate(record!.date as string);
    await sendPush(tokens.map(to => ({
      to,
      title: "Shop Day Available 💈",
      body: `Joe's is open on ${formatted}. Grab your slot!`,
    })));
  }

  if (table === 'shop_days' && type === 'UPDATE'
    && old_record!.status === 'open' && record!.status === 'cancelled') {
    const { data: bookedRows } = await supabase
      .from('bookings')
      .select('member_id')
      .eq('shop_day_id', record!.id as string)
      .eq('status', 'confirmed');

    const memberIds = (bookedRows ?? []).map(b => b.member_id);
    if (memberIds.length) {
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('push_token')
        .in('id', memberIds)
        .not('push_token', 'is', null);

      const tokens = (memberProfiles ?? []).map(m => m.push_token as string);
      const formatted = formatDate(record!.date as string);
      await sendPush(tokens.map(to => ({
        to,
        title: 'Shop Day Cancelled',
        body: `The shop day on ${formatted} has been cancelled. Your slot has been removed.`,
      })));
    }
  }

  if (table === 'profiles' && type === 'DELETE') {
    const token = old_record!.push_token as string | null;
    if (token) {
      await sendPush([{
        to: token,
        title: 'Membership Removed',
        body: "Your Joe's Clippers membership has been removed.",
      }]);
    }
  }

  return new Response('ok', { status: 200 });
});
