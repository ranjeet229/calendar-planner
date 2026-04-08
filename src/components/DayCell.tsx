"use client";

import { isSameMonth } from "date-fns";

export type DayCellProps = {
  day: Date;
  viewMonth: Date;
  isWeekend: boolean;
  isToday: boolean;
  holidayLabel: string | null;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isPreviewInRange: boolean;
  isPreviewStart: boolean;
  isPreviewEnd: boolean;
  onClick: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

export function DayCell({
  day,
  viewMonth,
  isWeekend,
  isToday,
  holidayLabel,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isPreviewInRange,
  isPreviewStart,
  isPreviewEnd,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: DayCellProps) {
  const inCurrentMonth = isSameMonth(day, viewMonth);
  const dayNum = day.getDate();

  let cellBg = "";
  let textClass = inCurrentMonth ? "text-slate-800" : "text-slate-400";
  const weekendTone =
    inCurrentMonth && isWeekend ? "text-[var(--calendar-accent)]" : "";
  if (weekendTone && inCurrentMonth) {
    textClass = weekendTone;
  }
  if (!inCurrentMonth) {
    textClass = "text-slate-400";
  }

  const showPreview =
    isPreviewInRange || isPreviewStart || isPreviewEnd;
  const committed =
    isInRange || isRangeStart || isRangeEnd;

  if (committed) {
    if (isRangeStart || isRangeEnd) {
      cellBg =
        "bg-[var(--calendar-accent)] text-white shadow-sm";
      textClass = "text-white";
    } else if (isInRange) {
      cellBg = "bg-[var(--calendar-accent-soft)]";
    }
  } else if (showPreview) {
    if (isPreviewStart || isPreviewEnd) {
      cellBg =
        "bg-[var(--calendar-accent-soft)] ring-2 ring-inset ring-[var(--calendar-accent)]/35";
    } else {
      cellBg = "bg-[var(--calendar-accent-soft)]/80";
    }
  }

  if (
    (isInRange && !isRangeStart && !isRangeEnd) ||
    (showPreview &&
      isPreviewInRange &&
      !isPreviewStart &&
      !isPreviewEnd)
  ) {
    textClass = inCurrentMonth ? "text-slate-800" : "text-slate-500";
  }

  const rounded =
    isRangeStart && isRangeEnd
      ? "rounded-xl"
      : isRangeStart || isPreviewStart
        ? "rounded-l-xl"
        : isRangeEnd || isPreviewEnd
          ? "rounded-r-xl"
          : committed && isInRange && !isRangeStart && !isRangeEnd
            ? "rounded-none"
            : "rounded-xl";

  const todayRing =
    isToday && !(isRangeStart || isRangeEnd)
      ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-white"
      : isToday && (isRangeStart || isRangeEnd)
        ? "ring-2 ring-white/80 ring-inset"
        : "";

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={[
        "relative flex h-full min-h-0 w-full flex-col items-center justify-center px-0.5 py-0.5 text-center text-xs font-medium transition-colors duration-150 sm:py-1 sm:text-sm lg:text-base",
        rounded,
        todayRing,
        cellBg,
        !cellBg && "hover:bg-slate-100/90 active:bg-slate-200/80",
        textClass,
        !inCurrentMonth && "opacity-80",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={holidayLabel ? `${dayNum}, ${holidayLabel}` : String(dayNum)}
    >
      <span className="tabular-nums">{dayNum}</span>
      {holidayLabel ? (
        <span
          className={[
            "mt-0.5 max-w-full truncate px-0.5 text-[0.55rem] font-semibold leading-none sm:text-[0.6rem]",
            isRangeStart || isRangeEnd
              ? "text-amber-100"
              : "text-amber-700",
          ].join(" ")}
          title={holidayLabel}
        >
          {holidayLabel.split(" ")[0]}
        </span>
      ) : null}
    </button>
  );
}
