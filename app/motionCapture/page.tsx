"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { usePyodide } from "./usePyodide";

const PyodidePage = () => {
  const { pyodide, loading, status, addStatus } = usePyodide();
  const [output, setOutput] = useState<string | null>(null);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [processedImages, setProcessedImages] = useState<{ [deviceId: string]: string | null }>({});
  const webcamRefs = useRef<{ [deviceId: string]: Webcam | null }>({});
  
  const [frameRates, setFrameRates] = useState<{ [deviceId: string]: number }>({});
  const [updateTimestamps, setUpdateTimestamps] = useState<{ [deviceId: string]: number[] }>({});
  const [frameCount, setFrameCount] = useState<{ [deviceId: string]: number }>({});
  const [totalTime, setTotalTime] = useState<{ [deviceId: string]: number }>({});
  

  // 如果包含deviceid, 则点击会取消，否则会添加这个相机
  const handleCameraSelect = (deviceId: string) => {
    setSelectedCameras(prevSelectedCameras => {
      if (prevSelectedCameras.includes(deviceId)) {
        return prevSelectedCameras.filter(id => id !== deviceId);
      } else {
        return [...prevSelectedCameras, deviceId];
      }
    });
  };

  useEffect(() => {
    const startCamera = async (deviceId: string) => {
      if (navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
          });
          const videoElement = webcamRefs.current[deviceId]?.video;
          if (videoElement && !videoElement.srcObject) {
            videoElement.srcObject = stream;
            videoElement.play();
          }
        } catch (error) {
          console.error(`Error accessing user media: ${error}`);
          addStatus(`Error accessing user media: ${(error as Error).message}`);
        }
      }
    };
    selectedCameras.forEach(startCamera);
  }, [selectedCameras]);

  const capture = useCallback((deviceId: string) => {
    const imageSrc = webcamRefs.current[deviceId]?.getScreenshot();
    return imageSrc;
  }, []);

  
  


  const processImageWithPython = async (imageSrc: string, deviceId: string) => {
    if (pyodide) {
      try {
        const imageArrayBuffer = await fetch(imageSrc).then((res) =>
          res.arrayBuffer()
        );
        const imageBytes = new Uint8Array(imageArrayBuffer);

        let imageString = "";
        for (let i = 0; i < imageBytes.length; i++) {
          imageString += String.fromCharCode(imageBytes[i]);
        }
        const imageBase64 = btoa(imageString);

        const code = `
import cv2
import numpy as np
import base64

# Decode base64 image
image_data = base64.b64decode("${imageBase64}")
image_array = np.frombuffer(image_data, dtype=np.uint8)
image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

cx = 655.3664
cy = 367.5246
fx = 971.2252
fy = 970.7470
k1 = 0.0097
k2 = -0.00745
k3 = 0.00
p1 = 0.00
p2 = 0.00
intrinsic_camera = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])
distortion = np.array([k1, k2, p1, p2, k3])


arucoDict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
arucoParams = aruco.DetectorParameters()

corners, ids, rejected = cv2.aruco.detectMarkers(gray_image, arucoDict, parameters=arucoParams)

if ids is not None:
  for index in range(0, len(ids)):
      # print(f"ID length: {len(ids)}")
      rvec, tvec, _ = cv2.aruco.estimatePoseSingleMarkers(corners[index], 20, intrinsic_camera,
                                                              distortion)
      cv2.aruco.drawDetectedMarkers(gray_image, corners, ids)
      cv2.drawFrameAxes(gray_image, intrinsic_camera, distortion, rvec, tvec, 20)

# Encode image back to base64 string
_, buffer = cv2.imencode('.jpg', gray_image)
encoded_image = base64.b64encode(buffer).decode('utf-8')
encoded_image
        `;
        const processedImageBase64 = await pyodide.runPythonAsync(code);

        setProcessedImages(prevImages => ({
          ...prevImages,
          [deviceId]: `data:image/jpeg;base64,${processedImageBase64}`
        }));

        const now = Date.now();

        setUpdateTimestamps(prevTimestamps => {
          const newTimestamps = { ...prevTimestamps };
          if (!newTimestamps[deviceId]) {
            newTimestamps[deviceId] = [];
          }
          newTimestamps[deviceId].push(now);

          // Keep only the timestamps from the last second
          newTimestamps[deviceId] = newTimestamps[deviceId].filter(timestamp => now - timestamp <= 1000);

          return newTimestamps;
        });

      } catch (error) {
        setProcessedImages(prevImages => ({
          ...prevImages,
          [deviceId]: `Error processing image: ${(error as Error).message}`
        }));
      }
    }
  };

  useEffect(() => {
    const getCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoDevices);
    };

    getCameras();
  }, []);

  useEffect(() => {
    const runPython = async () => {
      if (pyodide && loading === "Loaded opencv-contrib-python") {
        try {
          const code = `
import cv2
import cv2.aruco as aruco
import numpy
print('opencv version: ', cv2.__version__)
print('numpy version: ', numpy.__version__)
arucoDict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
print('hello')
          `;
          const result = await pyodide.runPythonAsync(code);
          setOutput(result);
        } catch (error) {
          setOutput(`Error running Python code: ${(error as Error).message}`);
        }
      }
    };

    runPython();
  }, [pyodide, loading]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const imageSrcPromises = selectedCameras.map(async (deviceId) => {
        const imageSrc = capture(deviceId);
        if (imageSrc) {
          await processImageWithPython(imageSrc, deviceId);
        }
      });
      await Promise.all(imageSrcPromises);
    }, 33);

    return () => clearInterval(interval);
  }, [capture, processImageWithPython, selectedCameras]);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const imageSrcPromises = selectedCameras.map(async (deviceId) => {
  //       const startTime = performance.now();
  
  //       const imageSrc = capture(deviceId);
  //       if (imageSrc) {
  //         await processImageWithPython(imageSrc, deviceId);
  //       }
  
  //       const endTime = performance.now();
  //       const duration = endTime - startTime;
  
  //       setFrameCount(prevCounts => {
  //         const newCounts = { ...prevCounts };
  //         newCounts[deviceId] = (newCounts[deviceId] || 0) + 1;
  //         return newCounts;
  //       });
  
  //       setTotalTime(prevTimes => {
  //         const newTimes = { ...prevTimes };
  //         newTimes[deviceId] = (newTimes[deviceId] || 0) + duration;
  //         return newTimes;
  //       });
  //     });
  
  //     await Promise.all(imageSrcPromises);
  //   }, 33);
  
  //   return () => clearInterval(interval);
  // }, [capture, processImageWithPython, selectedCameras]);
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Robotic Data Monitor</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* Status panel */}
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Status: &nbsp;
            {loading !== 'Ready' ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <span className="text-green-500">Ready</span>
            )}
          </h2>
          <div className="bg-gray-100 p-4 rounded-md shadow h-48 overflow-auto">
            <ul className="list-disc list-inside text-xs">
              {status.map((statusMessage, index) => (
                <li key={index}>{statusMessage}</li>
              ))}
            </ul>
          </div>
        </div>
        {/* Camera select panel */}
        <div className="col-span-2">
          <label htmlFor="camera-select" className="block text-lg font-semibold mb-2">
            Camera:
          </label>
          <div className="flex flex-wrap gap-2">
            {cameras.map((camera, index) => (
              <button
                key={camera.deviceId}
                onClick={() => handleCameraSelect(camera.deviceId)}
                className={`btn ${selectedCameras.includes(camera.deviceId) ? 'btn-primary' : 'btn-outline'}`}
              >
                {camera.label || `Camera ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Camera View</h2>
          <div className="bg-gray-100 p-4 rounded-md shadow flex flex-wrap">
            {selectedCameras.length > 0 ? (
              selectedCameras.map((cameraId) => (
                <Webcam
                  key={cameraId}
                  audio={false}
                  ref={el => {
                    if (el) webcamRefs.current[cameraId] = el;
                  }}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ deviceId: cameraId }}
                  className="w-64"
                />
              ))
            ) : (
              <p>Camera View will be shown here</p>
            )}
          </div>
        </div>

        <div className="con-span-2">
          <h2 className="text-lg font-semibold mb-2">Processed Camera View</h2>
          <div className="bg-gray-100 p-4 rounded-md shadow flex flex-wrap">
            {selectedCameras.length > 0 ? (
              selectedCameras.map((cameraId) => (
                <div key={cameraId} className="w-64 mt-4">
                  <img
                    src={processedImages[cameraId] || undefined}
                    alt="Processed camera view"
                    className="w-full"
                  />
                  <p className="text-xs mt-2">Frame Rate: {frameRates[cameraId] ? frameRates[cameraId].toFixed(2) : 'Calculating...'} FPS</p>
                </div>
              ))
            ) : (
              <p>Processed Camera View will be shown here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PyodidePage;

