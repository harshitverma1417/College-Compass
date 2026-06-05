import { Router } from "express";
import { db, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListCoursesParams } from "@workspace/api-zod";

const router = Router();

router.get("/colleges/:collegeId/courses", async (req, res): Promise<void> => {
  const params = ListCoursesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.collegeId, params.data.collegeId));

  res.json(courses);
});

export default router;
