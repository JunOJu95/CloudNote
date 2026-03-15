import React from 'react';
import Link from 'next/link';

export interface PricingCardProps {
    planName: string;
    price: string;
    period?: string;
    features: string[];
    isPopular?: boolean;
    popularLabel?: string;
    buttonText: string;
    buttonHref?: string;
    isCurrentPlan?: boolean;
    onClick?: () => void;
    variant?: 'landing' | 'dashboard';
}

export default function PricingCard({
    planName,
    price,
    period = '/월',
    features,
    isPopular = false,
    popularLabel = '인기 플랜',
    buttonText,
    buttonHref,
    isCurrentPlan = false,
    onClick,
    variant = 'landing',
}: PricingCardProps) {
    const isLanding = variant === 'landing';
    const isDashboard = variant === 'dashboard';

    // Styles based on popularity and variant
    const containerStyle = isPopular
        ? isLanding
            ? "relative flex flex-col gap-6 rounded-2xl border-2 border-solid border-primary bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-primary/10 transform scale-105 z-10"
            : "flex flex-1 flex-col gap-6 rounded-xl border-2 border-solid border-primary bg-white dark:bg-slate-900 p-6 relative shadow-lg transform md:scale-105 z-10 md:-translate-y-2"
        : isLanding
            ? "flex flex-col gap-6 rounded-2xl border border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:shadow-xl transition-shadow"
            : "flex flex-1 flex-col gap-6 rounded-xl border border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-md";

    const badgeStyle = isLanding
        ? "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider"
        : "absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold leading-normal tracking-[0.015em] rounded-full bg-primary px-4 py-1 text-center shadow-sm";

    const buttonStyle = isPopular
        ? isLanding
            ? "flex w-full items-center justify-center rounded-lg h-12 bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            : "flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]"
        : isLanding
            ? "flex w-full items-center justify-center rounded-lg h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            : "flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold leading-normal tracking-[0.015em]";

    const nameColor = isPopular
        ? "text-primary text-lg font-bold"
        : "text-slate-600 dark:text-slate-400 text-lg font-bold";

    return (
        <div className={containerStyle}>
            {isPopular && (
                <div className={badgeStyle}>
                    {popularLabel}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className={nameColor}>{planName}</h3>
                </div>
                <div className="flex items-baseline gap-1 text-slate-900 dark:text-slate-100">
                    <span className="text-4xl font-extrabold tracking-tight">{price}</span>
                    <span className="text-base font-medium opacity-60">{period}</span>
                </div>
            </div>

            {buttonHref ? (
                <Link href={buttonHref} className={buttonStyle}>
                    <span className="truncate">{buttonText}</span>
                </Link>
            ) : (
                <button className={buttonStyle} onClick={onClick}>
                    <span className="truncate">{buttonText}</span>
                </button>
            )}

            <div className="flex flex-col gap-4 pt-4">
                {features.map((feature, i) => (
                    <div key={i} className={`flex items-center gap-3 ${isDashboard ? 'text-[13px]' : 'text-sm'} text-slate-600 dark:text-slate-300`}>
                        {feature.includes('미포함') ? (
                            <span className="material-symbols-outlined text-slate-300 text-xl" data-icon="cancel">cancel</span>
                        ) : (
                            <span className="material-symbols-outlined text-primary text-xl" data-icon="check_circle">check_circle</span>
                        )}
                        <span className={feature.includes('미포함') ? "text-slate-400 line-through" : ""}>{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
