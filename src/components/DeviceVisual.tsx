import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';

interface DeviceVisualProps {
  src?: string;
  alt: string;
  className?: string;
  aspect?: 'square' | '4/3' | '16/10' | 'auto';
}

export const DeviceVisual: React.FC<DeviceVisualProps> = ({
  src = 'preset:iphone-16-pro-max',
  alt,
  className = '',
  aspect = '4/3',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square'
      : aspect === '4/3'
        ? 'aspect-[4/3]'
        : aspect === '16/10'
          ? 'aspect-[16/10]'
          : '';

  const isPreset = !src || src.startsWith('preset:');

  if (!isPreset && !imgFailed) {
    return (
      <div className={`relative overflow-hidden bg-[#F3F5F8] ${aspectClass} ${className}`}>
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#F3F5F8] flex items-center justify-center select-none ${aspectClass} ${className}`}
      aria-label={alt}
    >
      <PresetIllustration presetKey={isPreset ? src : 'preset:iphone-16-pro-max'} />
    </div>
  );
};

function PresetIllustration({ presetKey }: { presetKey: string }) {
  switch (presetKey) {
    case 'preset:hero-flagships':
      return (
        <svg viewBox="0 0 480 360" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="bgHero" x1="0" y1="0" x2="480" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F3F5F8" />
              <stop offset="100%" stopColor="#E9F3FA" />
            </linearGradient>
            <linearGradient id="tiDesert" x1="150" y1="50" x2="290" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D7C1AE" />
              <stop offset="50%" stopColor="#B89B84" />
              <stop offset="100%" stopColor="#947863" />
            </linearGradient>
            <linearGradient id="tiScreen" x1="220" y1="70" x2="360" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#26286B" />
              <stop offset="55%" stopColor="#1499D6" />
              <stop offset="100%" stopColor="#A8C814" />
            </linearGradient>
          </defs>
          <rect width="480" height="360" fill="url(#bgHero)" />
          {/* Logo-inspired swooshes */}
          <path
            d="M36 284C115 335 280 330 412 195"
            stroke="#1499D6"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d="M52 298C138 345 305 338 432 216"
            stroke="#A8C814"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle cx="412" cy="195" r="7" fill="white" stroke="#1499D6" strokeWidth="4" opacity="0.5" />
          <circle cx="432" cy="216" r="5" fill="white" stroke="#A8C814" strokeWidth="3.5" opacity="0.6" />

          {/* Back Phone - Desert Titanium */}
          <g transform="translate(118, 44) rotate(-6 68 130)">
            <rect x="0" y="0" width="136" height="268" rx="26" fill="url(#tiDesert)" stroke="#8A6E5A" strokeWidth="2.5" />
            <rect x="12" y="14" width="60" height="62" rx="16" fill="#C7AF9A" stroke="#8A6E5A" strokeWidth="1.5" />
            <circle cx="28" cy="30" r="10.5" fill="#1F2437" stroke="#5E4C3E" strokeWidth="2" />
            <circle cx="28" cy="30" r="4.5" fill="#1499D6" opacity="0.7" />
            <circle cx="28" cy="58" r="10.5" fill="#1F2437" stroke="#5E4C3E" strokeWidth="2" />
            <circle cx="28" cy="58" r="4.5" fill="#1499D6" opacity="0.6" />
            <circle cx="55" cy="44" r="10.5" fill="#1F2437" stroke="#5E4C3E" strokeWidth="2" />
            <circle cx="55" cy="44" r="4.5" fill="#A8C814" opacity="0.65" />
            <circle cx="55" cy="24" r="3.5" fill="#FFF7DF" />
          </g>

          {/* Front Phone - Display */}
          <g transform="translate(216, 52) rotate(4 68 130)">
            <rect x="0" y="0" width="142" height="276" rx="28" fill="#1B1E3C" stroke="#4F547D" strokeWidth="3" />
            <rect x="7" y="7" width="128" height="262" rx="22" fill="url(#tiScreen)" />
            <rect x="14" y="14" width="114" height="248" rx="18" fill="white" fillOpacity="0.08" />
            {/* Dynamic Island */}
            <rect x="50" y="16" width="42" height="12" rx="6" fill="#111328" />
            {/* Clean screen UI */}
            <text x="71" y="74" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Poppins, sans-serif">
              10:09
            </text>
            <rect x="34" y="102" width="74" height="8" rx="4" fill="white" fillOpacity="0.28" />
            <rect x="44" y="118" width="54" height="6" rx="3" fill="white" fillOpacity="0.2" />
            <rect x="38" y="248" width="66" height="4" rx="2" fill="white" fillOpacity="0.7" />
          </g>
        </svg>
      );

    case 'preset:iphone-16-pro-max':
    case 'preset:iphone-16-pro':
    case 'preset:iphone-15-pro':
    case 'preset:iphone-14-pro': {
      const bodyColor =
        presetKey === 'preset:iphone-15-pro'
          ? '#3E4F6B'
          : presetKey === 'preset:iphone-14-pro'
            ? '#524468'
            : presetKey === 'preset:iphone-16-pro'
              ? '#B8B4AC'
              : '#C6B09B';
      const accentRing =
        presetKey === 'preset:iphone-15-pro'
          ? '#1499D6'
          : presetKey === 'preset:iphone-14-pro'
            ? '#8B79A8'
            : '#8E7B6A';

      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          <ellipse cx="200" cy="268" rx="96" ry="12" fill="#26286B" fillOpacity="0.08" />
          {/* Back view left */}
          <g transform="translate(106, 36)">
            <rect x="0" y="0" width="106" height="218" rx="22" fill={bodyColor} stroke={accentRing} strokeWidth="2.5" />
            <rect x="10" y="12" width="48" height="50" rx="13" fill="white" fillOpacity="0.18" stroke={accentRing} strokeWidth="1.2" />
            <circle cx="24" cy="26" r="8.5" fill="#181B2E" stroke="#2D3250" strokeWidth="1.8" />
            <circle cx="24" cy="26" r="3.5" fill="#1499D6" opacity="0.75" />
            <circle cx="24" cy="49" r="8.5" fill="#181B2E" stroke="#2D3250" strokeWidth="1.8" />
            <circle cx="24" cy="49" r="3.5" fill="#1499D6" opacity="0.6" />
            <circle cx="45" cy="37.5" r="8.5" fill="#181B2E" stroke="#2D3250" strokeWidth="1.8" />
            <circle cx="45" cy="37.5" r="3.5" fill="#A8C814" opacity="0.65" />
            <circle cx="45" cy="20" r="3" fill="#FFF7DF" />
          </g>
          {/* Front view right */}
          <g transform="translate(192, 42)">
            <rect x="0" y="0" width="106" height="218" rx="22" fill="#1E2044" stroke="#4B507B" strokeWidth="2.5" />
            <rect x="5" y="5" width="96" height="208" rx="18" fill="#26286B" />
            <path d="M5 120C32 95 72 150 101 110V195C101 205 93 213 83 213H23C13 213 5 205 5 195V120Z" fill="#1499D6" opacity="0.65" />
            <path d="M5 155C40 135 65 180 101 148V195C101 205 93 213 83 213H23C13 213 5 205 5 195V155Z" fill="#A8C814" opacity="0.55" />
            <rect x="36" y="13" width="34" height="9" rx="4.5" fill="#111328" />
            <rect x="33" y="198" width="40" height="3" rx="1.5" fill="white" opacity="0.65" />
          </g>
        </svg>
      );
    }

    case 'preset:samsung-s24-ultra':
    case 'preset:samsung-s23-ultra': {
      const frame = presetKey === 'preset:samsung-s24-ultra' ? '#9B9B96' : '#2C2F3A';
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          <ellipse cx="200" cy="268" rx="108" ry="12" fill="#26286B" fillOpacity="0.08" />
          {/* Galaxy Ultra rectangular silhouette */}
          <g transform="translate(114, 34)">
            <rect x="0" y="0" width="108" height="222" rx="10" fill={frame} stroke="#5B5E68" strokeWidth="2" />
            <circle cx="22" cy="26" r="8.5" fill="#181B2E" stroke="#4D5263" strokeWidth="1.5" />
            <circle cx="22" cy="49" r="8.5" fill="#181B2E" stroke="#4D5263" strokeWidth="1.5" />
            <circle cx="22" cy="72" r="8.5" fill="#181B2E" stroke="#4D5263" strokeWidth="1.5" />
            <circle cx="44" cy="36" r="6" fill="#181B2E" />
            <circle cx="44" cy="57" r="6" fill="#181B2E" />
          </g>
          {/* Screen + S Pen */}
          <g transform="translate(198, 40)">
            <rect x="0" y="0" width="108" height="222" rx="10" fill="#181A33" stroke="#53577A" strokeWidth="2" />
            <rect x="4" y="4" width="100" height="214" rx="7" fill="#1E2758" />
            <circle cx="54" cy="68" r="34" fill="#1499D6" opacity="0.45" />
            <circle cx="62" cy="148" r="28" fill="#A8C814" opacity="0.45" />
            <circle cx="54" cy="11" r="2.8" fill="#0B0D1D" />
          </g>
          {/* S Pen */}
          <g transform="translate(86, 74) rotate(-8)">
            <rect x="0" y="0" width="10" height="175" rx="5" fill="#26286B" />
            <rect x="2" y="0" width="6" height="16" rx="3" fill="#A8C814" />
            <polygon points="3,175 7,175 5,184" fill="#1499D6" />
          </g>
        </svg>
      );
    }

    case 'preset:xiaomi-14-ultra':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          <ellipse cx="200" cy="268" rx="95" ry="12" fill="#26286B" fillOpacity="0.08" />
          <g transform="translate(142, 34)">
            <rect x="0" y="0" width="116" height="224" rx="20" fill="#222536" stroke="#4D526B" strokeWidth="2" />
            {/* Iconic circular camera ring */}
            <circle cx="58" cy="58" r="36" fill="#141624" stroke="#1499D6" strokeWidth="2.5" />
            <circle cx="44" cy="46" r="9" fill="#26286B" stroke="#4E5585" strokeWidth="1.5" />
            <circle cx="72" cy="46" r="9" fill="#26286B" stroke="#4E5585" strokeWidth="1.5" />
            <circle cx="44" cy="70" r="9" fill="#26286B" stroke="#4E5585" strokeWidth="1.5" />
            <circle cx="72" cy="70" r="9" fill="#1499D6" opacity="0.7" />
            <rect x="44" y="196" width="28" height="4" rx="2" fill="#A8C814" opacity="0.7" />
          </g>
        </svg>
      );

    case 'preset:huawei-pura-70':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          <ellipse cx="200" cy="268" rx="95" ry="12" fill="#26286B" fillOpacity="0.08" />
          <g transform="translate(142, 34)">
            <rect x="0" y="0" width="116" height="224" rx="22" fill="#FFFFFF" stroke="#D1D7E2" strokeWidth="2.5" />
            {/* Triangular Pura island */}
            <path d="M16 18H70C74 18 76 22 73 26L44 68C40 73 34 73 30 68L13 28C10 23 12 18 16 18Z" fill="#E8EDF4" stroke="#C4CDDB" strokeWidth="1.5" />
            <circle cx="28" cy="30" r="9" fill="#26286B" />
            <circle cx="54" cy="30" r="7.5" fill="#1499D6" />
            <circle cx="38" cy="54" r="7.5" fill="#26286B" />
          </g>
        </svg>
      );

    case 'preset:accessories':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          {/* 20W USB-C Brick */}
          <g transform="translate(76, 86)">
            <rect x="0" y="0" width="84" height="96" rx="14" fill="white" stroke="#D5DCE6" strokeWidth="2" />
            <rect x="30" y="72" width="24" height="8" rx="4" fill="#26286B" opacity="0.8" />
            <circle cx="42" cy="36" r="14" fill="#1499D6" opacity="0.14" />
            <path d="M43 27L37 37H42L41 45L47 35H42L43 27Z" fill="#1499D6" />
          </g>
          {/* MagSafe Case */}
          <g transform="translate(182, 46)">
            <rect x="0" y="0" width="96" height="196" rx="20" fill="white" fillOpacity="0.82" stroke="#1499D6" strokeWidth="2.5" />
            <circle cx="48" cy="96" r="24" stroke="#26286B" strokeWidth="5" opacity="0.85" />
            <rect x="45.5" y="126" width="5" height="16" rx="2.5" fill="#26286B" opacity="0.85" />
          </g>
          {/* Wireless Earbuds case */}
          <g transform="translate(292, 134)">
            <rect x="0" y="0" width="64" height="58" rx="18" fill="white" stroke="#D5DCE6" strokeWidth="2" />
            <line x1="2" y1="22" x2="62" y2="22" stroke="#DCE2EC" strokeWidth="2" />
            <circle cx="32" cy="32" r="3" fill="#A8C814" />
          </g>
        </svg>
      );

    case 'preset:repair-bench':
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#EEF3F8" />
          <rect x="36" y="48" width="328" height="204" rx="18" fill="#1499D6" fillOpacity="0.12" stroke="#1499D6" strokeOpacity="0.35" strokeWidth="2" />
          {/* Phone being serviced */}
          <rect x="136" y="76" width="128" height="148" rx="16" fill="#26286B" />
          <rect x="148" y="88" width="104" height="124" rx="10" fill="#1C2054" />
          <rect x="162" y="102" width="44" height="66" rx="6" fill="#1499D6" opacity="0.55" />
          <rect x="214" y="102" width="24" height="32" rx="4" fill="#A8C814" opacity="0.85" />
          {/* Precision screwdriver */}
          <g transform="translate(72, 108) rotate(-18)">
            <rect x="0" y="0" width="12" height="72" rx="5" fill="#26286B" />
            <rect x="2" y="14" width="8" height="14" rx="2" fill="#A8C814" />
            <rect x="4.5" y="72" width="3" height="34" fill="#7D889E" />
          </g>
          {/* Check circle */}
          <circle cx="316" cy="92" r="22" fill="#A8C814" />
          <path d="M306 92L313 99L326 85" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'preset:store-showcase':
    default:
      return (
        <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
          <rect width="400" height="300" fill="#F3F5F8" />
          <path d="M40 230C120 270 280 265 360 170" stroke="#1499D6" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
          <path d="M56 246C136 280 296 272 372 192" stroke="#A8C814" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
          <rect x="92" y="64" width="90" height="164" rx="16" fill="white" stroke="#26286B" strokeWidth="2.5" />
          <rect x="158" y="48" width="96" height="184" rx="18" fill="#26286B" />
          <rect x="166" y="58" width="80" height="164" rx="12" fill="#1499D6" opacity="0.85" />
          <rect x="232" y="74" width="84" height="154" rx="16" fill="white" stroke="#A8C814" strokeWidth="2.5" />
        </svg>
      );
  }
}

export function DefaultFallbackIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F3F5F8] text-[#26286B]/40">
      <Smartphone className="h-10 w-10" />
    </div>
  );
}
