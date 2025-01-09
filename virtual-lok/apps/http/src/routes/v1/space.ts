import { Request, Response, Router } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middlewares/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req: Request, res: Response) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    const [width, height] = parsedData.data.dimensions.split("x").map(Number);
    if (!parsedData.data.mapId) {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width,
                height,
                creatorId: req.auth.userId as string,
            }
        })
        res.json({ spaceId: space.id });
        return;
    }

    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId,
        },
        select: {
            mapElements: true,
            width: true,
            height: true,
        }
    })

    if (!map) {
        res.status(400).json({ message: "Map not found" });
        return;
    }

    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.auth.userId! as string,
            }
        })

        await client.spaceElements.createMany({
            data: map.mapElements.map((element) => ({
                spaceId: space.id,
                elementId: element.elementId,
                x: element.x!,
                y: element.y!,
            }))
        })
        return space;
    })
    res.json({ spaceId: space.id })
})

spaceRouter.delete("/element", userMiddleware, async (req: Request, res: Response) => {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    console.log("🚀 ~ spaceRouter.delete ~ parsedData: delete", parsedData)

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Failed" });
        return;
    }

    const spaceElement = await client.spaceElements.findFirst({
        where: {
            id: req.body.id as string,
        },
        include: {
            space: true,
        }
    })

    if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.auth.userId) {
        res.status(400).json({ message: "Unauthorized" });
        return;
    }

    await client.spaceElements.delete({
        where: {
            id: parsedData.data.id,
        }
    })
    res.json({ message: "Element deleted" });
    return;
})

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId,
        },
        select: {
            creatorId: true,
        }
    })

    if (!space) {
        res.status(404).json({ message: "Space not found" });
        return;
    }

    if (space?.creatorId !== req.auth.userId) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    await client.space.delete({
        where: {
            id: req.params.spaceId,
        }
    })
    res.json({ message: "Space deleted" });
})

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    console.log("🚀 ~ spaceRouter.get ~ req.auth.userId:", req.auth.userId)
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.auth.userId!,
        },
        select: {
            id: true,
            name: true,
            width: true,
            height: true,
            thumbnail: true,
        }
    })

    console.log("🚀 ~ spaceRouter.get ~ spaces:", spaces)

    res.json(({
        spaces: spaces.map((space) => ({
            id: space.id,
            name: space.name,
            dimensions: `${space.width}x${space.height}`,
            thumbnail: space?.thumbnail,
        }))
    }));

})

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ message: "Validation Faled" });
    }

    const space = await client.space.findUnique({
        where: {
            id: req.body.spaceId,
            creatorId: req.auth.userId,
        },
        select: {
            width: true,
            height: true,
        }
    })

    if (!space) {
        res.status(400).json({ message: "Space not found" });
        return;
    }

    if (req.body.x > space.width || req.body.y > space.height) {
        res.status(400).json({ message: "Invalid coordinates" });
        return;
    }

    await client.spaceElements.create({
        data: {
            spaceId: req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y,
        }
    })
    res.json({ message: "Element added" });
})

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId,
        },
        include: {
            elements: {
                include: {
                    element: true,
                }
            }
        }
    })

    if (!space) {
        res.status(404).json({ message: "Space not found" });
        return;
    }

    res.json({
        "dimensions": `${space.width}x${space.height}`,
        elements: space.elements.map(e => ({
            id: e.id,
            element: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                width: e.element.width,
                height: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        })),
    });
})