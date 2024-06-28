import { useState, useRef, useCallback } from "react";

var countForPostMessage = 0;
var processTimeArrayForPost: number[] = [];

export const useOpencv = () => {
    const [loading, setLoading] = useState<string>("Loading cv");
    const [status, setStatus] = useState<string[]>([]);
    const statusRef = useRef<string[]>([]);

    const addStatus = (message: string) => {
        if (!statusRef.current.includes(message)) {
            statusRef.current = [...statusRef.current, message];
            setStatus([...statusRef.current]);
        }
    };

    const createWorker = useCallback((deviceId: string) => {
        const worker = new Worker(new URL("./webWorker.js", import.meta.url));

        worker.onmessage = (event) => {
            const { type, message, result, error } = event.data;
            if (type === "STATUS") {
                addStatus(message);
            } else if (type === "ERROR") {
                setLoading(`Error: ${message}`);
                addStatus(`Error: ${message}`);
            } else if (type === "LOADED") {
                setLoading("Ready");
                addStatus("Ready to go!");
            } else if (type === 'JS_RESULT') {
                document.dispatchEvent(new CustomEvent('js-result', { detail: { result, deviceId } }));
            } else if (type === "TIME") {
                addStatus(`Time: ${message}`);
                console.log(`Time: ${message}`);
            } else if (type === "PYTHON_ERROR") {
                console.error(`Python error for device ${deviceId}:`, error);
            }
        };

        return worker;
    }, [addStatus]);

    const runJS = (
        worker: Worker,
        buffer: ArrayBuffer,
        processedBuffer: SharedArrayBuffer,
        width: number,
        height: number,
        deviceId: string
    ) => {
        return new Promise<void>((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
                if (
                    event.data.type === "JS_RESULT" &&
                    event.data.deviceId === deviceId
                ) {
                     // 检查 processedBuffer 的数据
                // const processedView = new Uint8ClampedArray(processedBuffer);
                // console.log("Processed view first 10 elements in main thread: ", processedView.slice(0, 10));

                resolve();
                    // resolve(event.data.result);
                } else if (
                    event.data.type === "JS_ERROR" &&
                    event.data.deviceId === deviceId
                ) {
                    reject(event.data.error);
                }
                worker.removeEventListener("message", handleMessage);
            };

            worker.addEventListener("message", handleMessage);
            let startTime = performance.now();
            worker.postMessage({ type: "RUN_JS", buffer, processedBuffer, width, height, deviceId }, [buffer]);
            let endTime = performance.now();
            processTimeArrayForPost.push(endTime - startTime);
            countForPostMessage++;
            if (countForPostMessage % 10 === 0) {
                // 计算平均值
                countForPostMessage = 0;
                let sum = 0;
                for (let i = 0; i < processTimeArrayForPost.length; i++) {
                    sum += processTimeArrayForPost[i];
                }
                let avg = sum / processTimeArrayForPost.length;
                console.log(
                    "Average processing time for 10 frames (post): ",
                    avg
                );
                processTimeArrayForPost = [];
            }
        });
    };

    return { loading, status, addStatus, createWorker, runJS };
};
