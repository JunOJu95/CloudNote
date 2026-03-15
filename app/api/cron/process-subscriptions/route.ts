import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processDueSubscriptions } from '@/utils/billing-actions'

export async function POST(request: Request) {
    // 1. Verify cron secret (Vercel provides this in production, or use custom CRON_SECRET)
    const authHeader = request.headers.get('Authorization')
    const expectedSecret = process.env.CRON_SECRET || 'dev_cron_secret'
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized CRON request' }, { status: 401 })
    }

    // 2. Initialize Supabase Admin Client
    // This is needed for Cron to query across all users (bypassing RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseServiceKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY for Cron Job')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    try {
        console.log('--- [Cron] Starting subscription processing ---')
        
        // 3. Call the centralized business logic
        const result = await processDueSubscriptions(supabaseAdmin)

        if (!result.success) {
            throw new Error(result.error)
        }

        console.log('--- [Cron] Subscription processing finished ---', result)
        
        return NextResponse.json({ 
            message: 'All due subscriptions processed', 
            processedCount: result.processedCount,
            results: result.results
        }, { status: 200 })

    } catch (error: any) {
        console.error('CRON Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
