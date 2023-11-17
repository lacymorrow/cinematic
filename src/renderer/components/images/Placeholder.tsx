import { cn } from '@/lib/utils';

export function MoviePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full',
        className,
      )}
    >
      <svg
        className="w-16 h-16 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 2a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2H2zm2 2h12v9H4V4zm0 11v2h12v-2H4zm13-1V4h2v12h-2zM2 4h2v12H2V4z"
        />
      </svg>
    </div>
  );
}
