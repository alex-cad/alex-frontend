 "use client"

import React, { useEffect, useRef, useState } from "react";

const UsbCamera = () => {
    const videoRefs = useRef({});
    const canvasRefs = useRef({});
    const [selectedCameras, setSelectedCameras] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [processedImages, setProcessedImages] = useState({});

    useEffect(() => {
        const getCameras = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === "videoinput");
            setCameras(videoDevices);
        };
        getCameras();
    }, []);

    const startVideoStream = async (deviceId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId },
            });

            const track = stream.getTracks()[0];
            const trackProcessor = new MediaStreamTrackProcessor(track);
            const reader = trackProcessor.readable.getReader();

           const processFrame = async () => {
    let frameCount = 0; // 初始化帧计数器
    let startTime = performance.now(); // 记录开始时间
    const frameRateCalculationInterval = 100; // 每处理100帧计算一次帧率

    while (true) {
        const result = await reader.read();
        if (result.done) break;
        const frame = result.value;
        const canvas = canvasRefs.current[deviceId];
        const ctx = canvas.getContext("2d");
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
        frame.close();
        const url = canvas.toDataURL("image/jpeg");
        setProcessedImages((prev) => ({
            ...prev,
            [deviceId]: url,
        }));

        frameCount++; // 更新帧计数器

        // 每处理frameRateCalculationInterval帧后计算帧率
        if (frameCount % frameRateCalculationInterval === 0) {
            let endTime = performance.now(); // 记录当前时间
            let elapsedTime = (endTime - startTime) / 1000; // 计算经过的时间（秒）
            let fps = frameRateCalculationInterval / elapsedTime; // 计算帧率
            console.log(`Average FPS: ${fps.toFixed(2)}`); // 打印帧率

            // 重置开始时间和帧计数器
            startTime = performance.now();
        }
    }
};
processFrame();
        } catch (error) {
            console.error("Error accessing camera: ", error);
        }
    };

    const handleCameraSelect = (deviceId) => {
        setSelectedCameras((prevSelectedCameras) => {
            if (prevSelectedCameras.includes(deviceId)) {
                return prevSelectedCameras.filter((id) => id !== deviceId);
            } else {
                startVideoStream(deviceId);
                return [...prevSelectedCameras, deviceId];
            }
        });
    };

    return (
        <div>
            <div>
                {cameras.map((camera, index) => (
                    <button
                        key={camera.deviceId}
                        onClick={() => handleCameraSelect(camera.deviceId)}
                    >
                        {camera.label || `Camera ${index + 1}`}
                    </button>
                ))}
            </div>
            <div>
                {selectedCameras.map((cameraId) => (
                    <div key={cameraId}>
                        <canvas
                            ref={(el) => {
                                canvasRefs.current[cameraId] = el;
                            }}
                            width="640"
                            height="480"
                        />
                        <img
                            src={processedImages[cameraId] || ""}
                            alt={`Processed view for camera ${cameraId}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsbCamera;
