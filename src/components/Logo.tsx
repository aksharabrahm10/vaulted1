export function LogoMark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="url(#vaulted-grad)" />
      <path d="M14 10h20v28l-3-2-3 2-3-2-3 2-3-2-3 2-2-1.5V10z" fill="white" fillOpacity="0.95" />
      <rect x="18" y="16" width="12" height="1.8" rx="0.9" fill="#3155d9" fillOpacity="0.7" />
      <rect x="18" y="20" width="8" height="1.5" rx="0.75" fill="#3155d9" fillOpacity="0.4" />
      <rect x="18" y="24" width="10" height="1.5" rx="0.75" fill="#3155d9" fillOpacity="0.4" />
      <rect x="18" y="28" width="6" height="1.5" rx="0.75" fill="#3155d9" fillOpacity="0.4" />
      <path d="M33 13.5l0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8 0.8-2.2z" fill="#fbbf24" />
      <defs>
        <linearGradient id="vaulted-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3155d9" />
          <stop offset="1" stopColor="#243fa0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ size = 48, className = '', showText = false }: { size?: number; className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-extrabold tracking-tight text-ink-900 dark:text-ink-100" style={{ fontSize: size * 0.45 }}>
          Vaulted
        </span>
      )}
    </div>
  );
}
