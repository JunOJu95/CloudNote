import React from 'react';
import Link from 'next/link';
import PricingCard from '@/components/PricingCard';

export default function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display">
      <div className="layout-container flex h-full grow flex-col">

        <main className="flex-1">
          {/* Hero Section */}
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex flex-col gap-8 lg:w-1/2 text-center lg:text-left items-center lg:items-start">
                <div className="flex flex-col gap-4">
                  <h1 className="text-slate-900 dark:text-slate-100 text-4xl md:text-6xl font-extrabold leading-[1.15] tracking-tight">
                    당신의 아이디어를 <br /><span className="text-primary">클라우드</span>에!!!
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                    어디서든 메모하고, AI가 자동으로 정리해드립니다. 복잡한 생각들을 체계적으로 관리하세요.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="/auth" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-lg font-bold shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all">
                    무료로 시작하기
                  </Link>
                  <button className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-lg font-bold hover:bg-slate-50 transition-all">
                    서비스 둘러보기
                  </button>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img alt="CloudNote Dashboard Interface" className="w-full aspect-[4/3] object-cover" data-alt="Modern minimalist digital notebook interface on tablet" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAPy4GGUoNfRw5GIicvO8zmf9t1tW-pexSfuS2h88TX5mz9iICWzGccSuuaz6DxcFcyMwzGBmwM0_NJ823teHWR88MYSeK3pjTinWlUlTda4t1R6HfcqurCUmstnlooiSYft3FtgcaQzOMLBqVKmv1a4CQYovG0SwTfoYG9bdEgnZBNMQSAu46H_3yVD_RJmVDXp9PlkdTN37KpyiIszoHQNjjG0dV1PXhl1VcajlbcwQi70zDQsYU-XVokZAXQEBxDkOBbCjgETg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Features Highlight */}
          <div className="bg-white dark:bg-slate-900/50 py-16">
            <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-primary text-4xl mb-4" data-icon="sync">sync</span>
                <h3 className="text-xl font-bold mb-2">실시간 동기화</h3>
                <p className="text-slate-500">모든 기기에서 실시간으로 노트를 확인하고 편집하세요.</p>
              </div>
              <div className="p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-primary text-4xl mb-4" data-icon="smart_toy">smart_toy</span>
                <h3 className="text-xl font-bold mb-2">AI 자동 정리</h3>
                <p className="text-slate-500">AI가 핵심 내용을 요약하고 관련 태그를 자동으로 추천합니다.</p>
              </div>
              <div className="p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-primary text-4xl mb-4" data-icon="security">security</span>
                <h3 className="text-xl font-bold mb-2">철저한 보안</h3>
                <p className="text-slate-500">엔드투엔드 암호화로 당신의 소중한 정보를 안전하게 보호합니다.</p>
              </div>
            </div>
          </div>
          {/* Pricing Section */}
          <section className="max-w-[1280px] mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">요금제 안내</h2>
              <p className="text-slate-500 dark:text-slate-400">당신에게 꼭 맞는 플랜을 선택하세요</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard
                planName="Free"
                price="0원"
                features={["기본 메모 기능", "5GB 저장공간", "AI 자동 정리 미포함"]}
                buttonText="시작하기"
                variant="landing"
              />
              <PricingCard
                planName="Pro"
                price="9,900원"
                features={["무제한 메모 생성", "AI 자동 정리 및 요약", "100GB 저장공간", "오프라인 모드 지원"]}
                buttonText="지금 구매"
                isPopular={true}
                variant="landing"
              />
              <PricingCard
                planName="Enterprise"
                price="29,900원"
                features={["팀 협업 툴 무제한 연동", "24/7 전담 기술 서포트", "무제한 저장공간 & 보안 로그"]}
                buttonText="문의하기"
                variant="landing"
              />
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}
