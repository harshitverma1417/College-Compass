import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListReviewsParams, CreateReviewParams, CreateReviewBody } from "@workspace/api-zod";

const router = Router();

router.get("/colleges/:collegeId/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.collegeId, params.data.collegeId))
    .orderBy(desc(reviewsTable.createdAt));

  res.json(reviews);
});

router.post("/colleges/:collegeId/reviews", async (req, res): Promise<void> => {
  const params = CreateReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateReviewBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({ collegeId: params.data.collegeId, ...body.data })
    .returning();

  res.status(201).json(review);
});

export default router;
