import { Router } from "express";
import { db, savedCollegesTable, collegesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SaveCollegeBody, UnsaveCollegeParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import type { Request } from "express";

const router = Router();
type AuthRequest = Request & { userId: number };

router.get("/saved", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  const saved = await db
    .select({ college: collegesTable })
    .from(savedCollegesTable)
    .innerJoin(collegesTable, eq(savedCollegesTable.collegeId, collegesTable.id))
    .where(eq(savedCollegesTable.userId, userId));

  res.json(saved.map((r) => r.college));
});

router.post("/saved", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const body = SaveCollegeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(savedCollegesTable)
    .where(
      and(
        eq(savedCollegesTable.userId, userId),
        eq(savedCollegesTable.collegeId, body.data.collegeId)
      )
    );

  if (existing) {
    res.status(409).json({ error: "College already saved" });
    return;
  }

  const [record] = await db
    .insert(savedCollegesTable)
    .values({ userId, collegeId: body.data.collegeId })
    .returning();

  res.status(201).json(record);
});

router.delete("/saved/:collegeId", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const params = UnsaveCollegeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(savedCollegesTable)
    .where(
      and(
        eq(savedCollegesTable.userId, userId),
        eq(savedCollegesTable.collegeId, params.data.collegeId)
      )
    );

  res.sendStatus(204);
});

export default router;
