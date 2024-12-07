import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL } from "../global";
require("dotenv").config();

const prisma = new PrismaClient({ errorFormat: "pretty" });

// Get all items (Retrieve)
export const getAllItem = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const items = await prisma.item.findMany({
            where: { name: { contains: search?.toString() || "" } },
    });

    return res.status(200).json({
        status: true,
        data: items,
        message: "Berhasil melihat item",
    });
} catch (error) {
    return res.status(400).json({
        status: false,
        message: `Error retrieving items: ${error}`,
    });
}
};

// Create a new item (Add)
export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, category, location, quantity } = req.body;

const newItem = await prisma.item.create({
    data: {
        name,
        category,
        location,
        quantity: Number(quantity),
        },
    });

return res.status(201).json({
        status: true,
        data: newItem,
        message: "Item telah dibuat",
    });
    } catch (error) {
    return res.status(400).json({
        status: false,
        message: `Error creating item: ${error}`,
    });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { idItem } = req.params;
        const { name, category, location, quantity } = req.body;

    const existingItem = await prisma.item.findUnique({
        where: { id: Number(idItem) },
    });

if (!existingItem) {
    return res.status(404).json({
        status: false,
        message: "Item TIDAK ADA",
        });
}

const updatedItem = await prisma.item.update({
        where: { id: Number(idItem) },
        data: {
            name: name || existingItem.name,
            category: category || existingItem.category,
            location: location || existingItem.location,
            quantity: quantity ? Number(quantity) : existingItem.quantity
        },
    });

    return res.status(200).json({
        status: true,
        data: updatedItem,
        message: "Berhasil update item",
    });
    } catch (error) {
    return res.status(400).json({
        status: false,
        message: `Error updating item: ${error}`,
    });
    }
};


// Delete an item (Remove)
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { idItem } = req.params;

    const item = await prisma.item.findUnique({
        where: { id: Number(idItem) },
    });

    if (!item) {
        return res.status(404).json({
            status: false,
            message: "Item TIDAK ADA",
    });
    }

    const deletedItem = await prisma.item.delete({
        where: { id: Number(idItem) },
    });

    return res.status(200).json({
        status: true,
        data: deletedItem,
        message: "Berhasil menghapus item",
    });
} catch (error) {
    return res.status(400).json({
        status: false,
        message: `Error deleting item: ${error}`,
    });
}
};

// Get item by ID (Retrieve by ID)
export const getItemById = async (req: Request, res: Response) => {
    try {
        const { idItem } = req.params;

        // Validasi ID harus angka
        const itemId = parseInt(idItem);
        if (isNaN(itemId)) {
            return res.status(400).json({
                status: false,
                message: "Invalid item ID",
            });
        }

        const item = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            return res.status(404).json({
                status: false,
                message: "Item TIDAK ADA",
            });
        }

        return res.status(200).json({
            status: true,
            data: item,
            message: "SUKSES MENGAMBIL",
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error retrieving item: ${error}`,
        });
    }
};

