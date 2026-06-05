import { Router } from "express";
import { db, collegesTable } from "@workspace/db";
import { PredictCollegesBody } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router = Router();

// Score thresholds for admission chance by exam type
// Rank ranges mapped to college tiers
const EXAM_RANK_CONFIG: Record<string, { maxRankForHigh: number; maxRankForMedium: number; targetTypes: string[] }> = {
  JEE_ADVANCED: { maxRankForHigh: 2000, maxRankForMedium: 10000, targetTypes: ["IIT"] },
  JEE_MAIN: { maxRankForHigh: 20000, maxRankForMedium: 80000, targetTypes: ["NIT", "IIIT"] },
  CUET: { maxRankForHigh: 5000, maxRankForMedium: 50000, targetTypes: ["Government", "Private"] },
  NEET: { maxRankForHigh: 10000, maxRankForMedium: 100000, targetTypes: ["Government", "Private"] },
  CAT: { maxRankForHigh: 500, maxRankForMedium: 5000, targetTypes: ["Private"] },
  GATE: { maxRankForHigh: 1000, maxRankForMedium: 10000, targetTypes: ["IIT", "NIT", "Government"] },
};

router.post("/predictor", async (req, res): Promise<void> => {
  const parsed = PredictCollegesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { examType, rank } = parsed.data;
  const config = EXAM_RANK_CONFIG[examType];

  if (!config) {
    res.status(400).json({ error: "Invalid exam type" });
    return;
  }

  // Get all colleges sorted by rating
  const colleges = await db
    .select()
    .from(collegesTable)
    .orderBy(desc(collegesTable.rating));

  // Score each college and determine admission chance
  const results = colleges.map((college) => {
    const isTargetType = config.targetTypes.includes(college.type);
    let matchScore: number;
    let chance: "High" | "Medium" | "Low";

    if (rank <= config.maxRankForHigh) {
      matchScore = isTargetType ? 85 + college.rating * 3 : 60 + college.rating * 5;
      chance = rank <= config.maxRankForHigh / 2 && isTargetType ? "High" : isTargetType ? "High" : "Medium";
    } else if (rank <= config.maxRankForMedium) {
      const progress = 1 - (rank - config.maxRankForHigh) / (config.maxRankForMedium - config.maxRankForHigh);
      matchScore = isTargetType ? 50 + progress * 35 : 30 + progress * 30;
      chance = progress > 0.5 && isTargetType ? "Medium" : "Low";
    } else {
      const overtRank = rank / config.maxRankForMedium;
      matchScore = Math.max(5, 30 - overtRank * 10 + (isTargetType ? 10 : 0));
      chance = "Low";
    }

    matchScore = Math.min(100, Math.max(0, Math.round(matchScore)));

    return {
      college,
      chance,
      matchScore,
    };
  });

  // Sort by matchScore descending and return top 20
  const sorted = results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
  res.json(sorted);
});

export default router;
