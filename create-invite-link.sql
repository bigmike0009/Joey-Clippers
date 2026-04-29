INSERT INTO public.invites (created_by, email)
  SELECT id, 'whoever@example.com'
  FROM public.profiles WHERE role = 'admin' LIMIT 1
  RETURNING token;

  Then construct:
  https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/invite-la
  nding?token=<the-token>