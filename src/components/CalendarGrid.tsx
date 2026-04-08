"use client";

import { isSameDay, isToday as isDateToday } from "date-fns";
import { DayCell } from "@/components/DayCell";
import {
  getCalendarDays,
  getHolidayLabel,
  isDateInClosedRange,
  isRangeStartOrEnd,
  normalizeRange,
} from "@/utils/dateUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type CalendarGridProps = {
  viewMonth: Date;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  hoveredDate: Date | null;
  onDayClick: (day: Date) => void;
  onDayHover: (day: Date | null) => void;
};

export function CalendarGrid({
  viewMonth,
  selectedStart,
  selectedEnd,
  hoveredDate,
  onDayClick,
  onDayHover,
}: CalendarGridProps) {
  const days = getCalendarDays(viewMonth);

  const preview =
    selectedStart && !selectedEnd && hoveredDate
      ? normalizeRange(selectedStart, hoveredDate)
      : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="mb-1 grid shrink-0 grid-cols-7 gap-0.5 text-center sm:mb-2 sm:gap-1">
        {WEEKDAYS.map((d, i) => {
          const isWeekend = i >= 5;
          return (
            <div
              key={d}
              className={[
                "py-1 text-[0.6rem] font-bold uppercase tracking-wide sm:py-2 sm:text-xs",
                isWeekend
                  ? "text-[var(--calendar-accent)]"
                  : "text-slate-600",
              ].join(" ")}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-0.5 sm:gap-1"
        style={{ gridTemplateRows: "repeat(6, minmax(0, 1fr))" }}
      >
        {days.map((day) => {
          const w = day.getDay();
          const isWeekend = w === 0 || w === 6;
          const holiday = getHolidayLabel(day);
          const { isStart, isEnd } = isRangeStartOrEnd(
            day,
            selectedStart,
            selectedEnd,
          );
          const inRange =
            !!selectedStart &&
            !!selectedEnd &&
            isDateInClosedRange(day, selectedStart, selectedEnd);
          const notEdgeButMiddle = inRange && !isStart && !isEnd;

          let isPreviewStart = false;
          let isPreviewEnd = false;
          let isPreviewInRange = false;
          if (preview) {
            const pin = isDateInClosedRange(day, preview.start, preview.end);
            isPreviewStart = isSameDay(day, preview.start);
            isPreviewEnd = isSameDay(day, preview.end);
            isPreviewInRange = pin && !isPreviewStart && !isPreviewEnd;
          }

          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              viewMonth={viewMonth}
              isWeekend={isWeekend}
              isToday={isDateToday(day)}
              holidayLabel={holiday}
              isRangeStart={isStart}
              isRangeEnd={isEnd}
              isInRange={notEdgeButMiddle}
              isPreviewInRange={isPreviewInRange}
              isPreviewStart={Boolean(preview && isPreviewStart)}
              isPreviewEnd={Boolean(preview && isPreviewEnd)}
              onClick={() => onDayClick(day)}
              onPointerEnter={() => onDayHover(day)}
              onPointerLeave={() => onDayHover(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
