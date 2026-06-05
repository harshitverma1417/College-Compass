import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import collegesRouter from "./colleges";
import coursesRouter from "./courses";
import reviewsRouter from "./reviews";
import comparisonsRouter from "./comparisons";
import predictorRouter from "./predictor";
import savedRouter from "./saved";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(collegesRouter);
router.use(coursesRouter);
router.use(reviewsRouter);
router.use(comparisonsRouter);
router.use(predictorRouter);
router.use(savedRouter);
router.use(statsRouter);

export default router;
