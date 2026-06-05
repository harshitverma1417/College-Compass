import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  useListColleges,
  useGetComparison,
  getListCollegesQueryKey,
  getGetComparisonQueryKey,
  type CollegeDetail,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  X,
  Plus,
  Star,
  MapPin,
  IndianRupee,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  GitCompare,
  Loader2,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

// ─── College search picker ────────────────────────────────────────────────────

function CollegeSearchPicker({
  selectedIds,
  onAdd,
  disabled,
}: {
  selectedIds: number[];
  onAdd: (college: { id: number; name: string; city: string; state: string; type: string }) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useListColleges(
    { search: query || undefined, limit: 8 },
    { query: { enabled: open, queryKey: getListCollegesQueryKey({ search: query || undefined, limit: 8 }) } }
  );
  const results = data?.colleges ?? [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder={disabled ? "Maximum 3 colleges selected" : "Search colleges to add…"}
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {query ? "No colleges found" : "Start typing to search…"}
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto divide-y">
              {results.map((c) => {
                const already = selectedIds.includes(c.id);
                return (
                  <li key={c.id}>
                    <button
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 text-sm transition-colors
                        ${already ? "opacity-50 cursor-not-allowed bg-muted/30" : "hover:bg-accent"}`}
                      onClick={() => {
                        if (already) return;
                        onAdd({ id: c.id, name: c.name, city: c.city, state: c.state, type: c.type });
                        setQuery("");
                        setOpen(false);
                      }}
                      disabled={already}
                    >
                      <span>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {c.city}, {c.state}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                        {already && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Metric row helpers ───────────────────────────────────────────────────────

function MetricRow({
  label,
  icon,
  values,
  highlight = false,
}: {
  label: string;
  icon: React.ReactNode;
  values: React.ReactNode[];
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-primary/5" : "even:bg-muted/30"}>
      <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-44">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm text-center font-medium border-l">
          {v}
        </td>
      ))}
    </tr>
  );
}

function bestIdx(colleges: CollegeDetail[], fn: (c: CollegeDetail) => number): number {
  let best = -1;
  let bestVal = -Infinity;
  colleges.forEach((c, i) => {
    const v = fn(c);
    if (v > bestVal) { bestVal = v; best = i; }
  });
  return best;
}

function worstIdx(colleges: CollegeDetail[], fn: (c: CollegeDetail) => number): number {
  let worst = -1;
  let worstVal = Infinity;
  colleges.forEach((c, i) => {
    const v = fn(c);
    if (v < worstVal) { worstVal = v; worst = i; }
  });
  return worst;
}

function Val({
  children,
  good,
  bad,
}: {
  children: React.ReactNode;
  good?: boolean;
  bad?: boolean;
}) {
  return (
    <span
      className={
        good
          ? "text-green-700 font-semibold"
          : bad
          ? "text-red-600"
          : undefined
      }
    >
      {children}
    </span>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({
  colleges,
  onRemove,
}: {
  colleges: CollegeDetail[];
  onRemove: (id: number) => void;
}) {
  const bestRating = bestIdx(colleges, (c) => c.rating);
  const bestAvg = bestIdx(colleges, (c) => c.avgPackage ?? 0);
  const bestHigh = bestIdx(colleges, (c) => c.highestPackage ?? 0);
  const cheapest = worstIdx(colleges, (c) => c.fees);

  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="w-full table-fixed min-w-[640px]">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-44">
              Metric
            </th>
            {colleges.map((c) => (
              <th key={c.id} className="px-4 py-3 border-l">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {c.name.charAt(0)}
                    </span>
                  </div>
                  <Link
                    href={`/colleges/${c.id}`}
                    className="text-sm font-semibold leading-tight hover:text-primary transition-colors line-clamp-2"
                  >
                    {c.name}
                  </Link>
                  <button
                    onClick={() => onRemove(c.id)}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors mt-0.5"
                  >
                    <MinusCircle className="w-3 h-3" /> Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y">
          <MetricRow
            label="Type"
            icon={<Award className="w-3.5 h-3.5" />}
            values={colleges.map((c) => (
              <Badge variant="secondary">{c.type}</Badge>
            ))}
          />
          <MetricRow
            label="Location"
            icon={<MapPin className="w-3.5 h-3.5" />}
            values={colleges.map((c) => (
              <span className="text-muted-foreground">{c.city}, {c.state}</span>
            ))}
          />
          <MetricRow
            label="Established"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            values={colleges.map((c) => (
              <span>{c.establishedYear ?? "—"}</span>
            ))}
          />
          <MetricRow
            label="Rating"
            icon={<Star className="w-3.5 h-3.5" />}
            highlight
            values={colleges.map((c, i) => (
              <Val good={i === bestRating}>
                <span className="flex items-center justify-center gap-1">
                  <Star className={`w-3.5 h-3.5 ${i === bestRating ? "fill-amber-400 text-amber-400" : "fill-muted-foreground text-muted-foreground"}`} />
                  {c.rating.toFixed(1)} / 5.0
                </span>
              </Val>
            ))}
          />
          <MetricRow
            label="Annual Fees"
            icon={<IndianRupee className="w-3.5 h-3.5" />}
            values={colleges.map((c, i) => (
              <Val good={i === cheapest}>
                ₹{(c.fees / 100000).toFixed(1)}L / yr
              </Val>
            ))}
          />
          <MetricRow
            label="Avg Package"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            highlight
            values={colleges.map((c, i) => (
              <Val good={c.avgPackage !== null && i === bestAvg} bad={c.avgPackage === null}>
                {c.avgPackage !== null ? `${c.avgPackage} LPA` : "N/A"}
              </Val>
            ))}
          />
          <MetricRow
            label="Highest Package"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            values={colleges.map((c, i) => (
              <Val good={c.highestPackage !== null && i === bestHigh} bad={c.highestPackage === null}>
                {c.highestPackage !== null ? `${c.highestPackage} LPA` : "N/A"}
              </Val>
            ))}
          />
          <MetricRow
            label="Courses"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            values={colleges.map((c) => (
              <span>{c.courses.length} offered</span>
            ))}
          />
          <MetricRow
            label="Top Recruiters"
            icon={<Users className="w-3.5 h-3.5" />}
            highlight
            values={colleges.map((c) => (
              <div className="flex flex-wrap justify-center gap-1">
                {c.recruiters.slice(0, 3).map((r) => (
                  <Badge key={r} variant="outline" className="text-xs">
                    {r}
                  </Badge>
                ))}
                {c.recruiters.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{c.recruiters.length - 3}
                  </Badge>
                )}
              </div>
            ))}
          />
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty slot card ──────────────────────────────────────────────────────────

function EmptySlot({ n }: { n: number }) {
  return (
    <div className="flex-1 min-w-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-muted-foreground gap-2 bg-muted/20">
      <Plus className="w-6 h-6" />
      <span className="text-sm font-medium">College {n}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Stub = { id: number; name: string; city: string; state: string; type: string };

export default function Compare() {
  const [selected, setSelected] = useState<Stub[]>([]);

  const add = (c: Stub) => {
    if (selected.length >= 3 || selected.find((s) => s.id === c.id)) return;
    setSelected((prev) => [...prev, c]);
  };
  const remove = (id: number) => setSelected((prev) => prev.filter((s) => s.id !== id));

  const idsParam = selected.map((s) => s.id).join(",");
  const canCompare = selected.length >= 2;

  const { data: colleges, isLoading, isError } = useGetComparison(
    { ids: idsParam },
    { query: { enabled: canCompare, queryKey: getGetComparisonQueryKey({ ids: idsParam }) } }
  );

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Compare Colleges</h1>
        </div>
        <p className="text-muted-foreground">
          Pick 2–3 colleges to compare fees, placements, ratings, and more — side by side.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <CollegeSearchPicker
            selectedIds={selected.map((s) => s.id)}
            onAdd={add}
            disabled={selected.length >= 3}
          />

          {/* Selected college pills */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {c.name}
                  <button
                    onClick={() => remove(c.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {selected.length < 2 && (
                <span className="text-sm text-muted-foreground self-center">
                  Add at least one more college to compare
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {selected.length === 0 && (
        <div className="flex flex-col items-center gap-8 py-8">
          <div className="flex gap-4 w-full max-w-2xl">
            <EmptySlot n={1} />
            <EmptySlot n={2} />
            <EmptySlot n={3} />
          </div>
          <p className="text-muted-foreground text-sm">
            Search for colleges above to get started
          </p>
        </div>
      )}

      {/* Loading */}
      {canCompare && isLoading && (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading comparison data…</span>
        </div>
      )}

      {/* Error */}
      {canCompare && isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">
            Failed to load comparison data. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Comparison table */}
      {colleges && colleges.length >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Comparing {colleges.length} colleges
            </h2>
            <span className="text-xs text-muted-foreground">
              <span className="text-green-700 font-medium">Green</span> = best value
            </span>
          </div>
          <ComparisonTable colleges={colleges} onRemove={remove} />
        </div>
      )}
    </div>
  );
}
