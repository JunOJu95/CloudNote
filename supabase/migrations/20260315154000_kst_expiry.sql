-- Explicitly handle KST (Asia/Seoul) for expiration dates
CREATE OR REPLACE FUNCTION public.save_billing_key_and_activate_plan(
    p_customer_key text,
    p_billing_key text,
    p_card_company text,
    p_card_number text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_kst_today date;
    v_kst_expiry timestamptz;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get Today in KST
    v_kst_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date;
    -- Expiry is 30 days later at 00:00 KST
    v_kst_expiry := (v_kst_today + interval '30 days') AT TIME ZONE 'Asia/Seoul';

    INSERT INTO public.billing_keys (
        user_id, 
        customer_key, 
        billing_key, 
        card_company, 
        card_number
    )
    VALUES (
        v_user_id, 
        p_customer_key, 
        p_billing_key, 
        p_card_company, 
        p_card_number
    )
    ON CONFLICT (customer_key) DO UPDATE 
    SET 
        billing_key = EXCLUDED.billing_key,
        card_company = EXCLUDED.card_company,
        card_number = EXCLUDED.card_number,
        updated_at = now();

    UPDATE public.users
    SET 
        plan = 'pro',
        expires_at = v_kst_expiry
    WHERE id = v_user_id;

    INSERT INTO public.subscriptions (
        user_id,
        plan,
        amount,
        status,
        current_period_start,
        current_period_end
    )
    VALUES (
        v_user_id,
        'pro',
        31900,
        'active',
        v_kst_today AT TIME ZONE 'Asia/Seoul',
        v_kst_expiry
    );

END;
$$;
