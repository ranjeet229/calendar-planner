"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  addMonths,
  compareAsc,
  format,
  getYear,
  isSameDay,
  setYear,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CalendarGrid } from "@/components/CalendarGrid";
import { NotesPanel } from "@/components/NotesPanel";
import { accentSoftBackground, sampleAverageColorFromImage } from "@/utils/colorUtils";
import {
  fromDateKey,
  monthKey,
  normalizeRange,
  rangeStorageKey,
  toDateKey,
} from "@/utils/dateUtils";

const HERO_SRC =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80";

const LS_MONTHLY = "wall-calendar-monthly-notes-v1";
const LS_RANGE_BY_MONTH = "wall-calendar-range-by-month-v1";
const LS_RANGE_NOTES = "wall-calendar-range-notes-v1";

const YEAR_SELECT_MIN = 1950;
const YEAR_SELECT_MAX = 2080;

type RangeRecord = { start: string; end: string };
type RangeByMonth = Record<string, RangeRecord | null>;
type MonthlyNotes = Record<string, string>;
type RangeNotes = Record<string, string>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function Calendar() {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const [monthlyNotes, setMonthlyNotes] = useState("");
  const [rangeNotes, setRangeNotes] = useState("");

  const [accentHex, setAccentHex] = useState("#2563eb");

  const mk = monthKey(viewMonth);
  const monthTitle = format(viewMonth, "MMMM yyyy");
  const monthWord = format(viewMonth, "MMMM").toUpperCase();
  const yearNum = format(viewMonth, "yyyy");
  const viewYear = getYear(viewMonth);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = YEAR_SELECT_MIN; y <= YEAR_SELECT_MAX; y++) {
      years.push(y);
    }
    return years;
  }, []);

  const cssVars = useMemo(
    () =>
      ({
        "--calendar-accent": accentHex,
        "--calendar-accent-soft": accentSoftBackground(accentHex),
      }) as React.CSSProperties,
    [accentHex],
  );

  /* Persisted monthly notes + range when month changes */
  useEffect(() => {
    const allMonthly = readJson<MonthlyNotes>(LS_MONTHLY, {});
    setMonthlyNotes(allMonthly[mk] ?? "");

    const byMonth = readJson<RangeByMonth>(LS_RANGE_BY_MONTH, {});
    const rec = byMonth[mk];
    if (rec?.start && rec?.end) {
      setSelectedStart(fromDateKey(rec.start));
      setSelectedEnd(fromDateKey(rec.end));
    } else {
      setSelectedStart(null);
      setSelectedEnd(null);
    }
  }, [mk]);

  useEffect(() => {
    let cancelled = false;
    sampleAverageColorFromImage(HERO_SRC, "#2563eb").then((hex) => {
      if (!cancelled) setAccentHex(hex);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistMonthly = useCallback((key: string, text: string) => {
    const all = readJson<MonthlyNotes>(LS_MONTHLY, {});
    all[key] = text;
    writeJson(LS_MONTHLY, all);
  }, []);

  const handleMonthlyNotesChange = (value: string) => {
    setMonthlyNotes(value);
    persistMonthly(mk, value);
  };

  const persistRangeForMonth = useCallback(
    (monthId: string, start: Date | null, end: Date | null) => {
      const byMonth = readJson<RangeByMonth>(LS_RANGE_BY_MONTH, {});
      if (start && end) {
        byMonth[monthId] = {
          start: toDateKey(start),
          end: toDateKey(end),
        };
      } else {
        byMonth[monthId] = null;
      }
      writeJson(LS_RANGE_BY_MONTH, byMonth);
    },
    [],
  );

  useEffect(() => {
    if (selectedStart && selectedEnd) {
      const rk = rangeStorageKey(selectedStart, selectedEnd);
      const all = readJson<RangeNotes>(LS_RANGE_NOTES, {});
      setRangeNotes(all[rk] ?? "");
    } else {
      setRangeNotes("");
    }
  }, [selectedStart, selectedEnd]);

  const handleRangeNotesChange = (value: string) => {
    if (!selectedStart || !selectedEnd) return;
    setRangeNotes(value);
    const rk = rangeStorageKey(selectedStart, selectedEnd);
    const all = readJson<RangeNotes>(LS_RANGE_NOTES, {});
    all[rk] = value;
    writeJson(LS_RANGE_NOTES, all);
  };

  const handleDayClick = (day: Date) => {
    if (selectedStart && selectedEnd) {
      setSelectedStart(null);
      setSelectedEnd(null);
      persistRangeForMonth(mk, null, null);
      return;
    }

    if (!selectedStart) {
      setSelectedStart(day);
      setSelectedEnd(null);
      persistRangeForMonth(mk, null, null);
      return;
    }

    if (isSameDay(selectedStart, day)) {
      setSelectedEnd(day);
      persistRangeForMonth(mk, day, day);
      return;
    }

    const { start, end } = normalizeRange(selectedStart, day);
    setSelectedStart(start);
    setSelectedEnd(end);
    persistRangeForMonth(mk, start, end);
  };

  const changeMonth = (next: Date, dir: 1 | -1) => {
    setSlideDir(dir);
    setViewMonth(startOfMonth(next));
    setHoveredDate(null);
  };

  const goToday = () => {
    const today = new Date();
    const dir: 1 | -1 =
      compareAsc(startOfMonth(today), startOfMonth(viewMonth)) >= 0 ? 1 : -1;
    setSlideDir(dir);
    setViewMonth(startOfMonth(today));
    setHoveredDate(null);
  };

  const changeYear = (nextYear: number) => {
    const next = startOfMonth(setYear(viewMonth, nextYear));
    const dir: 1 | -1 =
      compareAsc(next, viewMonth) >= 0 ? 1 : -1;
    setSlideDir(dir);
    setViewMonth(next);
    setHoveredDate(null);
  };

  return (
    <div
      className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#020617_100%)] px-3 py-3 font-sans text-slate-900 sm:px-4 sm:py-4 lg:px-6"
      style={cssVars}
    >
      {/* Soft radial lift + cool edge tint to tie the canvas to the hero blues */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(15,23,42,0.5),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <div className="calendar-page relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:rounded-[2rem]">
          {/* Spiral / wire-o binding */}
          <div
            className="absolute left-4 right-4 top-0 z-20 flex justify-center gap-2 sm:left-8 sm:right-8"
            aria-hidden
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-3 w-2 rounded-full border border-slate-700/90 bg-gradient-to-b from-slate-700 to-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              />
            ))}
          </div>
          <div
            className="absolute left-1/2 top-1 z-20 h-4 w-10 -translate-x-1/2 rounded-b-xl border border-b-slate-800 border-t-0 bg-slate-900/90 shadow-md"
            aria-hidden
          />

          <div className="relative flex min-h-0 flex-1 flex-row items-stretch pt-5 lg:pt-6">
            {/* Hero strip: min height below lg so fill image has a non-zero box (flex + abs-only children). */}
            <div className="relative z-0 w-[min(32%,11rem)] shrink-0 self-stretch sm:w-[min(34%,14rem)] max-lg:min-h-[min(38vh,17rem)] lg:h-full lg:min-h-0 lg:w-[44%] lg:max-w-none">
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={HERO_SRC}
                  alt="Mountain landscape hero"
                  fill
                  priority
                  sizes="(max-width: 480px) 128px, (max-width: 1023px) 192px, 45vw"
                  className="object-cover object-[center_35%]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent"
                  aria-hidden
                />
                {/* Wave seam into content */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 lg:h-20">
                  <svg
                    className="h-full w-full text-white"
                    viewBox="0 0 1200 80"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M0,40 C200,8 400,72 600,40 C800,8 1000,72 1200,40 L1200,80 L0,80 Z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Main column */}
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
              <header className="relative shrink-0 px-4 pb-1 pt-2 sm:px-6 sm:pb-2 sm:pt-1 lg:px-8 lg:pt-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Planner
                    </p>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                      {monthTitle}
                    </h1>
                  </div>

                  <div className="flex w-full max-w-full flex-nowrap items-center gap-1.5 self-stretch overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto sm:max-w-none sm:gap-2 sm:self-auto sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                    <div className="flex shrink-0 items-center">
                      <label
                        htmlFor="calendar-year"
                        className="sr-only"
                      >
                        Year
                      </label>
                      <select
                        id="calendar-year"
                        value={viewYear}
                        onChange={(e) =>
                          changeYear(Number.parseInt(e.target.value, 10))
                        }
                        className="h-9 min-w-[4.25rem] cursor-pointer rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm outline-none transition hover:border-[var(--calendar-accent)] focus:border-[var(--calendar-accent)] focus:ring-2 focus:ring-[var(--calendar-accent)] sm:h-11 sm:min-w-[5.25rem] sm:px-3 sm:text-sm"
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        changeMonth(subMonths(viewMonth, 1), -1)
                      }
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[var(--calendar-accent)] hover:text-[var(--calendar-accent)] active:scale-95 sm:h-11 sm:w-11"
                      aria-label="Previous month"
                    >
                      <Chevron dir="left" />
                    </button>
                    <button
                      type="button"
                      onClick={goToday}
                      className="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:border-[var(--calendar-accent)] hover:text-[var(--calendar-accent)] sm:h-11 sm:px-4 sm:text-sm"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        changeMonth(addMonths(viewMonth, 1), 1)
                      }
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[var(--calendar-accent)] hover:text-[var(--calendar-accent)] active:scale-95 sm:h-11 sm:w-11"
                      aria-label="Next month"
                    >
                      <Chevron dir="right" />
                    </button>
                  </div>
                </div>

                {/* Wall-calendar style month ribbon */}
                <div className="mt-3 flex justify-end sm:mt-4">
                  <div
                    className="relative flex min-w-[min(100%,220px)] items-stretch justify-end overflow-hidden rounded-l-2xl bg-[var(--calendar-accent)] pl-8 pr-4 py-3 text-white shadow-lg sm:min-w-[min(100%,260px)] sm:pl-10 sm:pr-6 sm:py-4"
                    style={{
                      clipPath:
                        "polygon(12% 0, 100% 0, 100% 100%, 0% 100%, 8% 55%, 0% 35%)",
                    }}
                  >
                    <div className="text-right leading-none">
                      <p className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                        {yearNum}
                      </p>
                      <p className="mt-1 text-xs font-bold tracking-[0.18em] sm:mt-2 sm:text-sm lg:text-base">
                        {monthWord}
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto px-4 pb-3 pt-1 min-[520px]:grid min-[520px]:grid-cols-[minmax(0,200px)_minmax(0,1fr)] min-[520px]:gap-4 min-[520px]:overflow-hidden min-[520px]:pb-4 sm:px-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-6 lg:px-8 lg:pb-5">
                <div className="order-2 flex w-full min-h-0 min-w-0 shrink-0 min-[520px]:order-1 min-[520px]:h-full min-[520px]:min-h-0 min-[520px]:shrink min-[520px]:w-auto">
                  <NotesPanel
                    monthLabel={monthTitle}
                    monthlyNotes={monthlyNotes}
                    onMonthlyNotesChange={handleMonthlyNotesChange}
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    rangeNotes={rangeNotes}
                    onRangeNotesChange={handleRangeNotesChange}
                    hasFullRange={Boolean(selectedStart && selectedEnd)}
                  />
                </div>

                <div className="order-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-[519px]:min-h-[min(52vw,14rem)] min-[520px]:order-2 min-[520px]:flex-1">
                  <div
                    key={mk}
                    className="calendar-month-animate flex min-h-0 min-w-0 flex-1 flex-col"
                    data-slide={slideDir}
                  >
                    <CalendarGrid
                      viewMonth={viewMonth}
                      selectedStart={selectedStart}
                      selectedEnd={selectedEnd}
                      hoveredDate={hoveredDate}
                      onDayClick={handleDayClick}
                      onDayHover={setHoveredDate}
                    />
                  </div>
                  <p className="mt-1 shrink-0 text-center text-[0.65rem] text-slate-400 sm:text-xs lg:text-left">
                    Tap dates: start → end. With a full range, tap again to
                    clear.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}
