import express from "express";
import { analyzeUsage, borrowAnalysis } from "../controller/analisisController";
import { validateAnalysisRequest, validateBorrowAnalis } from "../middlewares/analisisMiddleware";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const router = express.Router();

router.post(`/api/inventory/usage-report`, [verifyToken,verifyRole(["USER","ADMIN"])], validateAnalysisRequest, analyzeUsage);
router.post(`/borrow-analysis`,validateBorrowAnalis, borrowAnalysis);

export default router;
