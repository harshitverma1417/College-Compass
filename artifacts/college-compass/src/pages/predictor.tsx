import React, { useState } from "react";
import { Link } from "wouter";
import {
  usePredictColleges,
  PredictorInputExamType,
  PredictorResultChance,
  type PredictorResult,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, TrendingUp, Award, ChevronRight, Loader2, Star } from "lucide-react";

const EXAM_LABELS: Record<string, string> = {
  JEE_MAIN: "JEE Main",
  JEE_ADVANCED: "JEE Advanced",
  CUET: "CUET",
  NEET: "NEET",
  CAT: "CAT",
  GATE: "GATE",
};

const EXAM_DESCRIPTIONS: Record<string, string> = {
  JEE_MAIN: "For NITs, IIITs, and government engineering colleges",
  JEE_ADVANCED: "For IITs — India's premier engineering institutes",
  CUET: "For central universities and participating colleges",
  NEET: "For medical and health science colleges",
  CAT: "For IIMs and top MBA programs",
  GATE: "For M.Tech admissions at IITs, NITs, and PSUs",
};

const CHANCE_CONFIG = {
  [PredictorResultChance.High]: {
    label: "High Chance",
    className: "bg-green-100 text-green-800 border-green-200",
    barColor: "bg-green-500",
  },
  [PredictorResultChance.Medium]: {
    label: "Medium Chance",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    barColor: "bg-amber-500",
  },
  [PredictorResultChance.Low]: {
    label: "Low Chance",
    className: "bg-red-100 text-red-800 border-red-200",
    barColor: "bg-red-400",
  },
};

function ResultCard({ result, rank }: { result: PredictorResult; rank: number }) {
  const { college, chance, matchScore } = result;
  const cfg = CHANCE_CONFIG[chance];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base leading-tight">
                <Link
                  href={`/colleges/${college.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {college.name}
                </Link>
              </h3>
              <Badge variant="outline" className={`text-xs font-medium shrink-0 ${cfg.className}`}>
                {cfg.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {college.city}, {college.state}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {college.rating.toFixed(1)}
              </span>
              <Badge variant="secondary" className="text-xs">{college.type}</Badge>
              <span>₹{(college.fees / 100000).toFixed(1)}L/yr</span>
              {(college as any).avgPackage && (
                <span className="flex items-center gap-1 text-green-700 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Avg {(college as any).avgPackage} LPA
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                <span>Match score</span>
                <span className="font-medium">{matchScore}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${cfg.barColor}`}
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
          </div>

          <Link href={`/colleges/${college.id}`} className="shrink-0 mt-0.5">
            <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ChanceGroup({
  label,
  results,
  startRank,
}: {
  label: string;
  results: PredictorResult[];
  startRank: number;
}) {
  if (results.length === 0) return null;
  const cfg = CHANCE_CONFIG[label as keyof typeof CHANCE_CONFIG];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-2.5 w-2.5 rounded-full ${cfg.barColor}`} />
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {cfg.label} — {results.length} college{results.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <div className="space-y-3">
        {results.map((r, i) => (
          <ResultCard key={r.college.id} result={r} rank={startRank + i} />
        ))}
      </div>
    </div>
  );
}

export default function Predictor() {
  const [examType, setExamType] = useState<string>("");
  const [rankStr, setRankStr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = usePredictColleges();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rank = parseInt(rankStr, 10);
    if (!examType || isNaN(rank) || rank < 1) return;
    setSubmitted(true);
    mutation.mutate({
      data: {
        examType: examType as typeof PredictorInputExamType[keyof typeof PredictorInputExamType],
        rank,
      },
    });
  };

  const results = mutation.data ?? [];
  const high = results.filter((r) => r.chance === PredictorResultChance.High);
  const medium = results.filter((r) => r.chance === PredictorResultChance.Medium);
  const low = results.filter((r) => r.chance === PredictorResultChance.Low);

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">College Predictor</h1>
        </div>
        <p className="text-muted-foreground">
          Enter your exam and rank to discover which colleges you're likely to get into.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Your Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="exam">Entrance Exam</Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger id="exam" className="w-full">
                    <SelectValue placeholder="Select your exam…" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXAM_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {examType && (
                  <p className="text-xs text-muted-foreground">{EXAM_DESCRIPTIONS[examType]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank">Your Rank</Label>
                <Input
                  id="rank"
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  value={rankStr}
                  onChange={(e) => setRankStr(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your All India Rank (AIR)
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={!examType || !rankStr || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Predicting…
                </>
              ) : (
                "Predict My Colleges"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {mutation.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700 text-sm">
            Something went wrong. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {submitted && mutation.isSuccess && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Results for Rank {parseInt(rankStr, 10).toLocaleString("en-IN")}
            </h2>
            <span className="text-sm text-muted-foreground">{results.length} colleges found</span>
          </div>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2">
            {high.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {high.length} High Chance
              </span>
            )}
            {medium.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {medium.length} Medium Chance
              </span>
            )}
            {low.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                {low.length} Low Chance
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-8">
            <ChanceGroup label="High" results={high} startRank={1} />
            <ChanceGroup label="Medium" results={medium} startRank={high.length + 1} />
            <ChanceGroup label="Low" results={low} startRank={high.length + medium.length + 1} />
          </div>
        </div>
      )}

      {submitted && mutation.isSuccess && results.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No colleges found for this rank and exam combination. Try a different exam type.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
