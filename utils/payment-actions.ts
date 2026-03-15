'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { updatePaymentLogStatus } from '@/utils/payment-log-actions'

export async function activateSubscription(orderId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { error } = await supabase.rpc('activate_test_subscription', {
            p_plan: 'pro',
            p_amount: 31900,
            p_payment_method: 'TEST_CARD',
        })

        if (!error) {
            if (orderId) {
                await updatePaymentLogStatus(orderId, 'SUCCESS')
            }
            revalidatePath('/', 'layout')
            return { success: true }
        }
        return { success: false, error: error.message }
    }
    return { success: false, error: 'Unauthorized' }
}
