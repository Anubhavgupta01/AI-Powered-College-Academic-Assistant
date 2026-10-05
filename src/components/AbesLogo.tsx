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
        className="relative flex items-center justify-center rounded-2xl bg-white shadow-sm border border-ink-100 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src="/abes-logo.png"
          alt="ABES Logo"
          className="w-full h-full object-contain p-1.5"
        />
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
