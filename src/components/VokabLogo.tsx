interface VokabLogoProps {
  /** 'dark' for light backgrounds, 'light' for dark backgrounds */
  variant?: 'dark' | 'light';
  /** Show "VOKAB" text next to icon */
  showText?: boolean;
  /** Icon size in pixels */
  size?: number;
  /** Optional className for the wrapper */
  className?: string;
}

export default function VokabLogo({
  variant = 'dark',
  showText = true,
  size = 28,
  className = '',
}: VokabLogoProps) {
  const isDark = variant === 'dark';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform="translate(10, 15)">
          {/* Back card */}
          <rect
            x="8"
            y="8"
            width="52"
            height="40"
            rx="5"
            fill={isDark ? '#e2e8f0' : 'rgba(255,255,255,0.15)'}
          />
          {/* Middle card */}
          <rect
            x="4"
            y="4"
            width="52"
            height="40"
            rx="5"
            fill={isDark ? '#cbd5e0' : 'rgba(255,255,255,0.25)'}
          />
          {/* Front card */}
          <rect
            x="0"
            y="0"
            width="52"
            height="40"
            rx="5"
            fill={isDark ? '#1a202c' : 'white'}
          />
          {/* V letter */}
          <text
            x="26"
            y="28"
            fontFamily="Arial, sans-serif"
            fontSize="22"
            fontWeight="700"
            fill={isDark ? 'white' : '#1a202c'}
            textAnchor="middle"
          >
            V
          </text>
        </g>
      </svg>
      {showText && (
        <span
          className={`font-bold text-lg tracking-tight ${
            isDark ? 'text-slate-800' : 'text-white'
          }`}
        >
          vokab
        </span>
      )}
    </span>
  );
}
