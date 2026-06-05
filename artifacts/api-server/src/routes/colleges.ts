import { Router } from "express";
import { db, collegesTable, coursesTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, sql, asc, desc, count } from "drizzle-orm";
import { ListCollegesQueryParams, GetCollegeParams } from "@workspace/api-zod";

const router = Router();

router.get("/colleges", async (req, res): Promise<void> => {
  const parsed = ListCollegesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    search,
    city,
    type,
    minFees,
    maxFees,
    minRating,
    sortBy = "rating",
    sortOrder = "desc",
    page = 1,
    limit = 12,
  } = parsed.data;

  const conditions = [];
  if (search) {
    conditions.push(ilike(collegesTable.name, `%${search}%`));
  }
  if (city) {
    conditions.push(ilike(collegesTable.city, `%${city}%`));
  }
  if (type) {
    conditions.push(eq(collegesTable.type, type));
  }
  if (minFees != null) {
    conditions.push(gte(collegesTable.fees, minFees));
  }
  if (maxFees != null) {
    conditions.push(lte(collegesTable.fees, maxFees));
  }
  if (minRating != null) {
    conditions.push(gte(collegesTable.rating, minRating));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumn =
    sortBy === "name"
      ? collegesTable.name
      : sortBy === "fees"
        ? collegesTable.fees
        : sortBy === "createdAt"
          ? collegesTable.createdAt
          : collegesTable.rating;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const offset = (page - 1) * limit;

  const [totalResult, colleges] = await Promise.all([
    db.select({ count: count() }).from(collegesTable).where(where),
    db
      .select()
      .from(collegesTable)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  res.json({
    colleges,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/colleges/:id", async (req, res): Promise<void> => {
  const params = GetCollegeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [college] = await db
    .select()
    .from(collegesTable)
    .where(eq(collegesTable.id, params.data.id));

  if (!college) {
    res.status(404).json({ error: "College not found" });
    return;
  }

  const [courses, reviews] = await Promise.all([
    db.select().from(coursesTable).where(eq(coursesTable.collegeId, college.id)),
    db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.collegeId, college.id))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(20),
  ]);

  res.json({
    ...college,
    courses,
    reviews,
  });
});

export default router;
