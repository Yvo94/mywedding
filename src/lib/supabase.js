import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

{
  /* =====================================================
          alter table public.guests enable row level security;
          alter table public.rsvps enable row level security;
          alter table public.guestbook_messages enable row level security;
          alter table public.wedding_settings enable row level security;
      ====================================================== */
}