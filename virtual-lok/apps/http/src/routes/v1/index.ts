import { Router, Request, Response } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { SigninSchema, SignupSchema } from "../../types";
import { hash, compare } from "../../scrypt";
export const router = Router();
import client from "@repo/db/client"
import { tokenToString } from "typescript";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";


router.post("/signup", async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "invalid data" })
        return;
    }

    const hashPassword = await hash(parsedData.data.password);

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User",
            }
        })
        console.log("🚀 ~ router.post ~ signup:", parsedData.data.username, parsedData.data.type)
        res.json({
            userId: user.id,
        })
        return;
    } catch (e) {
        res.status(400).json({ message: "User already exists" })
        return;
    }
})

router.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({ message: "validation failed" })
        return;
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username,
            }
        })
        if (!user) {
            res.status(403).json({ message: "invalid credentials" })
            return;
        }

        const isValid = await compare(parsedData.data.password, user.password);
        if (!isValid) {
            res.status(403).json({ message: "invalid credentials" })
            return;
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role,
        }, JWT_SECRET, {
            expiresIn: "24h",
        })
        console.log("🚀 ~ router.post ~ token:", token, user.id, user.role, parsedData.data.username)
        res.json({
            message: "signin",
            token,
        })
    } catch (e) {
        res.status(400).json({ message: "Internal server error" })
        return;
    }
})

router.get("/elements", async (req: Request, res: Response) => {
    const elements = await client.element.findMany();
    res.json({
        elements: elements.map((element) => ({
            id: element.id,
            imageUrl: element.imageUrl,
            width: element.width,
            height: element.height,
            static: element.static,
        }))
    })
})

router.get("/avatars", async (req, res) => {
    const avatars = await client.avatar.findMany();
    res.json({
        avatars: avatars.map((avatar) => ({
            id: avatar.id,
            name: avatar.name,
            imageUrl: avatar.imageUrl,
        })) 
    })

})

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
