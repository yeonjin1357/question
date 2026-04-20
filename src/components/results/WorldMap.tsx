"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import type { CountryAggregate } from "@/lib/db/queries/results";
import { alpha2FromNumeric } from "@/lib/geo/iso3166";
import { cn } from "@/lib/utils/cn";

const GEO_URL = "/world-atlas/countries-110m.json";
const MIN_COUNT_FOR_COLOR = 10;
const NO_DATA_COLOR = "#e5e7eb";
const HOVER_STROKE = "#111827";

/** 옵션 4개까지의 고정 팔레트. 파생 강도는 CSS opacity 로 자연스럽게 넣어도 됨. */
const OPTION_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981"];

interface WorldMapProps {
  byCountry: CountryAggregate[];
  /** 옵션 정렬 순서(= sortOrder) 기준 배열. 팔레트 인덱스 결정에 사용. */
  optionOrder: Array<{ id: string; text: string }>;
}

interface TooltipState {
  country: string;
  lines: string[];
  /** 0..100 퍼센트 좌표 (viewport 기준) */
  x: number;
  y: number;
}

export function WorldMap({ byCountry, optionOrder }: WorldMapProps) {
  const t = useTranslations();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const optionIndex = useMemo(
    () => Object.fromEntries(optionOrder.map((o, i) => [o.id, i])),
    [optionOrder],
  );
  const optionLabel = useMemo(
    () => Object.fromEntries(optionOrder.map((o) => [o.id, o.text])),
    [optionOrder],
  );

  const byAlpha2 = useMemo(() => {
    const m = new Map<string, CountryAggregate>();
    for (const c of byCountry) m.set(c.country, c);
    return m;
  }, [byCountry]);

  const colorFor = useCallback(
    (agg: CountryAggregate | undefined): string => {
      if (!agg || agg.total < MIN_COUNT_FOR_COLOR) return NO_DATA_COLOR;
      const top = agg.options[0];
      if (!top) return NO_DATA_COLOR;
      const idx = optionIndex[top.optionId];
      if (idx === undefined) return NO_DATA_COLOR;
      return OPTION_COLORS[idx % OPTION_COLORS.length] ?? NO_DATA_COLOR;
    },
    [optionIndex],
  );

  return (
    <section
      aria-label="World map of responses"
      className="relative flex w-full flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{t("results.world")}</h2>
        <Legend options={optionOrder} />
      </header>

      <div className="relative">
        <ComposableMap
          projectionConfig={{ scale: 147 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = alpha2FromNumeric(geo.id as string);
                const agg = alpha2 ? byAlpha2.get(alpha2) : undefined;
                const fill = colorFor(agg);
                const hasData = !!agg && agg.total >= MIN_COUNT_FOR_COLOR;
                const name = (geo.properties as { name?: string } | null)?.name ?? alpha2 ?? "—";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        stroke: HOVER_STROKE,
                        strokeWidth: 0.8,
                        cursor: hasData ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(event) => {
                      const lines = agg
                        ? agg.options.map(
                            (o) =>
                              `${optionLabel[o.optionId] ?? o.optionId.slice(0, 6)}: ${o.percent}% (${o.count})`,
                          )
                        : [t("results.noData")];
                      const totalLine = agg
                        ? t("results.totalParticipants", { count: agg.total })
                        : "—";
                      setTooltip({
                        country: name,
                        lines: [totalLine, ...lines],
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
                    onMouseMove={(event) => {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: event.clientX, y: event.clientY } : prev,
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltip ? (
          <div
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-50 rounded-md border border-neutral-200 bg-white px-3 py-2",
              "text-xs shadow-sm",
            )}
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="font-semibold">{tooltip.country}</div>
            {tooltip.lines.map((line, i) => (
              <div key={i} className="text-neutral-600">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Legend({ options }: { options: Array<{ id: string; text: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
      {options.map((o, i) => (
        <div key={o.id} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length] }}
            aria-hidden
          />
          <span>{o.text}</span>
        </div>
      ))}
    </div>
  );
}
