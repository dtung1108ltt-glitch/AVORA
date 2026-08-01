import Skeleton from './Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                <Skeleton width="48px" height="48px" rounded />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton width="75%" height="14px" />
                <Skeleton width="45%" height="12px" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Skeleton width="25%" height="18px" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <Skeleton width="85%" height="14px" />
              <Skeleton width="65%" height="12px" className="mt-3" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="100%" height="12px" className="mt-3" />
              <Skeleton width="80%" height="12px" className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
