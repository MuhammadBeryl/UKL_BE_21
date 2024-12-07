import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const analyzeUsage = async (request: Request, response: Response) => {
    const { start_date, end_date, group_by } = request.body;

    if (!start_date || !end_date || !group_by) {
        return response.status(400).json({
            status: "error",
            message: "Tanggal mulai, tanggal akhir, dan kriteria pengelompokan harus diisi.",
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response.status(400).json({
            status: "error",
            message: "Format tanggal tidak valid.",
        });
    }

    try {
        let usageReport;
        let additionalInfo: Array<{ id: number, [key: string]: any }> = [];

        // Query penggunaan barang berdasarkan kriteria pengelompokan
        if (group_by === 'category') {
            usageReport = await prisma.borrow.groupBy({
                by: ['itemId'],
                where: {
                    borrowDate: {
                        gte: startDate,
                    },
                },
                _count: {
                    itemId: true,
                },
                _sum: {
                    qty: true,
                },
            });

            // KATEGORY
            const ids = usageReport.map(item => item.itemId);
            additionalInfo = await prisma.item.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, category: true }
            });
        } else if (group_by === 'location') {
            usageReport = await prisma.borrow.groupBy({
                by: ['itemId'],
                where: {
                    borrowDate: {
                        gte: startDate,
                    },
                },
                _count: {
                    itemId: true,
                },
                _sum: {
                    qty: true,
                },
            });

            // LOCATION
            const ids = usageReport.map(item => item.itemId);
            additionalInfo = await prisma.item.findMany({
                where: {
                    id: { in: ids }
                },
                select: { id: true, location: true }
            });
        } else {
            return response.status(400).json({
                status: "error",
                message: "Kriteria pengelompokan tidak valid. Gunakan 'category' atau 'location'.",
            });
        }

        //menghitung peminjaman yang sudah dikembalikan dalam periode analisis
        const returnedItems = await prisma.borrow.groupBy({
            by: ['itemId'],
            where: {
                borrowDate: {
                    gte: startDate,
                },
                returnDate: {
                    gte: startDate,
                    lte: endDate // Memastikan hanya pengembalian dalam periode analisis yang dihitung
                },
                status: 'RETURNED' // Pastikan hanya yang statusnya 'kembali'
            },
            _count: {
                itemId: true,
            },
            _sum: {
                qty: true,
            },
        });

        //menghitung peminjaman yang belum dikembalikan atau dikembalikan setelah periode analisis
        const notReturnedItems = await prisma.borrow.groupBy({
            by: ['itemId'],
            where: {
                borrowDate: {
                    gte: startDate,
                },
                OR: [
                    {
                        returnDate: {
                            gt: endDate
                        }
                    },
                    {
                        returnDate: {
                            equals: new Date(0)
                        }
                    },
                    {
                        status: 'RETURNED'
                    }
                ]
            },
            _count: {
                itemId: true,
            },
            _sum: {
                qty: true,
            },
        });

        // Menyusun hasil analisis untuk respons
        const usageAnalysis = usageReport.map(item => {
            const info = additionalInfo.find(info => info.id === item.itemId);
            const returnedItem = returnedItems.find(returned => returned.itemId === item.itemId);
            const totalReturned = returnedItem?._count?.itemId ?? 0; // Jika _count itemId null, gunakan 0
            const itemsInUse = item._count.itemId - totalReturned;
            return {
                group: info ? info[group_by as keyof typeof info] : 'Unknown',
                total_borrowed: item._count.itemId,
                total_returned: totalReturned,
                items_in_use: itemsInUse
            };
        });

        response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                },
                usage_analysis: usageAnalysis
            },
            message: "Laporan penggunaan barang berhasil dihasilkan.",
        });
    } catch (error) {
        response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan. ${(error as Error).message}`,
        });
    }
};

//BorrowAnalysis
export const borrowAnalysis = async (request: Request, response: Response) => {
    const { start_date, end_date } = request.body;

    // Validasi input
    if (!start_date || !end_date) {
        return response.status(400).json({
            status: "error",
            message: "Tanggal mulai dan tanggal akhir harus diisi.",
        });
    }

    // Validasi format tanggal
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return response.status(400).json({
            status: "error",
            message: "Format tanggal tidak valid.",
        });
    }

    try {
        // Query untuk mendapatkan barang paling sering dipinjam
        const frequentlyBorrowedItems = await prisma.borrow.groupBy({
            by: ["itemId"],
            where: {
                borrowDate: {
                    gte: startDate,
                },
                returnDate: {
                    lte: endDate,
                },
            },
            _count: {
                itemId: true,
            },
            orderBy: {
                _count: {
                    itemId: "desc",
                },
            },
        });

        // Mendapatkan informasi tambahan untuk barang paling sering dipinjam
        const frequentlyBorrowedItemDetails = await Promise.all(
            frequentlyBorrowedItems.map(async (item) => {
                const barang = await prisma.item.findUnique({
                    where: { id: item.itemId },
                    select: { id: true, name: true, category: true, location: true },
                });
                return barang
                    ? {
                          item_id: item.itemId,
                          name: barang.name,
                          category: barang.category,
                          location: barang.location,
                          total_borrowed: item._count.itemId,
                      }
                    : null;
            })
        ).then((results) => results.filter((item) => item !== null)); // Menghapus item yang null

        // Query untuk mendapatkan barang dengan pengembalian telat
        const inefficientItems = await prisma.borrow.groupBy({
            by: ["itemId"],
            where: {
                borrowDate: {
                    gte: startDate,
                },
                returnDate: {
                    gt: endDate, // Barang dikembalikan setelah periode analisis
                },
            },
            _count: {
                itemId: true,
            },
            _sum: {
                qty: true,
            },
            orderBy: {
                _count: {
                    itemId: "desc",
                },
            },
        });

        // Mendapatkan informasi tambahan untuk barang dengan pengembalian telat
        const inefficientItemDetails = await Promise.all(
            inefficientItems.map(async (item) => {
                const barang = await prisma.item.findUnique({
                    where: { id: item.itemId },
                    select: { id: true, name: true, category: true, location: true },
                });
                return barang
                    ? {
                          item_id: item.itemId,
                          name: barang.name,
                          category: barang.category,
                          location: barang.location,
                          total_delayed: item._count.itemId,
                          total_quantity: item._sum.qty,
                      }
                    : null;
            })
        ).then((results) => results.filter((item) => item !== null)); // Menghapus item yang null

        // Mengembalikan hasil analisis
        return response.status(200).json({
            status: "success",
            data: {
                frequentlyBorrowedItems: frequentlyBorrowedItemDetails,
                inefficientItems: inefficientItemDetails,
            },
        });
    } catch (error) {
        return response.status(500).json({
            status: "error",
            message: `Error performing analysis: ${error}`,
        });
    }
};
