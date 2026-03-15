'use server'

import { createClient } from '@/utils/supabase/server'

export async function createPaymentLog(orderId: string, amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('payment_logs')
        .insert({
            user_id: user.id,
            order_id: orderId,
            amount: amount,
            status: 'PENDING'
        })

    if (error) {
        console.error('Failed to create payment log:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function updatePaymentLogStatus(orderId: string, status: 'SUCCESS' | 'FAILED' | 'CANCELED', failReason?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const updateData: any = { status: status }
    if (failReason) {
        updateData.fail_reason = failReason
    }

    const { error } = await supabase
        .from('payment_logs')
        .update(updateData)
        .eq('order_id', orderId)
        .eq('user_id', user.id) // Ensure user can only update their own logs

    if (error) {
        console.error('Failed to update payment log status:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
