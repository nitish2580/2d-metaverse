import { exec } from "child_process";

export function recordStream(inputUrl: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = `ffmpeg -i ${inputUrl} -c copy ${outputPath}`;
        exec(command, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}