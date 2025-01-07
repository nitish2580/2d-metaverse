import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request, Response } from "express";
import "../types"

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers["authorization"] as string | undefined;
    console.log("🚀 ~ userMiddleware ~ headers:", headers)

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
        if(userDetails.role !== "User") {
            res.status(403).json({ message: "Unauthorized" })
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