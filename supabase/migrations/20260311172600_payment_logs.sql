-- Migration File: Create payment_logs table

CREATE TABLE IF NOT EXISTS public.payment_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    order_id text NOT NULL UNIQUE,
    amount integer NOT NULL,
    status text NOT NULL, -- PENDING, SUCCESS, FAILED, CANCELED
    fail_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- updated_at trigger logic
CREATE TRIGGER set_payment_logs_updated_at
  BEFORE UPDATE ON public.payment_logs FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment logs."
  ON public.payment_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment logs."
  ON public.payment_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment logs."
  ON public.payment_logs FOR UPDATE
  USING (auth.uid() = user_id);
