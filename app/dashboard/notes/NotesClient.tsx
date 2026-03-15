'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { NoteEditor } from '@/components/notes/NoteEditor'

interface NotesClientProps {
    notes: any[]
    profile: any
    user: any
}

export function NotesClient({ notes: initialNotes, profile, user }: NotesClientProps) {
    const [notes, setNotes] = useState<any[]>(initialNotes)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedNoteId = searchParams.get('id')
    const supabase = createClient()

    // Re-fetch notes when editor state changes (simplification)
    useEffect(() => {
        if (!isEditorOpen) {
            const fetchNotes = async () => {
                const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
                setNotes(data || [])
            }
            fetchNotes()
        }
    }, [isEditorOpen, user.id])

    const selectedNote = selectedNoteId
        ? notes.find(n => n.id === selectedNoteId)
        : notes.length > 0 ? notes[0] : null

    const fullName = profile?.full_name || user.email?.split('@')[0] || '사용자'
    const planName = profile?.plan?.toLowerCase() === 'pro' ? 'Pro' : profile?.plan?.toLowerCase() === 'enterprise' ? 'Enterprise' : 'Free'

    if (isEditorOpen) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
                <NoteEditor 
                    note={isEditing ? selectedNote : null} 
                    isEditing={isEditing} 
                    onCancel={() => {
                        setIsEditorOpen(false)
                        setIsEditing(false)
                    }} 
                />
            </div>
        )
    }

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[380px_1fr]">
            {/* Sidebar */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">내 노트</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{fullName} · {planName} Plan</p>
                        </div>
                        <button className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => {
                            setIsEditing(false)
                            setIsEditorOpen(true)
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined">add</span>
                        <span>새 노트 작성</span>
                    </button>
                </div>

                <nav className="max-h-[65vh] space-y-1 overflow-y-auto p-3">
                    {notes.length > 0 ? notes.map((note) => {
                        const isActive = selectedNote?.id === note.id
                        const date = new Date(note.created_at)
                        const dateString = date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
                        const timeString = date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })

                        return (
                            <Link
                                href={`/dashboard/notes?id=${note.id}`}
                                key={note.id}
                                className={`group relative block rounded-xl p-4 transition-colors ${isActive ? 'border border-primary/20 bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div className="mb-1 flex items-start justify-between">
                                    <h3 className={`truncate pr-4 font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>{note.title}</h3>
                                    <span className={`text-[11px] font-bold ${isActive ? 'uppercase tracking-wider text-primary' : 'text-slate-400'}`}>
                                        {isActive ? 'Today' : dateString}
                                    </span>
                                </div>
                                <p className={`mb-2 text-sm ${isActive ? 'line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-400' : 'line-clamp-1 text-slate-500 dark:text-slate-500'}`}>
                                    {note.content || '내용이 없습니다.'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400">{timeString}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    <span className="text-[11px] text-slate-400">일반</span>
                                </div>
                            </Link>
                        )
                    }) : (
                        <div className="mt-10 p-4 text-center text-slate-500">
                            <p>작성된 노트가 없습니다.</p>
                        </div>
                    )}
                </nav>
            </section>

            {/* Main Content */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {selectedNote ? (
                    <>
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-4 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <button className={`rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${selectedNote.is_favorite ? 'text-yellow-500' : ''}`}>
                                    <span className="material-symbols-outlined">star</span>
                                </button>
                                <button className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        setIsEditing(true)
                                        setIsEditorOpen(true)
                                    }}
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    편집
                                </button>
                                <button 
                                    onClick={async () => {
                                        if (confirm('정말 삭제하시겠습니까?')) {
                                            const { deleteNote } = await import('@/utils/notes-actions')
                                            await deleteNote(selectedNote.id)
                                            router.push('/dashboard/notes')
                                        }
                                    }}
                                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>

                        <div className="mx-auto flex w-full max-w-3xl flex-col px-8 py-10">
                            <div className="mb-8">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">#AI요약</span>
                                </div>
                                <h2 className="mb-4 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white">{selectedNote.title}</h2>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                        <span>{new Date(selectedNote.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span>{new Date(selectedNote.created_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })} 작성됨</span>
                                    </div>
                                </div>
                            </div>

                            <article className="prose prose-slate max-w-none whitespace-pre-wrap text-lg leading-loose text-slate-700 dark:prose-invert dark:text-slate-300">
                                {selectedNote.content}
                            </article>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 py-28 text-slate-400">
                        <span className="material-symbols-outlined text-6xl opacity-20">description</span>
                        <p>선택된 노트가 없습니다. 새 노트를 작성하거나 목록에서 선택해주세요.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
