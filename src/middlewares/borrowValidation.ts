// import { NextFunction, Request, Response } from "express";
// import Joi from "joi";

// // Define the validation schema
// const borrowSchema = Joi.object({
//     itemId: Joi.number().integer().required().messages({
//         "any.required": "Item ID is required",
//         "number.base": "Item ID must be a number",
//         "number.integer": "Item ID must be an integer",
//     }),
//     userId: Joi.number().integer().required().messages({
//         "any.required": "User ID is required",
//         "number.base": "User ID must be a number",
//         "number.integer": "User ID must be an integer",
//     }),
//     borrowDate: Joi.date().optional().messages({
//         "date.base": "Borrow date must be a valid date",
//     }),
//     returnDate: Joi.date().optional().greater(Joi.ref("borrowDate")).messages({
//         "date.base": "Return date must be a valid date",
//         "date.greater": "Return date must be after the borrow date",
//     }),
// });

// // Middleware to validate the borrow request
// export const validateBorrow = (
//     request: Request,
//     response: Response,
//     next: NextFunction
// ) => {
//     const { error } = borrowSchema.validate(request.body, { abortEarly: false });

//     if (error) {
//         return response.status(400).json({
//             status: false,
//             message: error.details.map((detail) => detail.message).join(", "),
//         });
//     }
//     return next();
// };



import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";
// import { borrowItem } from "../controller/borrowController";

// const addBorrowValidate = Joi.object({
//     userId: Joi.number().min(1).required(), // Validasi ID pengguna
//     itemId: Joi.number().min(1).required(), // Validasi ID barang
//     quantity: Joi.number().min(1).required(), // Validasi jumlah barang
//     borrowDate: Joi.date().required(), // Tanggal peminjaman
//     returnDate: Joi.date().required().greater(Joi.ref('borrowDate')), // Tanggal pengembalian lebih besar dari tanggal peminjaman
//     user: Joi.optional() // Tidak wajib, karena hanya referensi
// });

// export const borrowValidation = (req: Request, res: Response, next: NextFunction) => {
//     const { error } = addBorrowValidate.validate(req.body, { abortEarly: false });

//     if (error) {
//         return res.status(400).json({
//             status: false,
//             message: error.details.map((it) => it.message).join(", "),
//         });
//     }
//     return next();
// };

// const addReturnValidate = Joi.object({
//     borrowId: Joi.number().min(1).required(), // Validasi ID peminjaman
//     returnDate: Joi.date().required(), // Tanggal pengembalian barang
//     user: Joi.optional() // Tidak wajib, karena hanya referensi
// });

// export const returnValidation = (req: Request, res: Response, next: NextFunction) => {
//     const { error } = addReturnValidate.validate(req.body, { abortEarly: false });

//     if (error) {
//         return res.status(400).json({
//             status: false,
//             message: error.details.map((it) => it.message).join(", "),
//         });
//     }
//     return next();
// };

// const addReportValidate = Joi.object({
//     start_date: Joi.date().required(), // Tanggal mulai laporan
//     end_date: Joi.date().required().greater(Joi.ref("start_date")), // Tanggal akhir laporan harus lebih besar dari tanggal mulai
//     group_by: Joi.string().valid("category", "location").required(), // Grup berdasarkan kategori atau lokasi
//     user: Joi.optional() // Tidak wajib, karena hanya referensi
// });

// export const reportValidation = (req: Request, res: Response, next: NextFunction) => {
//     const { error } = addReportValidate.validate(req.body, { abortEarly: false });

//     if (error) {
//         return res.status(400).json({
//             status: false,
//             message: error.details.map((it) => it.message).join(", "),
//         });
//     }
//     return next();
// };

// const addAnalysisValidate = Joi.object({
//     start_date: Joi.date().required(), // Tanggal mulai analisis
//     end_date: Joi.date().required().greater(Joi.ref("start_date")), // Tanggal akhir harus lebih besar dari tanggal mulai
//     user: Joi.optional() // Tidak wajib, karena hanya referensi
// });

// export const analysisValidation = (req: Request, res: Response, next: NextFunction) => {
//     const { error } = addAnalysisValidate.validate(req.body, { abortEarly: false });

//     if (error) {
//         return res.status(400).json({
//             status: false,
//             message: error.details.map((it) => it.message).join(", "),
//         });
//     }
//     return next();
// };


const prisma = new PrismaClient();

export const validateBorrowInput = async (req: Request, res: Response, next: NextFunction) => {
    const { borrowDate, returnDate } = req.body;

    if (borrowDate && isNaN(Date.parse(borrowDate))) {
        return res.status(400).json({
            status: false,
            message: "Invalid borrowDate format. Use ISO-8601 format.",
        });
    }

    if (returnDate && isNaN(Date.parse(returnDate))) {
        return res.status(400).json({
            status: false,
            message: "Invalid returnDate format. Use ISO-8601 format.",
        });
    }

    next();
};

const returnSchema = Joi.object({
    borrowId: Joi.number().required(), //integer
    returnDate: Joi.date().iso().required(),
    status: Joi.string().valid("RETURNED").required(),
    user:Joi.optional()
});

export const validateReturn = (req: Request, res: Response, next: NextFunction) => {
    const { error } = returnSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};
