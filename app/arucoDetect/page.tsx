"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import MyHeader from "@/app/ui/header";
import { useOpencv } from "./cvWorker";

const OpenCVPage = () => {
    const { loading, status, addStatus, createWorker, runJS } = useOpencv();
    const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const videoRefs = useRef<{ [deviceId: string]: HTMLVideoElement | null }>(
        {}
    );
    const canvasRefs = useRef<{ [deviceId: string]: HTMLCanvasElement | null }>(
        {}
    );
    const workerRefs = useRef<{ [deviceId: string]: Worker | null }>({});

    const [streaming, setStreaming] = useState<{ [deviceId: string]: boolean }>(
        {}
    );
    const [processedImages, setProcessedImages] = useState<{
        [deviceId: string]: string | null;
    }>({});
    const intervalRefs = useRef<{ [deviceId: string]: number | null }>({});

    const [originalBuffers, setOriginalBuffers] = useState<{
        [deviceId: string]: { buffer: ArrayBuffer; view: Uint8ClampedArray };
    }>({});
    const [processedBuffers, setProcessedBuffers] = useState<{
        [deviceId: string]: {
            buffer: SharedArrayBuffer;
            view: Uint8ClampedArray;
        };
    }>({});

    useEffect(() => {
        const getCameras = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === "videoinput"
            );
            setCameras(videoDevices);
            var workerCount = 0;
            // 为每个相机创建一个新的webWorker
            videoDevices.forEach((camera) => {
                const worker = createWorker(camera.deviceId);
                workerCount++;
                console.log(
                    `Worker created for device ${workerCount} : ${camera.deviceId}`
                );
                workerRefs.current[camera.deviceId] = worker;
            });
        };

        getCameras();

        // return () => {
        //     setTimeout(() => {
        //         console.log('Cleanup function called after 1000ms');
        //         Object.keys(workerRefs.current).forEach((deviceId) => {

        //             const worker = workerRefs.current[deviceId];
        //             if (worker) {
        //                 console.log('Terminating worker for device:', deviceId);
        //               worker.terminate();
        //             }
        //           });
        //     }, 1000);

        // };
    }, []);

    const handleCameraSelect = (deviceId: string) => {
        setSelectedCameras((prevSelectedCameras) => {
            if (prevSelectedCameras.includes(deviceId)) {
                stopVideoStream(deviceId);
                return prevSelectedCameras.filter((id) => id !== deviceId);
            } else {
                startVideoStream(deviceId);
                return [...prevSelectedCameras, deviceId];
            }
        });
    };

    const startVideoStream = async (deviceId: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId },
            });
            const videoElement = videoRefs.current[deviceId];
            if (videoElement) {
                if (videoElement.srcObject) {
                    stopVideoStream(deviceId);
                }
                videoElement.srcObject = stream;
                videoElement.onloadeddata = () => {
                    if (
                        videoElement.videoWidth > 0 &&
                        videoElement.videoHeight > 0
                    ) {
                        videoElement
                            .play()
                            .then(() => {
                                setStreaming((prev) => ({
                                    ...prev,
                                    [deviceId]: true,
                                }));
                                // 延迟处理，确保 videoElement 完全准备好
                                setTimeout(() => {
                                    captureFrame(deviceId);
                                }, 100);
                            })
                            .catch((error) => {
                                console.error("Error playing video: ", error);
                            });
                    }
                };
            }
        } catch (error) {
            console.error("Error accessing camera: ", error);
        }
    };

    const stopVideoStream = (deviceId: string) => {
        const videoElement = videoRefs.current[deviceId];
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoElement.srcObject = null;
            setStreaming((prev) => ({ ...prev, [deviceId]: false }));
        }
    };

    const processImageWithJS = useCallback(
        async (
            buffer: ArrayBuffer,
            width: number,
            height: number,
            deviceId: string
        ) => {
            try {
                if (!buffer || width === 0 || height === 0) {
                    throw new Error("Invalid image dimensions");
                }

                let bufferCopy = buffer.slice(0);

                const worker = workerRefs.current[deviceId];
                if (!worker) {
                    throw new Error("Worker not initialized");
                }
                let processedBuffer: SharedArrayBuffer;
                let processedView: Uint8ClampedArray;

                if (processedBuffers[deviceId]) {
                    processedBuffer = processedBuffers[deviceId].buffer;
                    processedView = processedBuffers[deviceId].view;
                } else {
                    processedBuffer = new SharedArrayBuffer(buffer.byteLength);
                    processedView = new Uint8ClampedArray(processedBuffer);
                    setProcessedBuffers((prev) => ({
                        ...prev,
                        [deviceId]: {
                            buffer: processedBuffer,
                            view: processedView,
                        },
                    }));
                }
                await runJS(
                    worker,
                    bufferCopy,
                    processedBuffer,
                    width,
                    height,
                    deviceId
                );
                // console.log("processed buffer in main thread", processedBuffer);
                // 确保 processedBuffer 存储了处理后的数据

                // console.log(
                //     "Processed view first 10 elements in main thread: ",
                //     processedView
                // );
const processedImageBlob = new Blob([processedView], { type: "image/jpeg" });
console.log('hufeigyuhjksdcbvgchjx')
const processedImageUrl = URL.createObjectURL(processedImageBlob);
                setProcessedImages((prevImages) => ({
                    ...prevImages,
                    [deviceId]: processedImageUrl,
                }));

            } catch (error) {
                setProcessedImages((prevImages) => ({
                    ...prevImages,
                    [deviceId]: null,
                }));
            }
        },
        [runJS]
    );

    const captureFrame = useCallback(
        (deviceId: string) => {
            const videoElement = videoRefs.current[deviceId];
            const canvas = canvasRefs.current[deviceId];
            const context = canvas?.getContext("2d", {
                willReadFrequently: true,
            });
            if (videoElement && context) {
                if (
                    videoElement.videoWidth > 0 &&
                    videoElement.videoHeight > 0
                ) {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    context.drawImage(
                        videoElement,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    const image = context.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    const pixelData = image.data;
                    let buffer: ArrayBuffer, view: Uint8ClampedArray;

                    if (originalBuffers[deviceId]) {
                        buffer = originalBuffers[deviceId].buffer;
                        view = originalBuffers[deviceId].view;
                    } else {
                        buffer = new ArrayBuffer(pixelData.byteLength);
                        view = new Uint8ClampedArray(buffer);
                        setOriginalBuffers((prev) => ({
                            ...prev,
                            [deviceId]: { buffer, view },
                        }));
                    }
                    view.set(pixelData);

                    return {
                        deviceId,
                        buffer,
                        width: canvas.width,
                        height: canvas.height,
                    };
                }
            }
            return { deviceId, buffer: null, width: 0, height: 0 };
        },
        [originalBuffers]
    );

    useEffect(() => {
        let isCancelled = false;
        const processImages = async () => {
            if (isCancelled) return;

            const imageSrcPromises = selectedCameras.map(async (deviceId) => {
                const {
                    deviceId: id,
                    buffer,
                    width,
                    height,
                } = captureFrame(deviceId);
                if (buffer) {
                    await processImageWithJS(buffer, width, height, id);
                }
            });
            await Promise.all(imageSrcPromises);

            if (!isCancelled) {
                setTimeout(processImages, 500); // 调整处理频率，以减少闪烁
            }
        };
        processImages();

        return () => {
            isCancelled = true;
        };
    }, [captureFrame, processImageWithJS, selectedCameras]);

    return (
        <>
            <MyHeader className="" />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">
                    Robotic Data Monitor
                </h1>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <h2 className="text-lg font-semibold mb-2">
                            Status: &nbsp;
                            {loading === "Ready" ? (
                                <span className="text-green-500">Ready</span>
                            ) : (
                                <span className="loading loading-spinner loading-xs"></span>
                            )}
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow h-48 overflow-auto">
                            <ul className="list-disc list-inside text-xs">
                                {status.map((statusMessage, index) => (
                                    <li key={index}>{statusMessage}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label
                            htmlFor="camera-select"
                            className="block text-lg font-semibold mb-2"
                        >
                            Camera:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {cameras.map((camera, index) => (
                                <button
                                    key={camera.deviceId}
                                    onClick={() =>
                                        handleCameraSelect(camera.deviceId)
                                    }
                                    className={`btn ${
                                        selectedCameras.includes(
                                            camera.deviceId
                                        )
                                            ? "btn-primary"
                                            : "btn-outline"
                                    }`}
                                >
                                    {camera.label || `Camera ${index + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="col-span-1">
                        <h2 className="text-lg font-semibold mb-2">
                            Camera View
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex flex-wrap">
                            {selectedCameras.length > 0 ? (
                                selectedCameras.map((cameraId) => (
                                    <div key={cameraId}>
                                        <video
                                            ref={(el) => {
                                                videoRefs.current[cameraId] =
                                                    el;
                                            }}
                                            className="w-64"
                                            playsInline
                                        />
                                        <canvas
                                            ref={(el) => {
                                                canvasRefs.current[cameraId] =
                                                    el;
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p>Camera View will be shown here</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1">
                        <h2 className="text-lg font-semibold mb-2">
                            Processed Camera View
                        </h2>
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex flex-wrap">
                            {selectedCameras.length > 0 ? (
                                selectedCameras.map((cameraId) => (
                                    <div key={cameraId} className="w-64 mt-4">
                                        {processedImages[cameraId] ? (
                                            <img
                                                src={
                                                    processedImages[cameraId] ||
                                                    undefined
                                                }
                                                alt="Processed camera view"
                                                className="w-full"
                                            />
                                        ) : (
                                            <p>
                                                Processed image will be shown
                                                here
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Processed Camera View will be shown here</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OpenCVPage;
