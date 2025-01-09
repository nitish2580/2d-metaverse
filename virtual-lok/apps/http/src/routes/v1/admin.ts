import { Request, Router, Response } from "express";
import { CreateAvatarSchema, CreateElementScehma, CreateMapSchema, UpdateElementSchema } from "../../types";
import { adminMiddleware } from "../../middlewares/admin";
import client from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req: Request, res: Response) => {
    const parsedData = CreateElementScehma.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Falied" });
        return;
    }

    const element = await client.element.create({
        data: {
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
            imageUrl: parsedData.data.imageUrl,
        }
    })

    res.status(201).json({ message: "Element created", id: element.id });
    return;
})

adminRouter.put("/element/:elementId", adminMiddleware, async (req: Request, res: Response) => {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    console.log("🚀 ~ adminRouter.put ~ parsedData:", parsedData)

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    console.log("🚀 ~ adminRouter.put ~ req.params.elementId:", JSON.stringify(req.params))
    await client.element.update({
        where: {
            id: req.params.elementId,
        },
        data: {
            imageUrl: parsedData.data.imageUrl,
        }
    })
    res.status(200).json({ message: "Element updated" });
})

adminRouter.post("/avatar", adminMiddleware, async (req: Request, res: Response) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    const avatar = await client.avatar.create({
        data: {
            imageUrl: parsedData.data.imageUrl,
            name: parsedData.data.name,
        }
    })

    res.status(201).json({ avatarId: avatar.id })
    return;
})

adminRouter.post("/map", adminMiddleware, async(req: Request, res: Response) => {
    const parsedData = CreateMapSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            width: parseInt(parsedData.data.dimensions.split("x")[0]),
            height: parseInt(parsedData.data.dimensions.split("x")[1]),
            thumbnail: parsedData.data.thumbnail,
            mapElements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })

    res.status(201).json({ message: "Map created", id: map.id });
    return;
})
