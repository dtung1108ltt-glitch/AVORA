import { useEffect, useRef } from 'react';

type FriendlyErrorPageProps = {
  onReset: () => void;
  onGoHome: () => void;
};

export default function FriendlyErrorPage({ onReset, onGoHome }: FriendlyErrorPageProps) {
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    retryButtonRef.current?.focus();
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-12 text-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100">
      <div role="alert" aria-live="assertive" className="max-w-xl rounded-3xl border border-sky-200 bg-sky-50 p-8 shadow-lg shadow-sky-200/20 dark:border-sky-800 dark:bg-sky-950/80 dark:shadow-sky-950/20">
        <h1 className="text-2xl font-semibold text-sky-900 dark:text-sky-100 mb-3">Có lỗi xảy ra. Vui lòng thử lại.</h1>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">Something went wrong. Please try again.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            ref={retryButtonRef}
            onClick={onReset}
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          >
            Thử lại / Retry
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-sky-500 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
          >
            Về Dashboard / Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
