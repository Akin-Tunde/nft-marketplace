import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nftsRouter from "./nfts";
import collectionsRouter from "./collections";
import activityRouter from "./activity";
import statsRouter from "./stats";
import offersRouter from "./offers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(offersRouter);
router.use(nftsRouter);
router.use(collectionsRouter);
router.use(activityRouter);
router.use(statsRouter);

export default router;
