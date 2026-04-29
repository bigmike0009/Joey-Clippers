import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');

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

// Returns Eastern Time offset in minutes (positive = behind UTC, e.g. 300 for EST, 240 for EDT).
// Runs on a UTC server, so new Date(y,m,d,h,min,s) uses UTC, which makes the math work.
function getEasternOffsetMinutes(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0');
  // On a UTC server, new Date(y,m-1,d,h,min,s) = UTC timestamp for those NY clock values
  const nyAsUtcMs = new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')).getTime();
  return Math.round((now.getTime() - nyAsUtcMs) / 60000);
}

// Converts a NY local date+time string pair to a UTC Date.
function nyToUtc(nyDate: string, nyTime: string, offsetMinutes: number): Date {
  // On a UTC server, parsing without 'Z' or offset treats string as UTC
  const nyMs = new Date(`${nyDate}T${nyTime.slice(0, 8)}`).getTime();
  return new Date(nyMs + offsetMinutes * 60_000);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const nowMs = Date.now();
  const offsetMinutes = getEasternOffsetMinutes();

  // Fetch all open shop days that still need a reminder or open notification
  const { data: shopDays, error } = await (supabase
    .from('shop_days')
    .select('id, date, start_time, reminder_sent, open_notif_sent')
    .eq('status', 'open') as unknown as Promise<{
      data: Array<{
        id: string;
        date: string;
        start_time: string;
        reminder_sent: boolean;
        open_notif_sent: boolean;
      }> | null;
      error: unknown;
    }>);

  if (error || !shopDays?.length) {
    return new Response('ok', { status: 200 });
  }

  for (const day of shopDays) {
    const startUtc = nyToUtc(day.date, day.start_time, offsetMinutes);
    const diffMinutes = (startUtc.getTime() - nowMs) / 60_000;

    // 1-hour reminder: 55–65 min before start
    if (!day.reminder_sent && diffMinutes >= 55 && diffMinutes <= 65) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('member_id')
        .eq('shop_day_id', day.id)
        .eq('status', 'confirmed');

      const memberIds = (bookings ?? []).map(b => b.member_id);
      if (memberIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('push_token')
          .in('id', memberIds)
          .not('push_token', 'is', null);

        const tokens = (profiles ?? []).map(p => p.push_token as string);
        await sendPush(tokens.map(to => ({
          to,
          title: "Your cut is in 1 hour ✂️",
          body: `Joe's shop opens today at ${formatDate(day.date)}. See you soon!`,
        })));
      }

      await (supabase
        .from('shop_days')
        .update({ reminder_sent: true })
        .eq('id', day.id) as unknown as Promise<unknown>);
    }

    // Shop opens notification: within 5 min after start time
    if (!day.open_notif_sent && diffMinutes >= -5 && diffMinutes <= 0) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('member_id')
        .eq('shop_day_id', day.id)
        .eq('status', 'confirmed');

      const memberIds = (bookings ?? []).map(b => b.member_id);
      if (memberIds.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('push_token')
          .in('id', memberIds)
          .not('push_token', 'is', null);

        const tokens = (profiles ?? []).map(p => p.push_token as string);
        await sendPush(tokens.map(to => ({
          to,
          title: "Shop is open! 💈",
          body: "Joe's is open now. Head on over!",
        })));
      }

      await (supabase
        .from('shop_days')
        .update({ open_notif_sent: true })
        .eq('id', day.id) as unknown as Promise<unknown>);
    }
  }

  return new Response('ok', { status: 200 });
});
