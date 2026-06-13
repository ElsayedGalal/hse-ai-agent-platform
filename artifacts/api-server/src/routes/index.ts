import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sitesRouter from "./sites";
import violationsRouter from "./violations";
import statsRouter from "./stats";
import recommendationsRouter from "./recommendations";
import monitoringRouter from "./monitoring";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sitesRouter);
router.use(violationsRouter);
router.use(statsRouter);
router.use(recommendationsRouter);
router.use(monitoringRouter);

export default router;
