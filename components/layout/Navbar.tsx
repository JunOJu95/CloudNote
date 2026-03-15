import React from 'react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-20 lg:px-40 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl" data-icon="cloud">cloud</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold leading-tight tracking-tight">CloudNote</h2>
            </Link>
            <div className="flex items-center gap-4">
                <button className="hidden md:block text-slate-600 dark:text-slate-400 font-medium hover:text-primary transition-colors px-4 py-2">
                    기능 소개
                </button>
                <Link href="/auth" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    <span className="truncate">로그인</span>
                </Link>
            </div>
        </header>
    );
}
