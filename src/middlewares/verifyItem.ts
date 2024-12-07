import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Middleware to verify if an item exists in the database
 */
export const verifyItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

    // Check if ID is a valid number
    if (isNaN(Number(id)) || Number(id) < 1) {
        return res.status(400).json({
            status: false,
            message: "Invalid item ID",
    });
    }

    // Fetch the item from the database
    const item = await prisma.item.findUnique({
        where: { id: Number(id) },
    });

    if (!item) {
        return res.status(404).json({
        status: false,
        message: "Item not found",
    });
    }

    next();
} catch (error) {
    return res.status(500).json({
        status: false,
        message: `Error verifying item: ${error}`,
    });
}
};

export const validateItemInput = (req: Request, res: Response, next: NextFunction) => {
    const { name, category, location, quantity } = req.body;

    // Check for missing fields
    if (!name || !category || !location || quantity == null) {
        return res.status(400).json({
            status: false,
            message: "Validation failed: 'name', 'category', 'location', and 'quantity' are required.",
        });
    }

    // Ensure quantity is a positive integer
    if (isNaN(quantity) || Number(quantity) < 0) {
        return res.status(400).json({
            status: false,
            message: "Validation failed: 'quantity' must be a non-negative number.",
        });
    }

    next();
};

