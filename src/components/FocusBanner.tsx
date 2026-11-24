import { CheckCircle2, Pause, Play, RotateCcw, Timer, X } from 'lucide-react';
import { formatCountdown } from '../utils/tasks';
import type { Task } from '../types/task';

interface FocusBannerProps {
  task: Task;
  secondsLeft: number;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onCompleteTask: () => void;
  onStop: () => void;
}

export function FocusBanner({
  task,
  secondsLeft,
  isRunning,
  onToggleRun,
  onReset,
  onCompleteTask,
  onStop,
}: FocusBannerProps) {
  const totalSeconds = 25 * 60;
  const progress = Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <section
      aria-label="Active focus timer"
      className="overflow-hidden rounded-xl border border-blue-200 bg-blue-50/60 shadow-xs"
    >
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Timer className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-700">
              {secondsLeft === 0 ? 'Focus session complete' : isRunning ? 'Focus session running' : 'Focus session paused'}
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {task.title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <span
            data-testid="focus-countdown"
            className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 font-mono text-base font-semibold text-slate-900 tabular-nums"
          >
            {formatCountdown(secondsLeft)}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleRun}
              aria-label={isRunning ? 'Pause focus timer' : 'Resume focus timer'}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              aria-label="Reset focus timer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onCompleteTask}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Finish Task</span>
            </button>

            <button
              type="button"
              onClick={onStop}
              aria-label="Close focus timer"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-100/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-blue-100">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
