import { ReactNode } from 'react';

interface CircularButtonProps {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'glass' | 'violet';
  type?: 'button' | 'submit' | 'reset';
}

export function CircularButton({
  children,
  onClick,
  className = '',
  size = 'md',
  variant = 'glass',
  type = 'button',
}: CircularButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const variantClasses = {
    gradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-400',
    glass: 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg border-2 border-white/30',
    violet: 'bg-gradient-to-br from-violet-600 to-purple-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        ${variantClasses[variant]}
        shadow-lg transition-all duration-300
        hover:scale-110 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]
        active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
}
