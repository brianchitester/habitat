"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLocalDateString,
  getMonthLabel,
  getFirstDayOfMonth,
  getDaysInMonth,
} from "@/lib/dates";
import type { HeatmapEntry } from "@/lib/types";

interface MonthCalendarProps {
  entries: HeatmapEntry[];
  dailyTarget: number;
  color: string;
}

interface CalendarCell {
  date: string;
  day: number;
  count: number;
  isCurrentMonth: boolean;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ entries, dailyTarget, color }: MonthCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  function goToPrevMonth() {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function goToNextMonth() {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      map.set(entry.date, entry.count);
    }
    return map;
  }, [entries]);

  const cells = useMemo((): CalendarCell[] => {
    const firstDow = getFirstDayOfMonth(year, month); // 0=Sun
    const daysInMonth = getDaysInMonth(year, month);

    const result: CalendarCell[] = [];

    // Leading days from previous month
    if (firstDow > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevDays = getDaysInMonth(prevYear, prevMonth);
      for (let i = firstDow - 1; i >= 0; i--) {
        const day = prevDays - i;
        const date = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        result.push({ date, day, count: countMap.get(date) ?? 0, isCurrentMonth: false });
      }
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      result.push({ date, day, count: countMap.get(date) ?? 0, isCurrentMonth: true });
    }

    // Trailing days from next month
    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let day = 1; day <= remaining; day++) {
        const date = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        result.push({ date, day, count: countMap.get(date) ?? 0, isCurrentMonth: false });
      }
    }

    return result;
  }, [year, month, countMap]);

  const today = getLocalDateString();

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const dots = Math.min(cell.count, 4);
          const hasEntries = cell.count > 0;
          const isToday = cell.date === today;

          return (
            <div
              key={cell.date}
              className="flex flex-col items-center py-2"
              style={{
                opacity: cell.isCurrentMonth ? 1 : 0.3,
              }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded-md text-sm relative"
                style={{
                  backgroundColor: hasEntries
                    ? `color-mix(in srgb, ${color} ${Math.min(Math.round((cell.count / dailyTarget) * 40) + 10, 50)}%, transparent)`
                    : undefined,
                  outline: isToday ? `1.5px solid ${color}` : undefined,
                  outlineOffset: isToday ? "-0.5px" : undefined,
                }}
              >
                {cell.day}
              </div>
              {/* Colored dots */}
              {dots > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: dots }, (_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: month label + navigation */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {getMonthLabel(year, month)}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
