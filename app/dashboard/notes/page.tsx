import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotesClient } from './NotesClient'

export default async function NotesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Fetch user profile on the server for immediate plan check
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    
    const isPaidPlan = ['pro', 'enterprise'].includes(profile?.plan?.toLowerCase() ?? '')

    if (!isPaidPlan) {
        // Redirect on the server if the plan is not active
        redirect('/dashboard/subscription')
    }

    // Fetch notes on the server
    const { data: notes } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    return (
        <NotesClient 
            notes={notes || []} 
            profile={profile} 
            user={user} 
        />
    )
}
