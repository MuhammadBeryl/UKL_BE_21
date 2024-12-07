import express from "express";
import { borrowItem, returnItem } from "../controller/borrowController";
import { validateBorrowInput, validateReturn } from "../middlewares/borrowValidation";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const router = express.Router();

router.post(`/borrow`, [verifyToken, verifyRole(["USER","ADMIN"]),validateBorrowInput], borrowItem); // Peminjaman barang
router.post(`/return`, [verifyToken, verifyRole(["USER","ADMIN"]),validateReturn], returnItem); // Pengembalian barang

export default router;
