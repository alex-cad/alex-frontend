import { useState, useRef, useCallback } from "react";
import { add } from "three/examples/jsm/nodes/Nodes.js";

var countForPostMessage = 0;
var processTimeArrayForPost: number[] = [];

export const useOpencv = () => {
    const [loading, setLoading] = useState<string>("Loading cv");
    const [status, setStatus] = useState<string[]>([]);
    const statusRef = useRef<string[]>([]);

    const addStatus = (message: string) => {
    // 检查是否是特定的消息
    const isSpecialMessage = message === 'Loading OpenCV' || message === 'OpenCV loaded';

    // 如果是特定消息且已经存在，则不添加
    if (isSpecialMessage && statusRef.current.some((m) => m.includes(message))) {
        return;
    }

    // 否则，添加新的状态消息
    statusRef.current = [...statusRef.current, message];
    setStatus([...statusRef.current]);
};

    const createWorker = useCallback(
        (deviceId: string) => {
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
                    // addStatus("Ready to go!");
                } else if (type === "JS_RESULT") {
                    document.dispatchEvent(new CustomEvent("js-result", { detail: { result, deviceId } }));
                } else if (type === "TIME") {
                    addStatus(`Time: ${message}`);
                    console.log(`Time: ${message}`);
                } else if (type === "PYTHON_ERROR") {
                    console.error(`Python error for device ${deviceId}:`, error);
                }
            };

            return worker;
        },
        [addStatus]
    );

    const runJS = (worker: Worker, buffer: ArrayBuffer, processedBuffer: SharedArrayBuffer, width: number, height: number, deviceId: string, isRecordData: boolean, markerSize: number) => {
        return new Promise<void>((resolve, reject) => {
            // if (isRecordData) {
            //  addStatus("Recording Data");
            // }
            const handleMessage = (event: MessageEvent) => {
                if (event.data.type === "JS_RESULT" && event.data.deviceId === deviceId) {
                    if (isRecordData) {
                        document.dispatchEvent(new CustomEvent("js-result", { detail: { result: event.data.result, deviceId } }));
                    }
                    // 检查 processedBuffer 的数据
                    // const processedView = new Uint8ClampedArray(processedBuffer);
                    // console.log("Processed view first 10 elements in main thread: ", processedView.slice(0, 10));
                    // document.dispatchEvent(new CustomEvent('js-result', { detail: { result: event.data.result, deviceId } }));
                    resolve();
                    // resolve(event.data.result);
                } else if (event.data.type === "JS_ERROR" && event.data.deviceId === deviceId) {
                    reject(event.data.error);
                }
                worker.removeEventListener("message", handleMessage);
            };

            worker.addEventListener("message", handleMessage);
            let startTime = performance.now();
            worker.postMessage({ type: "RUN_JS", buffer, processedBuffer, width, height, deviceId, isRecordData, markerSize }, [buffer]);
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
                // console.log("Average processing time for 10 frames (post): ", avg);
                processTimeArrayForPost = [];
            }
        });
    };

    const getPoseData = (worker: Worker, deviceId: string) => {
        return new Promise<{ num: number, time: number, markerId: string, rvecs: number[], tvecs: number[] }[]>((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
                if (event.data.type === "POSE_DATA" && event.data.deviceId === deviceId) {
                    resolve(event.data.result);
                }
                worker.removeEventListener("message", handleMessage);
            };

            worker.addEventListener("message", handleMessage);
            worker.postMessage({ type: "GET_POSE", deviceId });
        });
    };

    return { loading, status, addStatus, createWorker, runJS, getPoseData };
};
