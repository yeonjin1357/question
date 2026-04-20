"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import type { CountryAggregate } from "@/lib/db/queries/results";
import { alpha2FromNumeric } from "@/lib/geo/iso3166";
import { optionEmoji } from "@/lib/ui/option-emoji";
import { cn } from "@/lib/utils/cn";

const GEO_URL = "/world-atlas/countries-110m.json";
const MIN_COUNT_FOR_COLOR = 1;
const NO_DATA_COLOR = "#e5e7eb";
const HOVER_STROKE = "#111827";
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.6;
const DEFAULT_CENTER: [number, number] = [0, 20];

const OPTION_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981"];

interface WorldMapProps {
  byCountry: CountryAggregate[];
  optionOrder: Array<{ id: string; text: string }>;
}

interface TooltipState {
  country: string;
  lines: string[];
  x: number;
  y: number;
}

interface SelectedCountry {
  alpha2: string;
  name: string;
  agg: CountryAggregate;
}

export function WorldMap({ byCountry, optionOrder }: WorldMapProps) {
  const t = useTranslations();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [selected, setSelected] = useState<SelectedCountry | null>(null);

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

  // byCountry 갱신 (라이브 폴링) 시 선택된 국가의 agg 도 최신으로 교체.
  useEffect(() => {
    if (!selected) return;
    const fresh = byAlpha2.get(selected.alpha2);
    if (fresh && fresh !== selected.agg) {
      setSelected({ ...selected, agg: fresh });
    } else if (!fresh) {
      setSelected(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byAlpha2]);

  // ESC 로 상세 패널 닫기
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

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

  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_STEP));
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_STEP));
  const handleReset = () => {
    setZoom(1);
    setCenter(DEFAULT_CENTER);
  };

  const canZoomIn = zoom < MAX_ZOOM;
  const canZoomOut = zoom > MIN_ZOOM;
  const atDefault = zoom === 1 && center[0] === DEFAULT_CENTER[0] && center[1] === DEFAULT_CENTER[1];

  return (
    <section
      aria-label="World map of responses"
      className="relative flex w-full flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft dark:bg-neutral-900 sm:p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold">{t("results.world")}</h2>
        <Legend options={optionOrder} />
      </header>

      <div className="relative">
        <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-950 sm:h-[460px] md:h-[560px]">
          <ComposableMap
            projectionConfig={{ scale: 160 }}
            width={900}
            height={520}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setCenter(coordinates as [number, number]);
                setZoom(z);
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const alpha2 = alpha2FromNumeric(geo.id as string);
                    const agg = alpha2 ? byAlpha2.get(alpha2) : undefined;
                    const fill = colorFor(agg);
                    const hasData = !!agg && agg.total >= MIN_COUNT_FOR_COLOR;
                    const name =
                      (geo.properties as { name?: string } | null)?.name ?? alpha2 ?? "—";
                    const isSelected = selected?.alpha2 === alpha2;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className="dark:[&[fill='#e5e7eb']]:fill-neutral-700"
                        fill={fill}
                        stroke={isSelected ? HOVER_STROKE : "#ffffff"}
                        strokeWidth={isSelected ? 1.2 : 0.3}
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
                        onClick={() => {
                          if (!hasData || !alpha2 || !agg) return;
                          setSelected({ alpha2, name, agg });
                          setTooltip(null);
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
            </ZoomableGroup>
          </ComposableMap>

          <div
            className="absolute right-3 top-3 flex flex-col gap-1 rounded-full bg-white/90 p-1 shadow-soft backdrop-blur-sm dark:bg-neutral-900/90"
            role="group"
            aria-label="Map controls"
          >
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={!canZoomIn}
              aria-label={t("map.zoomIn")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={!canZoomOut}
              aria-label={t("map.zoomOut")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={atDefault}
              aria-label={t("map.reset")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <p className="pointer-events-none absolute bottom-3 left-3 text-[10px] text-neutral-500 dark:text-neutral-500">
            {t("map.hint")}
          </p>
        </div>

        {tooltip && !selected ? (
          <div
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-50 rounded-2xl bg-white px-3 py-2 dark:bg-neutral-900",
              "text-xs shadow-pop",
            )}
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="mb-0.5 font-display text-sm font-semibold dark:text-neutral-100">
              {tooltip.country}
            </div>
            {tooltip.lines.map((line, i) => (
              <div key={i} className="text-neutral-600 tabular-nums dark:text-neutral-400">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {selected ? (
          <CountryDetail
            key={selected.alpha2}
            selected={selected}
            optionIndex={optionIndex}
            optionLabel={optionLabel}
            onClose={() => setSelected(null)}
            closeLabel={t("map.close")}
            totalLabelFn={(n) => t("results.totalParticipants", { count: n })}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function CountryDetail({
  selected,
  optionIndex,
  optionLabel,
  onClose,
  closeLabel,
  totalLabelFn,
}: {
  selected: SelectedCountry;
  optionIndex: Record<string, number>;
  optionLabel: Record<string, string>;
  onClose: () => void;
  closeLabel: string;
  totalLabelFn: (count: number) => string;
}) {
  return (
    <motion.aside
      role="dialog"
      aria-label={selected.name}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-2xl bg-brand-50 p-4 dark:bg-brand-950/30"
    >
      <header className="mb-3 flex items-start gap-3">
        <div className="flex flex-1 flex-col">
          <span className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {selected.name}
          </span>
          <span className="text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
            {totalLabelFn(selected.agg.total)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
        >
          <X size={14} />
        </button>
      </header>

      <ul className="flex flex-col gap-2">
        {selected.agg.options.map((o) => {
          const idx = optionIndex[o.optionId] ?? 0;
          const color = OPTION_COLORS[idx % OPTION_COLORS.length] ?? "#9ca3af";
          const label = optionLabel[o.optionId] ?? o.optionId.slice(0, 6);
          const em = optionEmoji(o.optionId);
          return (
            <li key={o.optionId} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm text-neutral-800 dark:text-neutral-200">
                  {em ? <span aria-hidden>{em}</span> : null}
                  <span className="truncate">{label}</span>
                </span>
                <span className="font-display text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {o.percent}%{" "}
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    ({o.count})
                  </span>
                </span>
              </div>
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-white dark:bg-neutral-900"
                aria-hidden
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(o.percent, 2)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </motion.aside>
  );
}

function Legend({ options }: { options: Array<{ id: string; text: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
      {options.map((o, i) => (
        <span
          key={o.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 dark:bg-neutral-800"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length] }}
            aria-hidden
          />
          <span className="font-medium">{o.text}</span>
        </span>
      ))}
    </div>
  );
}
