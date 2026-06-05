import { Router } from "express";
import { db, collegesTable, coursesTable, reviewsTable } from "@workspace/db";
import { count, avg, desc, sql } from "drizzle-orm";
import { GetTopCollegesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [collegesCount, coursesCount, reviewsCount, avgRatingResult] = await Promise.all([
    db.select({ count: count() }).from(collegesTable),
    db.select({ count: count() }).from(coursesTable),
    db.select({ count: count() }).from(reviewsTable),
    db.select({ avg: avg(collegesTable.rating) }).from(collegesTable),
  ]);

  res.json({
    totalColleges: Number(collegesCount[0]?.count ?? 0),
    totalCourses: Number(coursesCount[0]?.count ?? 0),
    totalReviews: Number(reviewsCount[0]?.count ?? 0),
    avgRating: Math.round(Number(avgRatingResult[0]?.avg ?? 0) * 10) / 10,
  });
});

router.get("/stats/top-colleges", async (req, res): Promise<void> => {
  const parsed = GetTopCollegesQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const colleges = await db
    .select()
    .from(collegesTable)
    .orderBy(desc(collegesTable.rating))
    .limit(limit);

  res.json(colleges);
});

router.get("/stats/cities", async (_req, res): Promise<void> => {
  const cities = await db
    .select({
      city: collegesTable.city,
      state: collegesTable.state,
      count: count(),
    })
    .from(collegesTable)
    .groupBy(collegesTable.city, collegesTable.state)
    .orderBy(desc(count()));

  res.json(cities);
});

export default router;
