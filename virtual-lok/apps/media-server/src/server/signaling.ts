import WebSocket from "ws";
import { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import config from "../../config/default.json";

export function startSignalingServer(router: Router, port: number) {
    const wss = new WebSocket.Server({ port });

    wss.on("connection", (ws) => {
        console.log("Client connected");

        ws.on("message", async (message: string) => {
            const data = JSON.parse(message);

            switch (data.action) {
                case "createTransport":
                    const transport = await router.createWebRtcTransport({
                        listenIps: config.mediasoup.transport.listenIps,
                    });

                    ws.send(
                        JSON.stringify({
                            action: "createTransport",
                            id: transport.id,
                            iceParameters: transport.iceParameters,
                            iceCandidates: transport.iceCandidates,
                            dtlsParameters: transport.dtlsParameters,
                        })
                    );
                    break;

                case "connectTransport":
                    const transport = router.getTransportById(data.transportId);
                    await transport.connect({ dtlsParameters: data.dtlsParameters });
                    ws.send(JSON.stringify({ action: "connectTransport", success: true }));
                    break;

                case "produce":
                    const producer = await transport.produce({
                        kind: data.kind,
                        rtpParameters: data.rtpParameters,
                    });
                    ws.send(JSON.stringify({ action: "produce", id: producer.id }));
                    break;

                case "consume":
                    const consumer = await transport.consume({
                        producerId: data.producerId,
                        rtpCapabilities: data.rtpCapabilities,
                    });
                    ws.send(
                        JSON.stringify({
                            action: "consume",
                            id: consumer.id,
                            producerId: consumer.producerId,
                            kind: consumer.kind,
                            rtpParameters: consumer.rtpParameters,
                        })
                    );
                    break;

                default:
                    console.warn("Unknown action:", data.action);
            }
        });
    });
    console.log(`Signaling server is running on port ${port}`);
}