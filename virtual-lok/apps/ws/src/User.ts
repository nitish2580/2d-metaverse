import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { OutGoingMessage } from "./type";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

function getRandomString(length: number) {
    const Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += Characters.charAt(Math.floor(Math.random() * Characters.length));
    }
    return result;
}

export class User {
    public id: string;
    private userId?: string;
    private spaceId?: string;
    private x: number;
    private y: number;
    private ws: WebSocket;

    constructor( ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        console.log("in constructor")
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            console.log("🚀 ~ User ~ this.ws.on ~ parsedData:", parsedData)
            switch (parsedData.type) {
                case "join":
                    console.log("usere joined here ")
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    console.log("🚀 ~ User ~ this.ws.on ~ token:", token)
                    if(!token) {
                        this.ws.close();
                        console.log("no token")
                        return;
                    }
                    const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload).userId;
                    console.log("🚀 ~ User ~ this.ws.on ~ userId:", userId)
                    if (!userId) {
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    });
                    console.log("🚀 ~ User ~ this.ws.on ~ space:", space)

                    if (!space) {
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceId;
                    console.log("🚀 ~ User ~ this.ws.on ~ spaceId:", spaceId)
                    this.x = Math.floor(Math.random() * space.width);
                    this.y = Math.floor(Math.random() * space.height);

                    RoomManager.getInstance().addUser(spaceId, this);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y,
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.map(u => ({ id: u.id })) ?? []
                        }
                    });
                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y,
                        }
                    }, this, this.spaceId!);
                    break;
                case "move": {
                    console.log("usere moved here ")
                    const movex = parsedData.payload.x;
                    const movey = parsedData.payload.y;
                    const xDisplacement = Math.abs(this.x - movex);
                    const yDisplacement = Math.abs(this.y - movey);

                    if ((xDisplacement == 1 && yDisplacement == 0) || (xDisplacement == 0 && yDisplacement == 1)) {
                        this.x = movex;
                        this.y = movey;
                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                id: this.id,
                                x: this.x,
                                y: this.y
                            }
                        }, this, this.spaceId!);
                    }

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    })
                }
            }
        });
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId,
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this.spaceId!, this);
    }

    send(payload: OutGoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}