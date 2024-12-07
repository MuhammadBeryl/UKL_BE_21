import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateAnalysisRequest = (req: Request, res: Response, next: NextFunction) => {
    const { start_date, end_date, group_by } = req.body;

    // Validasi apakah semua field ada
    if (!start_date || !end_date || !group_by) {
        return res.status(400).json({
            status: false,
            message: "Start date, end date, and group_by are required.",
        });
    }

    // Validasi format tanggal
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
            status: false,
            message: "Invalid date format. Use 'YYYY-MM-DD'.",
        });
    }

    // Validasi range tanggal
    if (startDate > endDate) {
        return res.status(400).json({
            status: false,
            message: "Start date must be earlier than or equal to end date.",
        });
    }

    // Validasi group_by
    if (group_by !== "category" && group_by !== "location") {
        return res.status(400).json({
            status: false,
            message: "Invalid group_by value. Use 'category' or 'location'.",
        });
    }

    // Jika semua validasi lolos, lanjutkan ke controller
    next();
};
const analisisBorrowSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required().greater(Joi.ref("start_date")),
});

export const validateBorrowAnalis = (req: Request, res: Response, next: NextFunction) => {
    const { error } = analisisBorrowSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            massage: error.details.map(it => it.message).join(),
        });
    }
    next();
};


