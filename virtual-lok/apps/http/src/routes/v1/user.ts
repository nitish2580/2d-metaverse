import { Router, Request, Response } from "express";

export const userRouter = Router();
import client from "@repo/db/client"
import { updateMetaDataSchema } from "../../types";
import { userMiddleware } from "../../middlewares/user";


userRouter.post("/", userMiddleware, (req: Request, res: Response) => {
    console.log("user detials");
    res.status(200).send({ message: "User Details" })
    return;
})

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const {
        auth: { userId },
    } = req;
    const parsedData = updateMetaDataSchema.safeParse(req.body);
    // console.log("🚀 ~ userRouter.post ~ parsedData:", parsedData)
    if (!parsedData.success) {
        console.log("Parsed data failed")
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    try{
        await client.user.update({
            where: {
                id: userId,
            },
            data: {
                avatarId: parsedData.data?.avatarId,
            }
        })
        res.status(200).json({ message: "Metadata Updated" })
        return;
    } catch (e) {
        console.log("error")
        res.status(400).json({ message: "Internal server error" })
    }
})

userRouter.get("/metadata/bulk", async (req, res) => {
    const userIdstring = (req.query.ids || "[]") as string;
    console.log("🚀 ~ userRouter.get ~ req.query.ids:", req.query.ids)
    const userIds = userIdstring.slice(1, userIdstring.length - 1).split(",");
    const metaData = await client.user.findMany({
        where: {
            id: {
                in: userIds,
            }
        }, select: {
            avatar: true,
            id: true
        }
    })
    
    res.status(200).json(
        {
            avatars: metaData.map((data) => ({
                id: data.id,
                avatar: data.avatar?.imageUrl,
            })),
        }
    )
    return;
})