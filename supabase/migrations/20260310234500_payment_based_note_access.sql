-- Enforce note access by paid subscription state and add test payment activation RPC

-- 1) Helper function used by RLS policies
CREATE OR REPLACE FUNCTION public.has_note_access(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user_id
      AND lower(coalesce(u.plan, 'free')) IN ('pro', 'enterprise')
  )
  OR EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_note_access(uuid) TO authenticated;

-- 2) Tighten RLS for notes/tags/note_tags by paid access
DROP POLICY IF EXISTS "Users can view their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;

CREATE POLICY "Users with paid access can view their own notes."
  ON public.notes FOR SELECT
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can create their own notes."
  ON public.notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can update their own notes."
  ON public.notes FOR UPDATE
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can delete their own notes."
  ON public.notes FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view their own tags." ON public.tags;
DROP POLICY IF EXISTS "Users can create their own tags." ON public.tags;
DROP POLICY IF EXISTS "Users can update their own tags." ON public.tags;
DROP POLICY IF EXISTS "Users can delete their own tags." ON public.tags;

CREATE POLICY "Users with paid access can view their own tags."
  ON public.tags FOR SELECT
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can create their own tags."
  ON public.tags FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can update their own tags."
  ON public.tags FOR UPDATE
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

CREATE POLICY "Users with paid access can delete their own tags."
  ON public.tags FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.has_note_access(auth.uid())
  );

DROP POLICY IF EXISTS "Users can view note_tags for their notes." ON public.note_tags;
DROP POLICY IF EXISTS "Users can create note_tags for their notes." ON public.note_tags;
DROP POLICY IF EXISTS "Users can delete note_tags for their notes." ON public.note_tags;

CREATE POLICY "Users with paid access can view note_tags for their notes."
  ON public.note_tags FOR SELECT
  USING (
    public.has_note_access(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users with paid access can create note_tags for their notes."
  ON public.note_tags FOR INSERT
  WITH CHECK (
    public.has_note_access(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users with paid access can delete note_tags for their notes."
  ON public.note_tags FOR DELETE
  USING (
    public.has_note_access(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
  );

-- 3) RPC: mark test payment completed and activate note permissions
CREATE OR REPLACE FUNCTION public.activate_test_subscription(
  p_plan text DEFAULT 'pro',
  p_amount integer DEFAULT 31900,
  p_payment_method text DEFAULT 'TEST_CARD'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_plan text := lower(coalesce(p_plan, 'pro'));
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF v_plan NOT IN ('pro', 'enterprise') THEN
    RAISE EXCEPTION 'INVALID_PLAN';
  END IF;

  -- Idempotent: if already active and valid, keep current state.
  IF EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = v_user_id
      AND s.status = 'active'
      AND lower(s.plan) = v_plan
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ) THEN
    UPDATE public.users
    SET plan = v_plan
    WHERE id = v_user_id;
    RETURN;
  END IF;

  UPDATE public.subscriptions
  SET status = 'canceled'
  WHERE user_id = v_user_id
    AND status = 'active';

  INSERT INTO public.subscriptions (
    user_id,
    plan,
    amount,
    payment_method,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    v_user_id,
    v_plan,
    p_amount,
    p_payment_method,
    'active',
    now(),
    now() + interval '1 month'
  );

  UPDATE public.users
  SET plan = v_plan
  WHERE id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_test_subscription(text, integer, text) TO authenticated;
