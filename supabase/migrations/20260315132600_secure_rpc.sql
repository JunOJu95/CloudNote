-- Migration File: Create SECURITY DEFINER function to save billing key without Service Role Key

CREATE OR REPLACE FUNCTION public.save_billing_key_and_activate_plan(
    p_customer_key text,
    p_billing_key text,
    p_card_company text,
    p_card_number text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Crucial: This runs the function as the creator (postgres admin) bypassing RLS
SET search_path = public -- Secure the search path
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. Get the authenticated user ID (the user making the API call)
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Upsert the billing key for THIS user only
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

    -- 3. Update the user's plan and expires_at date in the users table
    UPDATE public.users
    SET 
        plan = 'pro',
        expires_at = now() + interval '30 days'
    WHERE id = v_user_id;

    -- 4. Record the subscription in the subscriptions table
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
        31900, -- Price of Pro plan
        'active',
        now(),
        now() + interval '30 days'
    );

END;
$$;

-- Grant execution to authenticated users (so the normal Supabase client can call it)
GRANT EXECUTE ON FUNCTION public.save_billing_key_and_activate_plan TO authenticated;
