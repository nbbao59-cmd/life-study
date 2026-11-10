import React from 'react';

/**
 * 1. Ngọn Hải Đăng Dẫn Lối (Lighthouse Beacon Illustration)
 */
export function LighthouseIllustration({ className = '', width = 360, height = 220 }: { className?: string; width?: number | string; height?: number | string }) {
  return (
    <svg
      viewBox="0 0 400 240"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg lighthouse-svg ${className}`}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#08203e" />
          <stop offset="60%" stopColor="#0f3460" />
          <stop offset="100%" stopColor="#1e5f74" />
        </linearGradient>
        <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0077b6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#03045e" />
        </linearGradient>
        <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#fef9c3" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cliffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>

      {/* Sky Background */}
      <rect width="400" height="240" rx="20" fill="url(#skyGrad)" />

      {/* Stars */}
      <circle cx="45" cy="38" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="85" cy="55" r="1.2" fill="#fef08a" opacity="0.9" />
      <circle cx="140" cy="28" r="1.8" fill="#ffffff" opacity="0.85" />
      <circle cx="210" cy="42" r="1.3" fill="#ffffff" opacity="0.75" />
      <circle cx="270" cy="25" r="1.6" fill="#fde047" opacity="0.9" />
      <circle cx="330" cy="48" r="1.2" fill="#ffffff" opacity="0.8" />
      <circle cx="370" cy="32" r="1.5" fill="#ffffff" opacity="0.7" />

      {/* Crescent Moon */}
      <path
        d="M345 35 A16 16 0 1 0 361 51 A13 13 0 1 1 345 35 Z"
        fill="#fef08a"
        filter="drop-shadow(0 0 8px rgba(254, 240, 138, 0.6))"
      />

      {/* Sweeping Light Beams */}
      <polygon points="120,95 380,20 400,120" fill="url(#beamGrad)" />
      <polygon points="120,95 20,40 0,110" fill="url(#beamGrad)" opacity="0.5" />

      {/* Layered Sea Waves */}
      <path
        d="M0 160 Q 60 148, 120 160 T 240 158 T 360 162 T 400 160 L 400 240 L 0 240 Z"
        fill="url(#seaGrad)"
        opacity="0.9"
      />
      <path
        d="M0 180 Q 70 170, 140 180 T 280 176 T 400 182 L 400 240 L 0 240 Z"
        fill="#023e8a"
        opacity="0.8"
      />
      <path
        d="M0 205 Q 80 195, 160 205 T 320 202 T 400 208 L 400 240 L 0 240 Z"
        fill="#03045e"
      />

      {/* Foam Crests */}
      <path d="M40 170 Q 70 165, 100 170" stroke="#90e0ef" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M220 188 Q 260 183, 300 188" stroke="#90e0ef" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M130 215 Q 170 210, 210 215" stroke="#caf0f8" strokeWidth="2" strokeLinecap="round" />

      {/* Rocky Cliff */}
      <polygon points="40,240 70,150 140,150 165,190 190,240" fill="url(#cliffGrad)" />

      {/* Lighthouse Tower */}
      {/* Base */}
      <rect x="104" y="142" width="32" height="10" rx="2" fill="#374151" />
      {/* Tower Body */}
      <polygon points="107,142 112,96 128,96 133,142" fill="#f8fafc" />
      {/* Red Stripes */}
      <polygon points="109,132 110,120 130,120 131,132" fill="#e11d48" />
      <polygon points="111,110 112,102 128,102 129,110" fill="#e11d48" />
      {/* Lantern Room Platform */}
      <rect x="108" y="93" width="24" height="4" rx="1" fill="#1f2937" />
      {/* Lantern Glass Room */}
      <rect x="112" y="83" width="16" height="11" rx="2" fill="#fef08a" opacity="0.95" filter="drop-shadow(0 0 6px #fef08a)" />
      {/* Lantern Dome Roof */}
      <path d="M110 83 Q 120 72, 130 83 Z" fill="#1e293b" />
      <circle cx="120" cy="72" r="2" fill="#fbbf24" />

      {/* Seagulls in flight */}
      <path d="M240 90 Q 248 83, 256 90 Q 264 83, 272 90" stroke="#f8fafc" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M275 110 Q 281 104, 287 110 Q 293 104, 299 110" stroke="#f8fafc" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M190 75 Q 196 70, 202 75 Q 208 70, 214 75" stroke="#f8fafc" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/**
 * 2. Thuyền Buồm Hải Trình (Nautical Sailing Ship)
 */
export function NauticalShipIllustration({ className = '', width = 160, height = 120 }: { className?: string; width?: number | string; height?: number | string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg ship-svg ${className}`}
    >
      <defs>
        <linearGradient id="hullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="sailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* Water Waves */}
      <path d="M10 135 Q 35 125, 60 135 T 110 135 T 160 135 T 195 135" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 145 Q 50 138, 80 145 T 140 145 T 190 145" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

      {/* Wooden Ship Hull */}
      <path
        d="M35 120 C 45 138, 140 138, 165 120 L 155 108 L 48 108 Z"
        fill="url(#hullGrad)"
        stroke="#92400e"
        strokeWidth="2"
      />
      {/* Gold Trim & Portholes */}
      <path d="M48 114 L 155 114" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="68" cy="122" r="2.5" fill="#fbbf24" />
      <circle cx="95" cy="122" r="2.5" fill="#fbbf24" />
      <circle cx="122" cy="122" r="2.5" fill="#fbbf24" />

      {/* Masts */}
      <line x1="75" y1="110" x2="75" y2="40" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="120" y1="110" x2="120" y2="28" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />

      {/* Fore Sail */}
      <path
        d="M75 48 C 60 60, 55 85, 75 92 C 65 75, 70 58, 75 48 Z"
        fill="url(#sailGrad)"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />

      {/* Main Sails */}
      <path
        d="M120 34 C 95 48, 92 78, 120 86 C 108 66, 112 48, 120 34 Z"
        fill="url(#sailGrad)"
        stroke="#cbd5e1"
        strokeWidth="1.2"
      />
      <path
        d="M120 88 C 102 96, 100 108, 120 108 C 110 102, 114 92, 120 88 Z"
        fill="url(#sailGrad)"
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* Jib / Front Sail */}
      <path d="M120 32 L 175 106 L 125 106 Z" fill="#f8fafc" opacity="0.9" stroke="#cbd5e1" strokeWidth="1" />

      {/* Pirate/Naval Pennant Flag */}
      <path d="M120 28 L 138 32 L 120 36 Z" fill="#0284c7" />
    </svg>
  );
}

/**
 * 3. La Bàn Hải Quân Cổ (Nautical Compass Rose)
 */
export function OceanCompassRose({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg compass-svg ${className}`}
    >
      <circle cx="50" cy="50" r="46" stroke="#fbbf24" strokeWidth="2.5" fill="#0f2942" />
      <circle cx="50" cy="50" r="40" stroke="rgba(254, 243, 199, 0.4)" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="34" stroke="#0284c7" strokeWidth="1.5" />

      {/* 4 Major Points */}
      {/* North */}
      <polygon points="50,14 55,50 50,45" fill="#f43f5e" />
      <polygon points="50,14 45,50 50,45" fill="#fb7185" />
      {/* South */}
      <polygon points="50,86 55,50 50,55" fill="#0284c7" />
      <polygon points="50,86 45,50 50,55" fill="#38bdf8" />
      {/* East */}
      <polygon points="86,50 50,55 55,50" fill="#0284c7" />
      <polygon points="86,50 50,45 55,50" fill="#38bdf8" />
      {/* West */}
      <polygon points="14,50 50,55 45,50" fill="#0284c7" />
      <polygon points="14,50 50,45 45,50" fill="#38bdf8" />

      {/* Center Brass Rivet */}
      <circle cx="50" cy="50" r="6" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
    </svg>
  );
}

/**
 * 4. Rương Kho Báu Đáy Biển (Sunken Treasure Chest)
 */
export function SunkenTreasureIllustration({ width = 180, height = 130, className = '' }: { width?: number | string; height?: number | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg treasure-svg ${className}`}
    >
      <defs>
        <radialGradient id="pearlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Radiating Light from inside chest */}
      <circle cx="100" cy="75" r="55" fill="url(#pearlGlow)" />

      {/* Sand floor with sea pebbles */}
      <path d="M10 130 Q 60 122, 100 128 T 190 126 L 195 150 L 5 150 Z" fill="#d97706" opacity="0.3" />
      <circle cx="45" cy="136" r="3" fill="#cbd5e1" opacity="0.6" />
      <circle cx="160" cy="134" r="4" fill="#cbd5e1" opacity="0.5" />

      {/* Seaweed */}
      <path d="M25 140 Q 18 105, 30 80 Q 20 60, 26 40" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85" />
      <path d="M35 140 Q 42 110, 36 90 Q 45 75, 40 55" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M175 140 Q 182 115, 172 90 Q 180 70, 175 50" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* Rising Air Bubbles */}
      <circle cx="85" cy="40" r="4.5" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(255,255,255,0.4)" />
      <circle cx="115" cy="25" r="6" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(255,255,255,0.4)" />
      <circle cx="95" cy="12" r="3" stroke="#38bdf8" strokeWidth="1.5" fill="rgba(255,255,255,0.4)" />

      {/* Chest Base */}
      <path d="M50 85 L 60 125 L 140 125 L 150 85 Z" fill="#78350f" stroke="#451a03" strokeWidth="3" />
      {/* Gold Bands */}
      <line x1="68" y1="85" x2="74" y2="125" stroke="#fbbf24" strokeWidth="4" />
      <line x1="132" y1="85" x2="126" y2="125" stroke="#fbbf24" strokeWidth="4" />

      {/* Gold Doubloons & Pearl Jewels Inside */}
      <ellipse cx="100" cy="85" rx="36" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
      <circle cx="88" cy="82" r="5" fill="#fef08a" stroke="#d97706" />
      <circle cx="102" cy="80" r="5" fill="#fef08a" stroke="#d97706" />
      <circle cx="114" cy="83" r="5" fill="#fef08a" stroke="#d97706" />
      {/* Glowing Giant Pearl */}
      <circle cx="100" cy="74" r="8" fill="#ffffff" filter="drop-shadow(0 0 8px #38bdf8)" />

      {/* Open Curved Lid */}
      <path
        d="M45 80 C 45 45, 155 45, 155 80 C 145 74, 55 74, 45 80 Z"
        fill="#92400e"
        stroke="#451a03"
        strokeWidth="3"
      />
      <path d="M68 53 C 72 70, 72 75, 72 78" stroke="#fbbf24" strokeWidth="4" fill="none" />
      <path d="M132 53 C 128 70, 128 75, 128 78" stroke="#fbbf24" strokeWidth="4" fill="none" />

      {/* Keyhole Lock Plate */}
      <rect x="94" y="92" width="12" height="15" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="100" cy="97" r="2" fill="#451a03" />
      <polygon points="99,97 101,97 100.5,103 99.5,103" fill="#451a03" />
    </svg>
  );
}

/**
 * 5. Rạn San Hô Phát Quang (Bioluminescent Coral Reef)
 */
export function BioluminescentCoralIllustration({ width = 190, height = 130, className = '' }: { width?: number | string; height?: number | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg coral-svg ${className}`}
    >
      {/* Background Ambience */}
      <ellipse cx="100" cy="90" rx="70" ry="40" fill="rgba(14, 165, 233, 0.15)" />

      {/* Deep Brain Coral */}
      <path
        d="M30 140 C 20 115, 35 95, 60 95 C 80 95, 90 115, 80 140 Z"
        fill="#ec4899"
        opacity="0.85"
      />
      <path d="M40 120 Q 50 110, 60 120 T 70 115" stroke="#fbcfe8" strokeWidth="2" fill="none" />
      <path d="M45 130 Q 55 125, 65 130" stroke="#fbcfe8" strokeWidth="2" fill="none" />

      {/* Tall Glowing Staghorn Coral */}
      <path
        d="M130 140 L 132 80 C 132 70, 120 60, 122 45 M 132 80 C 136 68, 148 60, 146 42 M 132 95 C 145 88, 158 85, 162 70"
        stroke="#38bdf8"
        strokeWidth="6"
        strokeLinecap="round"
        filter="drop-shadow(0 0 6px #38bdf8)"
      />

      {/* Fan Coral */}
      <path
        d="M85 140 Q 95 85, 110 65 Q 120 95, 105 140 Z"
        fill="#f59e0b"
        opacity="0.9"
      />
      <circle cx="105" cy="75" r="3" fill="#fef08a" />
      <circle cx="95" cy="90" r="3" fill="#fef08a" />

      {/* Little Neon Clownfish */}
      <path
        d="M60 45 C 75 38, 85 45, 90 48 L 98 42 L 95 48 L 98 54 L 90 48 C 85 52, 75 58, 60 51 Z"
        fill="#f97316"
      />
      <path d="M72 41 Q 74 48, 72 55" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="64" cy="46" r="1.5" fill="#000000" />

      {/* Floating Luminescent Jellyfish */}
      <path d="M155 30 C 145 30, 145 18, 155 18 C 165 18, 165 30, 155 30 Z" fill="#c084fc" opacity="0.85" filter="drop-shadow(0 0 5px #c084fc)" />
      <path d="M150 30 Q 148 42, 151 50" stroke="#e9d5ff" strokeWidth="1" fill="none" />
      <path d="M155 30 Q 157 42, 154 52" stroke="#e9d5ff" strokeWidth="1" fill="none" />
      <path d="M160 30 Q 162 42, 159 50" stroke="#e9d5ff" strokeWidth="1" fill="none" />
    </svg>
  );
}

/**
 * 6. Sóng Thủy Triều Toán Học (Tidal Wave Graph Illustration)
 */
export function TidalWaveGraphIllustration({ width = '100%', height = 90, className = '' }: { width?: number | string; height?: number | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 600 120"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ocean-svg tidal-svg ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="tideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      <line x1="0" y1="60" x2="600" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

      {/* Tidal Sine Wave fill */}
      <path
        d="M 0 60 Q 75 15, 150 60 T 300 60 T 450 60 T 600 60 L 600 120 L 0 120 Z"
        fill="url(#tideGrad)"
      />

      {/* Tidal Sine Wave line */}
      <path
        d="M 0 60 Q 75 15, 150 60 T 300 60 T 450 60 T 600 60"
        stroke="#0284c7"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Secondary Ebb Wave */}
      <path
        d="M 0 60 Q 75 95, 150 60 T 300 60 T 450 60 T 600 60"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeDasharray="5 5"
        opacity="0.75"
      />

      {/* High Tide Peak Beacon */}
      <circle cx="75" cy="26" r="6" fill="#f43f5e" filter="drop-shadow(0 0 6px #f43f5e)" />
      <circle cx="75" cy="26" r="2.5" fill="#ffffff" />

      {/* Low Tide Resting Peak */}
      <circle cx="375" cy="26" r="6" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)" />
      <circle cx="375" cy="26" r="2.5" fill="#ffffff" />
    </svg>
  );
}

/**
 * 7. Mỏ Neo Hàng Hải (Nautical Anchor Icon)
 */
export function AnchorNauticalIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ocean-ico ${className}`}
    >
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M5 12h14" />
      <path d="M5 15a7 7 0 0 0 14 0" />
    </svg>
  );
}

/**
 * 8. Bánh Lái Tàu Thủy (Ship's Helm Wheel Icon)
 */
export function ShipWheelNauticalIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ocean-ico ${className}`}
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="12" y1="1" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="1" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" />
      <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" />
    </svg>
  );
}

/**
 * 9. Vỏ Sò Ngọc Trai (Seashell & Pearl Icon)
 */
export function ShellPearlNauticalIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ocean-ico ${className}`}
    >
      <path d="M12 21 C 7 21, 3 17, 3 12 C 3 7, 7 3, 12 3 C 17 3, 21 7, 21 12 C 21 17, 17 21, 12 21 Z" />
      <path d="M12 3 L 12 21" strokeDasharray="2 2" />
      <path d="M7 6 Q 10 14, 12 21" />
      <path d="M17 6 Q 14 14, 12 21" />
      <circle cx="12" cy="15" r="2.5" fill="#fef08a" stroke="#d97706" />
    </svg>
  );
}
