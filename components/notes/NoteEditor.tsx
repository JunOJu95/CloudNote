'use client'

import { useState, useEffect } from 'react'
import { createNote, updateNote, deleteNote } from '@/utils/notes-actions'
import { useRouter } from 'next/navigation'

interface NoteEditorProps {
    note?: {
        id: string
        title: string
        content: string
    } | null
    isEditing?: boolean
    onCancel?: () => void
}

export function NoteEditor({ note, isEditing = false, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState(note?.title || '')
    const [content, setContent] = useState(note?.content || '')
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (note) {
            setTitle(note.title)
            setContent(note.content)
        } else {
            setTitle('')
            setContent('')
        }
    }, [note])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (isEditing && note) {
                await updateNote(note.id, title, content)
            } else {
                const newNote = await createNote(title, content)
                if (newNote && !isEditing) {
                    router.push(`/dashboard/notes?id=${newNote.id}`)
                }
            }
            if (onCancel) onCancel();
        } catch (error: any) {
            alert(error.message || '저장 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!note || !confirm('정말 삭제하시겠습니까?')) return

        try {
            setIsSaving(true)
            await deleteNote(note.id)
            router.push('/dashboard/notes')
            if (onCancel) onCancel();
        } catch (error: any) {
            alert(error.message || '삭제 중 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="font-bold text-lg">{isEditing ? '노트 편집' : '새 노트 작성'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <button 
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'save'}</span>
                        {isSaving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="mx-auto max-w-3xl space-y-6">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl font-extrabold bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                        autoFocus
                    />
                    <textarea
                        placeholder="당신의 아이디어를 적어보세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[400px] text-lg leading-loose bg-transparent border-none outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-700 dark:text-slate-300"
                    />
                </div>
            </div>
        </div>
    )
}
