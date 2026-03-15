-- Update the RPC to use date-only precision for expires_at
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
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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

    -- Use CURRENT_DATE to strip time (results in 00:00:00)
    UPDATE public.users
    SET 
        plan = 'pro',
        expires_at = (CURRENT_DATE + interval '30 days')::timestamptz
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
        CURRENT_DATE,
        (CURRENT_DATE + interval '30 days')::timestamptz
    );

END;
$$;
