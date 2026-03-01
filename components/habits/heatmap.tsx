"use client";

import { useMemo } from "react";
import { getLocalDateString, getDayOfWeek, subtractDays, generateDateRange, parseDate, getMonthShortName } from "@/lib/dates";
import { HEATMAP_EMPTY_COLOR } from "@/lib/constants";
import type { HeatmapEntry } from "@/lib/types";

interface HeatmapProps {
  entries: HeatmapEntry[];
  dailyTarget: number;
  color: string;
  weeks: number;
  showLabels?: boolean;
}

export function Heatmap({ entries, dailyTarget, color, weeks, showLabels = false }: HeatmapProps) {
  const today = getLocalDateString();

  const cells = useMemo(() => {
    // O(1) lookup for entry counts by date
    const countMap = new Map<string, number>();
    for (const entry of entries) {
      countMap.set(entry.date, entry.count);
    }

    // End date is the last day of the final column (today's week).
    // The grid is 7 rows (Mon–Sun), columns flow left to right.
    // We want today to land in the rightmost column.
    const todayDow = getDayOfWeek(today); // 0=Mon … 6=Sun
    const endDate = today; // today is always in the last column
    // Start from the Monday `weeks` columns back
    const totalDays = (weeks - 1) * 7 + todayDow + 1;
    const startDate = subtractDays(endDate, totalDays - 1);

    const range = generateDateRange(startDate, endDate);
    return range.map((date) => {
      const count = countMap.get(date) ?? 0;
      const intensity = dailyTarget > 0 ? Math.min(count / dailyTarget, 1) : 0;
      return { date, count, intensity };
    });
  }, [entries, dailyTarget, today, weeks]);

  // Compute month labels: find column index where each new month starts
  const monthLabels = useMemo(() => {
    if (!showLabels) return [];
    const labels: { name: string; col: number }[] = [];
    let prevMonth = -1;
    for (let i = 0; i < cells.length; i++) {
      const col = Math.floor(i / 7);
      const month = parseDate(cells[i].date).getMonth();
      if (month !== prevMonth) {
        // Only add if this is the first cell in this column with the new month
        // (i.e. row 0 of this column)
        if (i % 7 === 0) {
          labels.push({ name: getMonthShortName(cells[i].date), col });
        } else if (labels.length === 0 || labels[labels.length - 1].col !== col + 1) {
          // Month boundary mid-column — place label on next column
          labels.push({ name: getMonthShortName(cells[i].date), col: col + 1 });
        }
        prevMonth = month;
      }
    }
    return labels;
  }, [cells, showLabels]);

  const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  const heatmapGrid = (
    <div
      className="grid w-full overflow-hidden"
      style={{
        gridTemplateRows: "repeat(7, 1fr)",
        gridAutoFlow: "column",
        gridAutoColumns: "minmax(0, 1fr)",
        gap: "2px",
      }}
    >
      {cells.map((cell) => {
        const isToday = cell.date === today;
        const bg =
          cell.count === 0
            ? HEATMAP_EMPTY_COLOR
            : color;
        const opacity = cell.count === 0 ? 1 : 0.2 + cell.intensity * 0.8;

        return (
          <div
            key={cell.date}
            className="aspect-square rounded-[2px]"
            style={{
              backgroundColor: bg,
              opacity,
              minHeight: 0,
              outline: isToday ? `1.5px solid ${color}` : undefined,
              outlineOffset: isToday ? "-0.5px" : undefined,
            }}
            title={`${cell.date}: ${cell.count}/${dailyTarget}`}
          />
        );
      })}
    </div>
  );

  if (!showLabels) return heatmapGrid;

  const totalCols = Math.ceil(cells.length / 7);

  return (
    <div className="flex flex-col gap-1">
      {/* Month labels row */}
      <div className="flex">
        {/* Spacer for day-of-week label column */}
        <div className="w-8 shrink-0" />
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
            gap: "2px",
          }}
        >
          {Array.from({ length: totalCols }, (_, col) => {
            const label = monthLabels.find((l) => l.col === col);
            return (
              <div
                key={col}
                className="text-[10px] text-muted-foreground leading-none"
              >
                {label?.name ?? ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main row: day labels + heatmap grid */}
      <div className="flex">
        {/* Day-of-week labels */}
        <div
          className="w-8 shrink-0 grid"
          style={{
            gridTemplateRows: "repeat(7, 1fr)",
            gap: "2px",
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground flex items-center justify-end pr-1.5"
            >
              {label}
            </div>
          ))}
        </div>
        {heatmapGrid}
      </div>
    </div>
  );
}
