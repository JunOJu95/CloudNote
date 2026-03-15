-- Migration File: Create billing_keys table and add expires_at to users

-- 1. Add expires_at to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 2. Create billing_keys table
CREATE TABLE IF NOT EXISTS public.billing_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    customer_key text NOT NULL UNIQUE,
    billing_key text NOT NULL,
    card_company text,
    card_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- updated_at trigger logic
CREATE TRIGGER set_billing_keys_updated_at
  BEFORE UPDATE ON public.billing_keys FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.billing_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing keys."
  ON public.billing_keys FOR SELECT
  USING (auth.uid() = user_id);

-- Explicitly disallow INSERT/UPDATE/DELETE from the client (anon/authenticated roles)
-- Insertions and updates should only happen via Service Role (Server Actions)
