import { ReactNode } from 'react';

interface CircularButtonProps {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'glass' | 'violet';
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-18 h-18', xl: 'w-20 h-20' };

const variantStyles: Record<string, React.CSSProperties> = {
  gradient: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 45%, #a855f7 100%)',
    boxShadow: '0 6px 0 rgba(99,102,241,0.55), 0 10px 24px rgba(99,102,241,0.3), inset 0 1.5px 0 rgba(255,255,255,0.3)',
  },
  glass: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 5px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
  },
  violet: {
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    boxShadow: '0 6px 0 rgba(109,40,217,0.55), 0 10px 24px rgba(109,40,217,0.3), inset 0 1.5px 0 rgba(255,255,255,0.25)',
  },
};

export function CircularButton({
  children,
  onClick,
  className = '',
  size = 'md',
  variant = 'glass',
  type = 'button',
}: CircularButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
      style={{
        ...variantStyles[variant],
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      }}
      onPointerDown={(e) => {
        e.currentTarget.style.transform = 'translateY(4px)';
        e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)';
      }}
      onPointerUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {children}
    </button>
  );
}
