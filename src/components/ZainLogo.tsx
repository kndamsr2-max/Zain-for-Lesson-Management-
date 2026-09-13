import React from 'react';

interface ZainLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ZainLogo: React.FC<ZainLogoProps> = ({ className = '', size = 'md' }) => {
  // Dimensions based on size prop
  const sizeMap = {
    sm: { w: 90, h: 75 },
    md: { w: 130, h: 105 },
    lg: { w: 160, h: 130 },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Emblem SVG: Open Book + Ascending Student Figure */}
      <svg
        width={dim.w}
        height={dim.h}
        viewBox="0 0 160 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_20px_rgba(0,180,255,0.45)]"
      >
        <defs>
          {/* Main Cyan-to-Blue Linear Gradient */}
          <linearGradient id="zainPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#0080ff" />
            <stop offset="100%" stopColor="#004cd4" />
          </linearGradient>

          {/* Left Wing Outer Gradient */}
          <linearGradient id="zainLeftOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Right Wing Outer Gradient */}
          <linearGradient id="zainRightOuter" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Head Radial Glow */}
          <radialGradient id="zainHeadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>

          {/* Central Figure Gradient */}
          <linearGradient id="zainFigureGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* --- Central Student Figure (Learner) --- */}
        {/* Head Circle */}
        <circle cx="80" cy="22" r="10.5" fill="url(#zainHeadGlow)" />
        <circle cx="80" cy="22" r="10.5" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />

        {/* Ascending Body / Torso with Outstretched Arms */}
        <path
          d="M 80,38 C 70,38 58,45 52,51 C 58,54 66,51 74,48 L 74,68 C 76,71 84,71 86,68 L 86,48 C 94,51 102,54 108,51 C 102,45 90,38 80,38 Z"
          fill="url(#zainFigureGrad)"
        />

        {/* Center Heart-Chest Light Accent */}
        <path
          d="M 80,44 C 76,44 72,48 76,54 L 80,59 L 84,54 C 88,48 84,44 80,44 Z"
          fill="#e0f2fe"
          opacity="0.9"
        />

        {/* --- Open Book Pages (Wings of Knowledge) --- */}
        {/* Left Side: Outer Page (Deep/Large) */}
        <path
          d="M 78,82 C 60,76 38,68 28,52 C 26,62 30,76 44,88 C 55,97 68,98 77,95 Z"
          fill="url(#zainLeftOuter)"
          opacity="0.9"
        />

        {/* Left Side: Middle Page (Bright Blue) */}
        <path
          d="M 78,82 C 62,72 44,60 38,42 C 48,46 58,54 68,66 C 74,74 77,80 78,82 Z"
          fill="#0284c7"
        />

        {/* Left Side: Inner Page (Electric Cyan) */}
        <path
          d="M 78,80 C 65,68 54,54 48,34 C 56,40 66,48 74,60 C 77,66 78,74 78,80 Z"
          fill="#38bdf8"
        />

        {/* Right Side: Outer Page (Deep/Large) */}
        <path
          d="M 82,82 C 100,76 122,68 132,52 C 134,62 130,76 116,88 C 105,97 92,98 83,95 Z"
          fill="url(#zainRightOuter)"
          opacity="0.9"
        />

        {/* Right Side: Middle Page (Bright Blue) */}
        <path
          d="M 82,82 C 98,72 116,60 122,42 C 112,46 102,54 92,66 C 86,74 83,80 82,82 Z"
          fill="#0284c7"
        />

        {/* Right Side: Inner Page (Electric Cyan) */}
        <path
          d="M 82,80 C 95,68 106,54 112,34 C 104,40 94,48 86,60 C 83,66 82,74 82,80 Z"
          fill="#38bdf8"
        />

        {/* Base Spine of Book */}
        <path
          d="M 70,95 C 76,98 84,98 90,95 C 86,92 74,92 70,95 Z"
          fill="#67e8f9"
        />
      </svg>

      {/* Brand Title: زين */}
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-normal mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        زين
      </h1>

      {/* Primary Subtitle: لإدارة الدروس والسناتر */}
      <h2 className="text-sm sm:text-base font-bold text-sky-200 mt-1 tracking-normal">
        لإدارة الدروس والسناتر
      </h2>

      {/* Secondary Motto: إدارة أسهل .. لمستقبل أفضل */}
      <p className="text-xs text-slate-400 mt-0.5 font-medium tracking-normal">
        إدارة أسهل .. لمستقبل أفضل
      </p>
    </div>
  );
};
