import * as mediasoup from 'mediasoup';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);
const PORT = 4000;

let worker;
let router;

// Create a Mediasoup worker
(async () => {
    try {
        worker = await mediasoup.createWorker({
            logLevel: 'warn',
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
        });

        console.log('Mediasoup Worker created');

        // Create a router
        router = await worker.createRouter({
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000,
                    },
                },
            ],
        });

        console.log('Router created');
    } catch (error) {
        console.error('Error creating worker or router:', error);
    }
})();

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
