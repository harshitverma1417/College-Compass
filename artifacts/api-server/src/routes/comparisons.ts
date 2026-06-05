import { Router } from "express";
import { db, collegesTable, coursesTable, reviewsTable, savedComparisonsTable } from "@workspace/db";
import { eq, inArray, desc } from "drizzle-orm";
import { GetComparisonQueryParams, SaveComparisonBody, DeleteSavedComparisonParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import type { Request } from "express";

const router = Router();

type AuthRequest = Request & { userId: number };

router.get("/comparisons", async (req, res): Promise<void> => {
  const parsed = GetComparisonQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const ids = parsed.data.ids
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));

  if (ids.length < 2 || ids.length > 3) {
    res.status(400).json({ error: "Provide 2-3 college IDs" });
    return;
  }

  const colleges = await db
    .select()
    .from(collegesTable)
    .where(inArray(collegesTable.id, ids));

  const results = await Promise.all(
    colleges.map(async (college) => {
      const [courses, reviews] = await Promise.all([
        db.select().from(coursesTable).where(eq(coursesTable.collegeId, college.id)),
        db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.collegeId, college.id))
          .orderBy(desc(reviewsTable.createdAt))
          .limit(5),
      ]);
      return { ...college, courses, reviews };
    })
  );

  res.json(results);
});

router.get("/comparisons/saved", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const comparisons = await db
    .select()
    .from(savedComparisonsTable)
    .where(eq(savedComparisonsTable.userId, userId))
    .orderBy(desc(savedComparisonsTable.createdAt));

  res.json(comparisons);
});

router.post("/comparisons/saved", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const body = SaveComparisonBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [comparison] = await db
    .insert(savedComparisonsTable)
    .values({ userId, collegeIds: body.data.collegeIds, label: body.data.label })
    .returning();

  res.status(201).json(comparison);
});

router.delete("/comparisons/saved/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const params = DeleteSavedComparisonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(savedComparisonsTable)
    .where(
      eq(savedComparisonsTable.id, params.data.id)
    )
    .returning();

  if (!deleted || deleted.userId !== userId) {
    res.status(404).json({ error: "Comparison not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
