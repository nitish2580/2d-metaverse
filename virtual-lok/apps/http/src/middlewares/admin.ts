import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";
import "../types"

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers["authorization"] as string | undefined;
    console.log("🚀 ~ adminMiddleware ~ headers:", req.originalUrl)

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
        // console.log("🚀 ~ adminMiddleware ~ userDetails:", userDetails)
        console.log("🚀 ~ adminMiddleware ~ userDetails.role ", userDetails.role !== "Admin")
        if (userDetails.role !== "Admin") {
            console.log("🚀 ~ adminMiddleware ~ userDetails.role:", userDetails.role)
            res.status(403).json({ message: "Unauthorized" })
            return
        }
        req.auth = {
            ...userDetails
        }
        next();
    } catch (error) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }
}