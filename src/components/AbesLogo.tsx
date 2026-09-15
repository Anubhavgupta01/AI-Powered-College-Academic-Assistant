type AbesLogoProps = {
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
};

export default function AbesLogo({
  size = 40,
  showText = true,
  variant = 'light',
  className = '',
}: AbesLogoProps) {
  const textColor = variant === 'light' ? 'text-ink-900' : 'text-white';
  const subColor = variant === 'light' ? 'text-ink-500' : 'text-primary-200';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-600/30"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Graduation cap */}
          <path
            d="M16 4L2 11L16 18L30 11L16 4Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M7 14V20C7 20 10 23 16 23C22 23 25 20 25 20V14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M30 11V18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="30" cy="19" r="1.5" fill="#ffd24a" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-extrabold text-lg tracking-tight ${textColor}`}>
            ABES
          </span>
          <span className={`text-[10px] font-semibold tracking-widest uppercase ${subColor}`}>
            Academic Assistant
          </span>
        </div>
      )}
    </div>
  );
}
