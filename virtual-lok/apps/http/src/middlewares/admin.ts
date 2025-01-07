import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";
import "../types"

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers["auhorization"] as string | undefined;

    if (!headers) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const tokens: string = headers.split(" ")[1];

    if (!tokens) {
        res.status(403).json({ message: "Unauthorized" });
    }

    try {
        const userDetails = jwt.verify(tokens, JWT_SECRET) as { role: string, userId: string }; 
        req.auth = {
            ...userDetails
        }
        next();
    } catch (error) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }
}