import { createWorker, createRouter } from "./webrtc";
import { startSignalingServer } from "./signaling";
import config from "../../config/default.json";

async function startMediaServer() {
    try {
        // Create mediasoup worker and router
        const worker = await createWorker(config.mediasoup.worker);
        const router = await createRouter(worker, config.mediasoup.router);

        // Start WebSocket signaling server
        startSignalingServer(router, config.websocket.port);

        console.log("Media server is running...");
    } catch (error) {
        console.error("Failed to start media server:", error);
        process.exit(1);
    }
}

startMediaServer();