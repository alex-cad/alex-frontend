"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import MyHeader from "@/app/ui/header";
import { useOpencv } from "./cvWorker";
import ThreeD from "./threeD";
import { saveAs } from "file-saver";

const OpenCVPage = () => {
    const { loading, status, addStatus, createWorker, runJS, getPoseData } = useOpencv();
    const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const videoRefs = useRef<{ [deviceId: string]: HTMLVideoElement | null }>({});
    const canvasRefs = useRef<{ [deviceId: string]: HTMLCanvasElement | null }>({});
    const workerRefs = useRef<{ [deviceId: string]: Worker }>({});

    const [processedImages, setProcessedImages] = useState<{ [deviceId: string]: string | null }>({});
    const intervalRefs = useRef<{ [deviceId: string]: number | null }>({});
    const [fps, setFps] = useState(30);

    const [originalBuffers, setOriginalBuffers] = useState<{ [deviceId: string]: { buffer: ArrayBuffer; view: Uint8ClampedArray } }>({});
    const [processedBuffers, setProcessedBuffers] = useState<{ [deviceId: string]: { buffer: SharedArrayBuffer; view: Uint8ClampedArray } }>({});
    const [frameCounters, setFrameCounters] = useState<{ [deviceId: string]: number }>({});

    const [isRecording, setIsRecording] = useState(false);
    const recordingDataRef = useRef<{ [deviceId: string]: Array<{ rvecs: number[]; tvecs: number[] }> }>({});
    // const [recordedData, setRecordedData] = useState<{ [deviceId: string]: { num: number; markerId: ""; rvecs: number[]; tvecs: number[] }[] }>({});
    const [recordedData, setRecordedData] = useState<{ [deviceId: string]: PoseData[] }>({});

    const [markerSize, setMarkerSize] = useState(25);
    const videoWidth = 2000, videoHeight = 2000
    const hasMounted = useRef(false);  // 检测是否第一次加载
    const scrollRef = useRef(null);  // 滚动到底部


    useEffect(() => {
    const getCameras = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setCameras(videoDevices);
        console.log("CPU counts: ", navigator.hardwareConcurrency);
        var workerCount = 0;
        // 为每个相机创建一个新的webWorker
        videoDevices.forEach((camera) => {
            const worker = createWorker(camera.deviceId);
            workerCount++;
            console.log(`Worker created for device ${workerCount} : ${camera.deviceId}`);
            workerRefs.current[camera.deviceId] = worker;
        });
    };

    getCameras();

    return () => {
        Object.values(workerRefs.current).forEach((worker) => {
            worker.terminate();
            console.log("Worker terminated");
        });
    };
}, []);

    useEffect(() => {
        if (hasMounted.current) {
            if (isRecording) {
                addStatus("Recording started");
            } else {
                addStatus("Recording stopped");
            }
        } else {
            hasMounted.current = true;
        }
    }, [isRecording]);

    useEffect(() => {
        // 检查 ref 是否被赋值，并将滚动条移动到元素的底部
        if (scrollRef.current) {
          scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
        }
      }, [status]); 

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
                video: { deviceId, width: videoWidth, height: videoHeight },
            });
            const videoElement = videoRefs.current[deviceId];

            if (videoElement) {
                if (videoElement.srcObject) {
                    stopVideoStream(deviceId);
                }
                videoElement.srcObject = stream;
                videoElement.onloadeddata = () => {
                    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                        console.log(`Video stream started for device ${deviceId}: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
                        videoElement
                            .play()
                            .then(() => {
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
        }
    };

    const processImageWithJS = useCallback(
        async (buffer: ArrayBuffer, width: number, height: number, deviceId: string) => {
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
                        [deviceId]: { buffer: processedBuffer, view: processedView },
                    }));
                }

                await runJS(worker, bufferCopy, processedBuffer, width, height, deviceId, isRecording, markerSize);

                // console.log("Processed buffer in main thread:", processedBuffer);

                let startTime = performance.now();
                // 将数据从 SharedArrayBuffer 复制到普通的 ArrayBuffer
                const processedData = new Uint8ClampedArray(processedBuffer.byteLength);
                processedData.set(new Uint8ClampedArray(processedBuffer));

               

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    throw new Error("Failed to get canvas context");
                }

                const imageData = new ImageData(processedData, width, height);
                ctx.putImageData(imageData, 0, 0);

                const url = canvas.toDataURL("image/jpeg", 0.1);
                let endTime = performance.now();
                console.log(`Time with render: ${endTime - startTime} ms`);
                // console.log(`Processed Image URL for device ${deviceId}:`, url);

                setProcessedImages((prevImages) => ({
                    ...prevImages,
                    [deviceId]: url,
                }));

                // 帧计数
                //   let frameCounter = frameCounters[deviceId] || 0;
                //   frameCounter++;
                //   if (frameCounter % 10 === 0) {
                //     // 每10帧更新一次图像
                //     const canvas = document.createElement('canvas');
                //     canvas.width = width;
                //     canvas.height = height;
                //     const ctx = canvas.getContext('2d');
                //     if (!ctx) {
                //       throw new Error("Failed to get canvas context");
                //     }

                //     const imageData = new ImageData(processedData, width, height);
                //     ctx.putImageData(imageData, 0, 0);

                //     const url = canvas.toDataURL('image/jpeg', 0.8);
                //     console.log(`Processed Image URL for device ${deviceId}:`, url);

                //     setProcessedImages((prevImages) => ({
                //       ...prevImages,
                //       [deviceId]: url,
                //     }));
                //   }
                // // 更新帧计数
                //   setFrameCounters((prevCounters) => ({
                //     ...prevCounters,
                //     [deviceId]: frameCounter,
                //   }));


            } catch (error) {
                console.error("Error in processing image with JS:", error);
            }
        },
        [runJS, processedBuffers, isRecording, markerSize]
    );

    const captureFrame = useCallback(
        (deviceId: string) => {
            const videoElement = videoRefs.current[deviceId];
            // console.log("Video size: ", videoElement?.videoWidth, videoElement?.videoHeight);
            const canvas = canvasRefs.current[deviceId];
            const context = canvas?.getContext("2d", { willReadFrequently: true });
            if (videoElement && context) {
                if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                    if (canvas !== null) {
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        // console.log("Canvas size: ", canvas.width, canvas.height);
                        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                        const image = context.getImageData(0, 0, canvas.width, canvas.height);
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

                        return { deviceId, buffer, width: canvas.width, height: canvas.height };
                    }
                }
            }
            return { deviceId, buffer: null, width: 0, height: 0 };
        },
        [originalBuffers]
    );

    useEffect(() => {
        const interval = setInterval(async () => {
            // console.log('set interval')
            const imageSrcPromises = selectedCameras.map(async (deviceId) => {
                const { deviceId: id, buffer, width, height } = captureFrame(deviceId);
                if (buffer) {
                    await processImageWithJS(buffer, width, height, id);
                }
            });
            await Promise.all(imageSrcPromises);
        }, 1000 / fps);

        return () => clearInterval(interval);
    }, [captureFrame, processImageWithJS, selectedCameras, fps]);

    //   useEffect(() => {
    //     let isCancelled = false;
    //     const processImages = async () => {
    //       if (isCancelled) return;

    //       const imageSrcPromises = selectedCameras.map(async (deviceId) => {
    //         const { deviceId: id, buffer, width, height } = captureFrame(deviceId);
    //         if (buffer) {
    //           await processImageWithJS(buffer, width, height, id);
    //         }
    //       });
    //       await Promise.all(imageSrcPromises);

    //       if (!isCancelled) {
    //         setTimeout(processImages, 500);
    //       }
    //     };
    //     processImages();

    //     return () => {
    //       isCancelled = true;
    //     };
    //   }, [captureFrame, processImageWithJS, selectedCameras]);

    const handleRecordingData = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<{ result: any; deviceId: string }>;
        const { result, deviceId } = customEvent.detail;

        // 确保 rvecs 和 tvecs 是数组
        const rvecsArray = Array.isArray(result.rvecs) ? result.rvecs : [result.rvecs];
        const tvecsArray = Array.isArray(result.tvecs) ? result.tvecs : [result.tvecs];

        const [r1, r2, r3] = rvecsArray;
        const [x, y, z] = tvecsArray;
        const num = result.num;
        const markerId = result.markerId;
        const time = result.time;

        setRecordedData((prevData) => {
            const deviceData = prevData[deviceId] || [];
            return {
                ...prevData,
                [deviceId]: [...deviceData, { num, time, markerId, r1, r2, r3, x, y, z }],
            };
        });
    }, []);

    useEffect(() => {
        if (isRecording) {
            console.log("Recording started");
            document.addEventListener("js-result", handleRecordingData);
        } else {
            document.removeEventListener("js-result", handleRecordingData);
        }
        return () => {
            document.removeEventListener("js-result", handleRecordingData);
        };
    }, [isRecording, handleRecordingData]);

    const handleDownload = async () => {
        const poseData = await Promise.all(Object.keys(workerRefs.current).map((deviceId) => getPoseData(workerRefs.current[deviceId], deviceId)));

        const data = Object.keys(workerRefs.current).reduce((acc, deviceId, index) => {
            acc[deviceId] = poseData[index].map((item) => ({
                num: item.num,
                time: item.time,
                markerId: item.markerId,
                r1: item.rvecs[0],
                r2: item.rvecs[1],
                r3: item.rvecs[2],
                x: item.tvecs[0],
                y: item.tvecs[1],
                z: item.tvecs[2],
            }));
            return acc;
        }, {} as { [key: string]: PoseData[] });

        Object.keys(data).forEach((deviceId) => {
            const deviceData = data[deviceId];
            if (!deviceData || deviceData.length === 0) {
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "num, time, markerId, r1, r2, r3, x, y, z\n";
            deviceData.forEach((row) => {
                csvContent += `${row.num},${row.time}, ${row.markerId}, ${row.r1}, ${row.r2}, ${row.r3}, ${row.x}, ${row.y}, ${row.z}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `recorded_data_${deviceId.slice(0, 6)}.csv`);
            document.body.appendChild(link); // Required for FF
            link.click();
            link.remove();
        });
    };

    return (
        <>
        <MyHeader className="" />
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Robotic Data Monitor</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2">
                        Status: &nbsp;
                        {loading === "Ready" ? (
                            <span className="text-success">Ready</span>
                        ) : (
                            <span className="loading loading-spinner loading-xs"></span>
                        )}
                    </h2>
                    <div ref={scrollRef} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow h-48 overflow-auto">
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
                                onClick={() => handleCameraSelect(camera.deviceId)}
                                className={`btn ${selectedCameras.includes(camera.deviceId) ? "btn-primary" : "btn-outline"
                                    }`}
                            >
                                {camera.label || `Camera ${index + 1}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2"> Settings </h2>
                    <div className="flex flex-wrap  bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow space-x-4 space-y-4">
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                            <label>Marker Size (mm):</label>
                            <input
                                type="number"
                                className="input input-bordered w-32 max-w-xs"
                                value={markerSize}
                                onChange={(e) => setMarkerSize(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                            <label>FPS: {fps}</label>
                            <input
                                className="range range-xs w-48"
                                type="range"
                                min={10}
                                max={120}
                                step={10}
                                value={fps}
                                onChange={(e) => setFps(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Download</h2>
                    <div className="flex flex-wrap space-x-2">
                        <button
                            onClick={() => setIsRecording((prev) => !prev)}
                            className={`btn ${isRecording ? "btn-error" : "btn-primary"}`}
                            disabled={selectedCameras.length === 0}
                        >
                            {isRecording ? "Stop Recording" : "Start Recording"}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="btn btn-success dark:text-gray-800"
                            disabled={Object.keys(recordedData).length === 0 || isRecording}
                        >
                            Download Data
                        </button>
                    </div>
                </div>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Camera View</h2>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex flex-wrap">
                        {selectedCameras.length > 0 ? (
                            selectedCameras.map((cameraId) => (
                                <div key={cameraId}>
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[cameraId] = el;
                                        }}
                                        className="w-64"
                                        playsInline
                                    />
                                    <canvas
                                        ref={(el) => {
                                            canvasRefs.current[cameraId] = el;
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
                    <h2 className="text-lg font-semibold mb-2">Processed Camera View</h2>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex flex-wrap">
                        {selectedCameras.length > 0 ? (
                            selectedCameras.map((cameraId) => (
                                <div key={cameraId} className="w-64 mt-4">
                                    <img
                                        src={processedImages[cameraId] || undefined}
                                        alt="Processed camera view"
                                        className="w-full"
                                    />
                                </div>
                            ))
                        ) : (
                            <p>Processed Camera View will be shown here</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
            <ThreeD />
            </div>
        </div>
    </>
    
    );
};

export default OpenCVPage;


