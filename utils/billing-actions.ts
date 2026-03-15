'use server'

import { createClient } from '@/utils/supabase/server'
import { generateSubscriptionOrderId } from '@/utils/tosspayments'
import { createPaymentLog, updatePaymentLogStatus } from '@/utils/payment-log-actions'

function getBasicAuthHeader() {
    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) throw new Error('TOSS_SECRET_KEY is not defined')
    const encoded = Buffer.from(`${secretKey}:`).toString('base64')
    return `Basic ${encoded}`
}

export async function issueBillingKey(customerKey: string, authKey: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        console.log('--- [Toss Debug] issueBillingKey ---')
        console.log('CustomerKey:', customerKey)
        console.log('AuthKey:', authKey)
        
        const response = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Content-Type': 'application/json',
                'TossPayments-Version': '2024-06-01'
            },
            body: JSON.stringify({
                customerKey,
                authKey
            })
        })

        const responseText = await response.text()
        console.log('Toss Response Text:', responseText)

        let data;
        try {
            data = JSON.parse(responseText)
        } catch (e) {
            data = {}
        }

        if (!response.ok) {
            console.error('Failed to issue billing key:', data)
            return { success: false, error: data.message || '빌링키 발급에 실패했습니다.' }
        }

        // Here we originally saved the billing key, but now we will just return the billing key 
        // to the client (or pass it directly to the next step) without saving it yet.
        // We will save it securely via RPC ONLY AFTER the first payment is successfully processed
        // to ensure we don't activate the plan if the initial payment fails.
        // 
        // Actually, we should save the billing key first, then charge. 
        // Wait, the RPC `save_billing_key_and_activate_plan` activates the plan. 
        // Let's create a simpler RPC just for saving the key, OR just pass the key data 
        // down to processInitialBillingPayment which will call the full RPC on success.
        
        // Let's just return the billing key data so processInitialBillingPayment 
        // can save it all at once securely when payment succeeds.
        return { 
            success: true, 
            billingKey: data.billingKey,
            cardCompany: data.cardCompany || data.card?.issuerCode,
            cardNumber: data.cardNumber || data.card?.number
        }

    } catch (error: any) {
        console.error('Error during issueBillingKey:', error)
        return { success: false, error: error.message }
    }
}

export async function processBillingPayment(
    billingKey: string, 
    customerKey: string, 
    amount: number,
    userId: string,
    cardCompany?: string,
    cardNumber?: string,
    isInitial: boolean = false,
    supabaseClient?: any
) {
    const supabase = supabaseClient || await createClient()
    
    const orderId = generateSubscriptionOrderId()
    
    // Log PENDING
    await createPaymentLog(orderId, amount)

    try {
        const response = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
            method: 'POST',
            headers: {
                'Authorization': getBasicAuthHeader(),
                'Content-Type': 'application/json',
                'TossPayments-Version': '2024-06-01'
            },
            body: JSON.stringify({
                customerKey,
                amount,
                orderId,
                orderName: 'CloudNote Pro 구독'
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Failed to process billing payment:', data)
            await updatePaymentLogStatus(orderId, 'FAILED', data.message)
            return { success: false, error: data.message || '결제 승인에 실패했습니다.' }
        }

        // Successfully paid
        await updatePaymentLogStatus(orderId, 'SUCCESS')

        // Update plan/expires_at
        if (isInitial) {
            const { error: rpcError } = await supabase.rpc('save_billing_key_and_activate_plan', {
                p_customer_key: customerKey,
                p_billing_key: billingKey,
                p_card_company: cardCompany || null,
                p_card_number: cardNumber || null
            })

            if (rpcError) {
                console.error('Failed to execute secure RPC for billing key / plan update:', rpcError)
                return { success: false, error: '결제는 성공했으나 권한 활성화 중 오류가 발생했습니다.' }
            }
            // Recurring: Update expiration (+30 days) and log subscription in KST
            const now = new Date()
            const kstOffset = 9 * 60 * 60 * 1000
            
            // Get today 00:00 in KST, converted to UTC
            const kstNow = new Date(now.getTime() + kstOffset)
            kstNow.setUTCHours(0, 0, 0, 0)
            
            // 30 days later in KST
            const nextExpiryKST = new Date(kstNow.getTime() + (30 * 24 * 60 * 60 * 1000))
            
            // Convert back to UTC for storage
            const finalExpiryUTC = new Date(nextExpiryKST.getTime() - kstOffset)
            const currentPeriodStartUTC = new Date(kstNow.getTime() - kstOffset)
            
            const { error: updateError } = await supabase
                .from('users')
                .update({ expires_at: finalExpiryUTC.toISOString() })
                .eq('id', userId)

            if (updateError) {
                console.error('Failed to update recurring expiration:', updateError)
            }

            await supabase.from('subscriptions').insert({
                user_id: userId,
                plan: 'pro',
                amount: amount,
                status: 'active',
                current_period_start: currentPeriodStartUTC.toISOString(),
                current_period_end: finalExpiryUTC.toISOString()
            })
        }

        return { success: true }

    } catch (error: any) {
        console.error('Error during processBillingPayment:', error)
        await updatePaymentLogStatus(orderId, 'FAILED', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * 시간과 관계없이 오늘 결제해야 하는 빌링키를 모두 불러와서 결제를 진행합니다.
 */
export async function processDueSubscriptions(supabaseClient?: any) {
    const supabase = supabaseClient || await createClient()

    const today = new Date().toISOString()
    
    const { data: dueUsers, error: fetchError } = await supabase
        .from('users')
        .select(`
            id,
            email,
            billing_keys (
                billing_key,
                customer_key
            )
        `)
        .eq('plan', 'pro')
        .lte('expires_at', today)

    if (fetchError) {
        console.error('Error fetching due subscriptions:', fetchError)
        return { success: false, error: fetchError.message }
    }

    if (!dueUsers || dueUsers.length === 0) {
        console.log('결제 예정인 구독이 없습니다.')
        return { success: true, processedCount: 0 }
    }

    console.log(`${dueUsers.length}개의 구독 결제를 시작합니다.`)

    const results = []
    for (const user of dueUsers) {
        const bk = (user.billing_keys as any)?.[0]
        if (!bk?.billing_key) {
            console.error(`User ${user.id} has no billing key. Skipping.`)
            continue
        }

        const res = await processBillingPayment(
            bk.billing_key,
            bk.customer_key,
            31900, 
            user.id,
            undefined,
            undefined,
            false,
            supabase // Pass down the client
        )
        
        results.push({
            userId: user.id,
            success: res.success,
            error: res.error
        })
    }

    return { 
        success: true, 
        processedCount: dueUsers.length,
        results 
    }
}

/**
 * 구독을 취소하고 등록된 빌링키를 삭제합니다.
 * 권한은 expires_at까지 유지됩니다.
 */
export async function cancelSubscription() {
    const supabase = await createClient()
    
    try {
        const { error } = await supabase.rpc('cancel_subscription_and_delete_billing_key')
        
        if (error) {
            console.error('Error in cancelSubscription RPC:', error)
            return { success: false, error: '구독 취소 중 오류가 발생했습니다.' }
        }
        
        return { success: true }
    } catch (error: any) {
        console.error('Error in cancelSubscription action:', error)
        return { success: false, error: error.message }
    }
}


