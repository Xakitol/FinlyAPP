import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5
        border border-white/20 rounded-3xl shadow-2xl overflow-hidden
        ${hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{
        boxShadow:
          '0 8px 32px 0 rgba(0, 212, 212, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
