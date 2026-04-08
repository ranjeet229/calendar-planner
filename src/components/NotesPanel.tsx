"use client";

import { format } from "date-fns";

export type NotesPanelProps = {
  monthLabel: string;
  monthlyNotes: string;
  onMonthlyNotesChange: (value: string) => void;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  rangeNotes: string;
  onRangeNotesChange: (value: string) => void;
  hasFullRange: boolean;
};

export function NotesPanel({
  monthLabel,
  monthlyNotes,
  onMonthlyNotesChange,
  selectedStart,
  selectedEnd,
  rangeNotes,
  onRangeNotesChange,
  hasFullRange,
}: NotesPanelProps) {
  const rangeSummary =
    selectedStart && selectedEnd
      ? `${format(selectedStart, "MMM d")} → ${format(selectedEnd, "MMM d, yyyy")}`
      : selectedStart
        ? `${format(selectedStart, "MMM d, yyyy")} — pick end date`
        : null;

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-inner shadow-slate-200/50 backdrop-blur-sm sm:gap-3 sm:p-4 lg:p-5">
      <div className="flex min-h-0 min-w-0 flex-col flex-none min-[520px]:min-h-0 min-[520px]:flex-1">
        <h3 className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
          Notes
        </h3>
        <p className="mt-0.5 shrink-0 text-[0.65rem] text-slate-400 sm:text-xs">
          General notes for{" "}
          <span className="font-semibold text-slate-600">{monthLabel}</span>
        </p>
        <label htmlFor="monthly-notes" className="sr-only">
          Monthly notes
        </label>
        <textarea
          id="monthly-notes"
          value={monthlyNotes}
          onChange={(e) => onMonthlyNotesChange(e.target.value)}
          placeholder="Goals, reminders, or plans for this month..."
          className="mt-2 min-h-[6.5rem] w-full flex-none resize-y rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-[var(--calendar-accent)] transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-[var(--calendar-accent)] focus:ring-2 max-[519px]:max-h-[40vh] min-[520px]:min-h-0 min-[520px]:flex-1 min-[520px]:resize-none sm:px-3 sm:text-sm"
        />
      </div>

      <div className="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="flex min-h-0 min-w-0 flex-col flex-none min-[520px]:min-h-0 min-[520px]:flex-1">
        <h3 className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
          Selection
        </h3>
        {rangeSummary ? (
          <p className="mt-0.5 line-clamp-2 text-[0.65rem] font-medium text-[var(--calendar-accent)] sm:text-xs">
            {rangeSummary}
          </p>
        ) : (
          <p className="mt-0.5 shrink-0 text-[0.65rem] text-slate-400 sm:text-xs">
            Select a date range on the calendar to attach notes.
          </p>
        )}
        <label htmlFor="range-notes" className="sr-only">
          Notes for selected range
        </label>
        <textarea
          id="range-notes"
          value={rangeNotes}
          onChange={(e) => onRangeNotesChange(e.target.value)}
          disabled={!hasFullRange}
          placeholder={
            hasFullRange
              ? "Notes for this range..."
              : "Select start and end dates to enable"
          }
          className="mt-2 min-h-[5.25rem] w-full flex-none resize-y rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-[var(--calendar-accent)] transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-[var(--calendar-accent)] focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 max-[519px]:max-h-[32vh] min-[520px]:min-h-0 min-[520px]:flex-1 min-[520px]:resize-none sm:px-3 sm:text-sm"
        />
      </div>
    </aside>
  );
}
