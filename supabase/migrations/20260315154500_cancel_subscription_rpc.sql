-- RPC to securely cancel subscription and delete billing key
CREATE OR REPLACE FUNCTION public.cancel_subscription_and_delete_billing_key()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Delete billing keys for this user
    DELETE FROM public.billing_keys 
    WHERE user_id = v_user_id;

    -- 2. Update active subscriptions to 'canceled'
    UPDATE public.subscriptions
    SET status = 'canceled'
    WHERE user_id = v_user_id AND status = 'active';

    -- Note: We do NOT update users.plan or users.expires_at here.
    -- The user keeps access until expires_at.
    -- The Cron job will naturally skip this user because billing_keys are gone.

END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_subscription_and_delete_billing_key TO authenticated;
