"use client";

import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from "react";
import Webcam from "react-webcam";
import { usePyodide } from "./pyWorker";
import MyHeader from "@/app/ui/header";

var count: number = 0;
var processTimeArray: number[] = [];

var countForatob: number = 0;
var processTimeArrayForatob: number[] = [];

var countForbtoa: number = 0;
var processTimeArrayForbtoa: number[] = [];

const PyodidePage = () => {
    const { loading, status, addStatus, runPython } = usePyodide();
    const [output, setOutput] = useState<string | null>(null);
    const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [processedImages, setProcessedImages] = useState<{
        [deviceId: string]: string | null;
    }>({});
    const webcamRefs = useRef<{ [deviceId: string]: Webcam | null }>({});
    const [processingTimes, setProcessingTimes] = useState<
        Record<string, number>
    >({});

    const handleCameraSelect = (deviceId: string) => {
        setSelectedCameras((prevSelectedCameras) => {
            if (prevSelectedCameras.includes(deviceId)) {
                return prevSelectedCameras.filter((id) => id !== deviceId);
            } else {
                return [...prevSelectedCameras, deviceId];
            }
        });
    };

    const captureFrame = useCallback((deviceId: string) => {
        const webcam = webcamRefs.current[deviceId];
        if (webcam) {
            const video = webcam.video;
            // console.log("video.videoWidth: ", video.videoWidth);
            const imageSrc = webcam.getScreenshot({
                width: 1920,
                height: 1080,
            });
            if (imageSrc) {
                const binaryString = atob(imageSrc.split(",")[1]);
                const len = binaryString.length;
                const buffer = new ArrayBuffer(len);
                const uint8Array = new Uint8Array(buffer);
                for (let i = 0; i < len; i++) {
                    uint8Array[i] = binaryString.charCodeAt(i);
                }
                return {
                    deviceId,
                    buffer,
                    width: video.videoWidth,
                    height: video.videoHeight,
                };
            }
        }
        return { deviceId, buffer: null, width: 0, height: 0 };
    }, []);

    const processImageWithPython = useCallback(
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

                const processedBuffer = await runPython(
                    buffer,
                    width,
                    height,
                    deviceId
                );

                const processedUint8Array = new Uint8Array(processedBuffer);

                let startTime = performance.now();
                // 将 Uint8Array 转换为 Base64 字符串
                let binaryString = "";
                for (let i = 0; i < processedUint8Array.length; i++) {
                    binaryString += String.fromCharCode(processedUint8Array[i]);
                }
                const processedBase64String = btoa(binaryString);
                let endTime = performance.now();
                let processingTime = endTime - startTime;
                processTimeArrayForbtoa.push(processingTime);
                countForbtoa++;
                if (countForbtoa % 10 === 0) {
                    //计算平均值
                    countForbtoa = 0;
                    let sum = 0;
                    for (let i = 0; i < processTimeArrayForbtoa.length; i++) {
                        sum += processTimeArrayForbtoa[i];
                    }
                    let avg = sum / processTimeArrayForbtoa.length;
                    console.log(
                        "Average processing time for 10 frames (btoa): ",
                        avg
                    );
                    processTimeArrayForbtoa = [];
                }

                setProcessedImages((prevImages) => ({
                    ...prevImages,
                    [deviceId]: `data:image/jpeg;base64,${processedBase64String}`,
                }));
            } catch (error) {
                setProcessedImages((prevImages) => ({
                    ...prevImages,
                    [deviceId]: `Error processing image: ${error}`,
                }));
            }
        },
        [runPython]
    );

    useEffect(() => {
        const getCameras = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === "videoinput"
            );
            setCameras(videoDevices);
        };

        getCameras();
    }, []);

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
                    let startTime = performance.now();
                    await processImageWithPython(buffer, width, height, id);
                    count++;
                    let endTime = performance.now();
                    let processingTime = endTime - startTime;

                    setProcessingTimes((prev) => ({
                        ...prev,
                        [id]: processingTime,
                    }));
                    processTimeArray.push(processingTime);
                    if (count % 10 === 0) {
                        //计算平均值
                        count = 0;
                        let sum = 0;
                        for (let i = 0; i < processTimeArray.length; i++) {
                            sum += processTimeArray[i];
                        }
                        let avg = sum / processTimeArray.length;
                        console.log(
                            "Average processImageWithPython time for 10 frames: ",
                            avg
                        );
                        processTimeArray = [];
                    }
                }
            });
            await Promise.all(imageSrcPromises);

            if (!isCancelled) {
                setTimeout(processImages, 10);
            }
        };

        processImages();

        return () => {
            isCancelled = true;
        };
    }, [captureFrame, processImageWithPython, selectedCameras]);

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
                            {loading !== "Ready" ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <span className="text-green-500">Ready</span>
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
                                    <Webcam
                                        key={cameraId}
                                        audio={false}
                                        ref={(el) => {
                                            if (el)
                                                webcamRefs.current[cameraId] =
                                                    el;
                                        }}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            deviceId: cameraId,
                                        }}
                                        className="w-64"
                                    />
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
                                        <img
                                            src={
                                                processedImages[cameraId] ||
                                                undefined
                                            }
                                            alt="Processed camera view"
                                            className="w-full"
                                        />
                                        <p>
                                            Processing time: <br />{" "}
                                            {processingTimes[cameraId]} ms
                                        </p>
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

export default PyodidePage;
