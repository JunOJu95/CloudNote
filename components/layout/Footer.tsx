import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-12">
            <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-8">
                <div className="flex items-center gap-2 text-primary opacity-80">
                    <span className="material-symbols-outlined text-2xl" data-icon="cloud">cloud</span>
                    <h2 className="text-lg font-bold">CloudNote</h2>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 dark:text-slate-400">
                    <a className="hover:text-primary transition-colors" href="#">이용약관</a>
                    <a className="hover:text-primary transition-colors" href="#">개인정보처리방침</a>
                    <a className="hover:text-primary transition-colors" href="#">고객센터</a>
                    <a className="hover:text-primary transition-colors" href="#">기업 소개</a>
                </div>
                <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-600 text-sm">© 2024 CloudNote Inc. All rights reserved.</p>
                    <p className="text-slate-400 dark:text-slate-600 text-xs mt-2 italic">Your ideas, organized beautifully in the cloud.</p>
                </div>
            </div>
        </footer>
    );
}
