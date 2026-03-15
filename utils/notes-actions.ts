'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkPaidAccess(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요합니다.')

    const { data: profile } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single()

    const plan = profile?.plan?.toLowerCase() || 'free'
    if (!['pro', 'enterprise'].includes(plan)) {
        throw new Error('Pro 플랜 가입이 필요한 기능입니다.')
    }
    
    return user
}

export async function createNote(title: string, content: string) {
    const supabase = await createClient()
    const user = await checkPaidAccess(supabase)

    const { data, error } = await supabase
        .from('notes')
        .insert([{ 
            user_id: user.id, 
            title: title || '제목 없음', 
            content: content || '' 
        }])
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/notes')
    return data
}

export async function updateNote(id: string, title: string, content: string) {
    const supabase = await createClient()
    const user = await checkPaidAccess(supabase)

    const { data, error } = await supabase
        .from('notes')
        .update({ 
            title: title, 
            content: content,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/notes')
    return data
}

export async function deleteNote(id: string) {
    const supabase = await createClient()
    const user = await checkPaidAccess(supabase)

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/notes')
    return { success: true }
}
