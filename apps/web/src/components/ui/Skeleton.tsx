type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  lines?: number;
};

const baseClasses = 'animate-pulse motion-reduce:animate-none bg-stone-200 dark:bg-zinc-700';

export default function Skeleton({ className = '', width = '100%', height = '1rem', rounded = true, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${rounded ? 'rounded-2xl' : 'rounded'} h-4 w-full`}
            style={{ width: typeof width === 'number' ? `${width}%` : width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${rounded ? 'rounded-2xl' : 'rounded'} ${className}`}
      style={{ width: typeof width === 'number' ? `${width}%` : width, height }}
    />
  );
}
