import mediasoup from "mediasoup";
import { Worker, Router, WebRtcTransport } from "mediasoup/node/lib/types";
import config from "../../config/default.json";

export async function createWorker(workerSettings: any): Promise<Worker> {
    const worker = await mediasoup.createWorker(workerSettings);
    worker.on("died", () => {
        console.error("Mediasoup worker died, exiting...");
        process.exit(1);
    });
    return worker;
}

export async function createRouter(worker: Worker, routerSettings: any): Promise<Router> {
    return await worker.createRouter(routerSettings);
}

export async function createWebRtcTransport(router: Router): Promise<WebRtcTransport> {
    return await router.createWebRtcTransport({
        listenIps: [{ ip: "0.0.0.0", announcedIp: "your-public-ip" }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
    });
}