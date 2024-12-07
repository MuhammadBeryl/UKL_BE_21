// import { Request, Response } from "express";
// import { Item, PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({ errorFormat: "pretty" });

import { Request, Response } from "express";
import { PrismaClient, Item, BorrowStatus } from "@prisma/client";
import { date } from "joi";

const prisma = new PrismaClient();

export const borrowItem = async (req: Request, res: Response) => {
    try {
        const { itemId, borrowDate, returnDate, userId } = req.body;

        // Validasi item
        const item = await prisma.item.findUnique({
            where: { id: Number(itemId) },
        });

        if (!item) {
            return res.status(404).json({
                status: false,
                message: "Item not found",
            });
        }

        // Validasi user
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Buat catatan peminjaman
        const borrow = await prisma.borrow.create({
            data: {
                itemId: item.id,
                userId: user.id,
                borrowDate: borrowDate ? new Date(borrowDate) : undefined,
                returnDate: returnDate ? new Date(returnDate) : undefined,
            },
        });

        return res.status(201).json({
            status: true,
            data: borrow,
            message: "Item borrowed successfully",
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error borrowing item: ${error}`,
        });
    }
};

// export const returnItem = async (req: Request, res: Response) => {
//     try {
//         const { borrowId } = req.body; // Ambil borrowId dari body

//         if (!borrowId) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Borrow ID is required in the request body.",
//             });
//         }

//         // Validasi peminjaman
//         const borrow = await prisma.borrow.findUnique({
//             where: { id: Number(borrowId) },
//             include: { item: true, user: true },
//         });

//         if (!borrow) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Borrow record not found",
//             });
//         }

//         if (borrow.status === 'RETURNED'){
//             return res.status(400).json({
//               status: false,
//               message: `Barang sudah dikembalikan dan tidak bisa dikembalikan lagi.`,
//             })
//         }

//         // Perbarui tanggal pengembalian aktual
//         const actualReturnDate = new Date();
//         const updatedBorrow = await prisma.borrow.update({
//             where: { id: borrow.id },
//             data: {
//                 returnDate: actualReturnDate,
//             },
//             include: {
//                 item: true,
//                 user: true,
//             },
//         });

//         // Berikan respons sukses dengan borrowId, userId, itemId, dan actual_return_date
//         return res.status(200).json({
//             status: true,
//             data: {
//                 borrowId: updatedBorrow.id,
//                 userId: updatedBorrow.userId,
//                 itemId: updatedBorrow.itemId,
//                 actual_return_date: updatedBorrow.returnDate,
//                 itemDetails: updatedBorrow.item,
//                 userDetails: updatedBorrow.user,
//             },
//             message: "Item Telah direturn",
//         });
//     } catch (error) {
//         return res.status(400).json({
//             status: false,
//             message: `Error returning item: ${error}`,
//         });
//     }
// };

export const returnItem = async (request: Request, response: Response) => {
    try {
        const { borrowId, returnDate, status,qty } = request.body;

        const peminjaman = await prisma.borrow.findUnique({ 
          where: { 
            id: Number(borrowId) 
          },
             select: { qty: true,status:true,itemId:true },
            });;
          if (!peminjaman) 
            { return response.status(404).json({
               status: false, 
               message: "Data peminjaman tidak ditemukan",
               });
              }
              if (peminjaman.status === "RETURNED"){
                return response.status(400).json({
                  status: false,
                  message: `Barang sudah dikembalikan dan tidak bisa dikembalikan lagi.`,
                })
              }
        const updatedPeminjaman = await prisma.borrow.update({
            where: { id: Number(borrowId) },
            data: {
                returnDate: new Date(returnDate),
                status: status,
            },
        })  

        const updateBarang = await prisma.item.update({
           where: { 
            id: Number(peminjaman.itemId),
          }, data: { 
            quantity: { 
              increment: peminjaman.qty, 
            }, 
          },
        })

        return response.json({
            status: true,
            data: updatedPeminjaman,
            message: "Pengembalian barang berhasil dicatat",
        }).status(200);
    } catch (error) {
        return response.json({
            status: false,
            message: `Terjadi kesalahan. ${error}`,
        }).status(400);
    }
};


// Fungsi untuk menghasilkan laporan penggunaan barang
// export const reportItemUsage = async (req: Request, res: Response) => {
//     try {
//       const { start_date, end_date, group_by } = req.body;
  
//       // Validasi tanggal
//       if (!start_date || !end_date) {
//         return res.status(400).json({
//           status: false,
//           message: 'start_date and end_date are required',
//         });
//       }
  
//       // Pastikan format tanggal benar
//       const startDate = new Date(start_date);
//       const endDate = new Date(end_date);
  
//       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         return res.status(400).json({
//           status: false,
//           message: 'Invalid date format',
//         });
//       }
  
//       // Memastikan nilai `group_by` valid
//       if (!['item', 'category'].includes(group_by)) {
//         return res.status(400).json({
//           status: false,
//           message: 'Invalid group_by value. It should be "item" or "category".',
//         });
//       }
  
//       let queryResult;
      
//       // Jika group_by adalah 'item'
//       if (group_by === 'item') {
//         queryResult = await prisma.borrow.groupBy({
//           by: ['itemId'],
//           _count: {
//             id: true,  // Menghitung jumlah peminjaman
//           },
//           where: {
//             borrowDate: {
//               gte: startDate,  // Filter berdasarkan tanggal peminjaman
//               lte: endDate,
//             },
//           },
//         });
//       }
//       // Jika group_by adalah 'category'
//       else if (group_by === 'category') {
//         queryResult = await prisma.borrow.groupBy({
//           by: ['itemId'],
//           _count: {
//             id: true,  // Menghitung jumlah peminjaman
//           },
//           where: {
//             borrowDate: {
//               gte: startDate,  // Filter berdasarkan tanggal peminjaman
//               lte: endDate,
//             },
//           },
//         });
//       }
  
//       // Ambil detail item terkait setelah groupBy
//       const itemIds = queryResult.map(record => record.itemId);
//       const items = await prisma.item.findMany({
//         where: {
//           id: { in: itemIds },  // Ambil item berdasarkan itemIds yang didapatkan
//         },
//       });
  
//       // Membentuk laporan berdasarkan data yang didapat
//       const report = queryResult.map((record) => {
//         const item = items.find(item => item.id === record.itemId);  // Temukan item berdasarkan itemId
//         return {
//           item: item?.name || 'Unknown',
//           quantity_used: record._count.id,
//           category: item?.category || 'Unknown',
//           location: item?.location || 'Unknown',
//         };
//       });
  
//       // Mengembalikan laporan dalam bentuk JSON
//       return res.status(200).json({
//         status: true,
//         report: report,
//         message: 'Report generated successfully',
//       });
//     } catch (error) {
//       return res.status(400).json({
//         status: false,
//         message: `Error generating report: ${error}`,
//       });
//     }
//   };