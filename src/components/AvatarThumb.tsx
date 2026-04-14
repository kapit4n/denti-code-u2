'use client';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase() || '?';
}

const sizeClass = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
} as const;

type Size = keyof typeof sizeClass;

type Props = {
  src?: string | null;
  /** Used for alt text and for initials when `src` is missing */
  name: string;
  size?: Size;
  className?: string;
};

export default function AvatarThumb({ src, name, size = 'sm', className = '' }: Props) {
  const ring = 'rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0';
  const dim = sizeClass[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} ${ring} ${className}`}
      />
    );
  }

  return (
    <span
      className={`${dim} ${ring} inline-flex items-center justify-center font-semibold text-gray-500 select-none ${className}`}
      title={name}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
}
