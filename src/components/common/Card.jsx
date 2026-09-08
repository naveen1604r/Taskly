import React from 'react';

/**
 * Reusable Card component for dashboard widgets and content containers
 * @param {string} title - Optional card header title
 * @param {string} subtitle - Optional card header subtitle
 * @param {React.ReactNode} action - Optional header action (button, link, badge)
 * @param {boolean} hoverable - Add interactive hover elevation
 * @param {'none' | 'sm' | 'md' | 'lg'} padding - Card content padding
 */
export default function Card({
  title,
  subtitle,
  action,
  hoverable = false,
  padding = 'md',
  className = '',
  children,
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-[#11151F] rounded-2xl border border-white/[0.08] shadow-card backdrop-blur-xs
        ${hoverable ? 'transition-all duration-200 hover:border-white/[0.15] hover:shadow-hover cursor-pointer' : ''}
        ${paddingStyles[padding] || paddingStyles.md}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
