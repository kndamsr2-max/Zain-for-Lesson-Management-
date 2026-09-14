import React from 'react';

interface ZainLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkText?: boolean;
  variant?: 'light' | 'dark' | 'horizontal';
}

export const ZainLogo: React.FC<ZainLogoProps> = ({
  className = '',
  size = 'md',
  darkText = false,
  variant = 'horizontal',
}) => {
  const isDarkText = darkText || variant === 'light';

  // In the reference screenshot, the logo has a 3D cyan graduation cap + "زين" + "إدارة أبسط .. لنتائج أفضل"
  return (
    <div className={`flex flex-col items-center select-none ${className}`} dir="rtl">
      <div className="flex items-center justify-center gap-3">
        {/* 3D Cyan-Blue Graduation Cap matching screenshot */}
        <div className="relative shrink-0">
          <svg
            width="46"
            height="42"
            viewBox="0 0 100 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_4px_12px_rgba(2,132,199,0.5)]"
          >
            <defs>
              <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="45%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="capBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>
              <linearGradient id="capUnderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Cap base skull section underneath */}
            <path
              d="M 28,44 Q 50,60 72,44 L 72,56 Q 50,72 28,56 Z"
              fill="url(#capBottomGrad)"
              stroke="#38bdf8"
              strokeWidth="1"
            />

            {/* Cap diamond mortarboard top */}
            <path
              d="M 50,14 L 88,34 L 50,54 L 12,34 Z"
              fill="url(#capTopGrad)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />

            {/* Light highlight border line on top edge */}
            <path
              d="M 12,34 L 50,14 L 88,34"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Central cap button */}
            <ellipse cx="50" cy="34" rx="3.5" ry="2.5" fill="#f8fafc" />

            {/* Tassel cord & hanging ribbon */}
            <path
              d="M 50,34 Q 40,38 34,44 L 32,58"
              stroke="#f0f9ff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Tassel brush */}
            <polygon points="30,58 34,58 35,66 29,66" fill="#bae6fd" />
          </svg>
        </div>

        {/* Brand Name: زين */}
        <h1
          className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${
            isDarkText ? 'text-slate-900' : 'text-white'
          }`}
        >
          زين
        </h1>
      </div>

      {/* Subtitle Motto: إدارة أبسط .. لنتائج أفضل */}
      <p
        className={`text-xs font-semibold mt-1 tracking-wide ${
          isDarkText ? 'text-sky-600' : 'text-sky-400'
        }`}
      >
        إدارة أبسط .. لنتائج أفضل
      </p>
    </div>
  );
};
