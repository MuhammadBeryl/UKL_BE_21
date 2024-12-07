import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import dotenv from 'dotenv';
import { SECRET } from "../global";
dotenv.config();


interface JwtPayload {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided' });
    }

    try {
        const decoded = verify(token, SECRET) as JwtPayload;
        req.body.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: `Invalid token: ${error}` });
    }
};

export const verifyRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.body.user;

        if (!user) {
            return res.status(403).json({ message: "User not found" });
        }

        if (!allowedRoles.includes(user.role)) {
            return res
                .status(403)
                .json({ message: "You are not allowed to access this resource" });
        }

        next();
    };
};
