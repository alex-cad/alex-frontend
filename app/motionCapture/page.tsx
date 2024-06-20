"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { usePyodide } from "./pyWorker";
import MyHeader from "@/app/ui/header";
const PyodidePage = () => {
  const { loading, status, addStatus, runPython } = usePyodide();
  const [output, setOutput] = useState<string | null>(null);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [processedImages, setProcessedImages] = useState<{ [deviceId: string]: string | null }>({});
  const webcamRefs = useRef<{ [deviceId: string]: Webcam | null }>({});

  const handleCameraSelect = (deviceId: string) => {
    setSelectedCameras(prevSelectedCameras => {
      if (prevSelectedCameras.includes(deviceId)) {
        return prevSelectedCameras.filter(id => id !== deviceId);
      } else {
        return [...prevSelectedCameras, deviceId];
      }
    });
  };

  const captureFrame = useCallback((deviceId: string) => {
    const webcam = webcamRefs.current[deviceId];
    if (webcam && webcam.video) {
      const video = webcam.video;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1]; // 转换成Base64字符串
          
          // 将Base64字符串转换为ArrayBuffer
          const binaryString = atob(base64Image);
          const len = binaryString.length;
          const buffer = new ArrayBuffer(len);
          const uint8Array = new Uint8Array(buffer);
          for (let i = 0; i < len; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
          }

          return { deviceId, buffer, width: canvas.width, height: canvas.height };
        }
      }
    }
    return { deviceId, buffer: null, width: 0, height: 0 };
  }, []);

  const processImageWithPython = useCallback(async (buffer: ArrayBuffer, width: number, height: number, deviceId: string) => {
    try {
      if (!buffer || width === 0 || height === 0) {
        throw new Error('Invalid image dimensions');
      }
  
      const processedBuffer = await runPython(buffer, width, height, deviceId);
      const processedUint8Array = new Uint8Array(processedBuffer);
  
      // 将 Uint8Array 转换为 Base64 字符串
      let binaryString = '';
      for (let i = 0; i < processedUint8Array.length; i++) {
        binaryString += String.fromCharCode(processedUint8Array[i]);
      }
      const processedBase64String = btoa(binaryString);
  
      setProcessedImages(prevImages => ({
        ...prevImages,
        [deviceId]: `data:image/jpeg;base64,${processedBase64String}`
      }));
    } catch (error) {
      setProcessedImages(prevImages => ({
        ...prevImages,
        [deviceId]: `Error processing image: ${error}`
      }));
    }
  }, [runPython]);
  


  useEffect(() => {
    const getCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoDevices);
    };

    getCameras();
  }, []);

  useEffect(() => {
    let isCancelled = false;
  
    const processImages = async () => {
      if (isCancelled) return;
  
      const imageSrcPromises = selectedCameras.map(async (deviceId) => {
        const { deviceId: id, buffer, width, height } = captureFrame(deviceId);
        console.log('deviceId', id);
        if (buffer) {
          // console.time(`processImageWithPython ${id}`);
          await processImageWithPython(buffer, width, height, id);
          // console.timeEnd(`processImageWithPython ${id}`);
        }
      });
      await Promise.all(imageSrcPromises);
  
      if (!isCancelled) {
        setTimeout(processImages, 30); // 调整时间间隔
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
        <h1 className="text-2xl font-bold mb-4">Robotic Data Monitor</h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <h2 className="text-lg font-semibold mb-2">Status: &nbsp;
              {loading !== 'Ready' ? (
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
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex flex-wrap">
              {selectedCameras.length > 0 ? (
                selectedCameras.map((cameraId) => (
                  <Webcam
                    key={cameraId}
                    audio={false}
                    ref={el => {
                      if (el) webcamRefs.current[cameraId] = el;
                    }}
                    videoConstraints={{ deviceId: cameraId }}
                    className="w-64"
                  />
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
      </div>
    </>
  );
};

export default PyodidePage;
