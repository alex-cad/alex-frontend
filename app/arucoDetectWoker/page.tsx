"use client";

import React, { useState, useRef, useEffect } from 'react';
import cv from './cv'

const ArucoPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [processing, updateProcessing] = useState(false)
  const videoElement = useRef(null)
  const canvasEl = useRef(null)

  const maxVideoSize = 500



  async function onClick() {
    updateProcessing(true)

    const ctx = canvasEl.current.getContext('2d')
    ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize)
    const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize)
    // Load the model
    await cv.load()
    
    // Processing image
    // const processedImage = await cv.imageProcessing(image)
    console.log("image: ", image);
    const processedImage = await cv.detectAruco(image)
    // Render the processed image to the canvas
    ctx.putImageData(processedImage.data.payload, 0, 0)
    updateProcessing(false)
  }




  useEffect(() => {
    async function initCamara() {
      videoElement.current.width = maxVideoSize
      videoElement.current.height = maxVideoSize

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        })
        videoElement.current.srcObject = stream

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current)
          }
        })
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera'
      alert(errorMessage)
      return Promise.reject(errorMessage)
    }

    async function load() {
      const videoLoaded = await initCamara()
      videoLoaded.play()
      return videoLoaded
    }

    load()
  }, [])




  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = inputCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0, img.width, img.height);
            }
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // const detectAruco = () => {
  //   setError(null);
  //   try {
  //     const inputCanvas = inputCanvasRef.current;
  //     const outputCanvas = outputCanvasRef.current;
  //     if (inputCanvas && outputCanvas) {
  //       const inputImage = cv.imread(inputCanvas);
  //       console.log("Image loaded:", inputImage);
  //       cv.cvtColor(inputImage, inputImage, cv.COLOR_RGBA2RGB, 0);
  //       const dictionary = new cv.Dictionary(cv.DICT_6X6_250);
  //       const markerIds = new cv.Mat();
  //       const markerCorners = new cv.MatVector();
  //       const rvecs = new cv.Mat();
  //       const tvecs = new cv.Mat();
  //       const cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [966.3557, 0., 206.7931, 0., 966.3557, 293.7002, 0., 0., 1.]);
  //       const distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [-0.0015, 0.9872, 0.0172, -0.0268, -2.3314]);

  //       cv.detectMarkers(inputImage, dictionary, markerCorners, markerIds);
  //       console.log("Markers detected:", markerIds.rows);
  //       if (markerIds.rows > 0) {
  //         cv.drawDetectedMarkers(inputImage, markerCorners, markerIds);
  //         cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
  //         for (let i = 0; i < markerIds.rows; ++i) {
  //           const rvec = cv.matFromArray(3, 1, cv.CV_64F, [rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);
  //           const tvec = cv.matFromArray(3, 1, cv.CV_64F, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);
  //           cv.drawAxis(inputImage, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
  //           rvec.delete();
  //           tvec.delete();
  //         }
  //       }
  //       console.log("Displaying output image");
  //       cv.imshow(outputCanvas, inputImage); // Ensure this line is correct
  //       inputImage.delete(); dictionary.delete(); markerIds.delete(); markerCorners.delete(); rvecs.delete(); tvecs.delete(); cameraMatrix.delete(); distCoeffs.delete();
  //     }
  //   } catch (err) {
  //     setError((err as Error).message);
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/js/opencv.js";
    script.async = true;
    script.onload = () => {
      // OpenCV.js is loaded
      if (cv) {
        console.log('OpenCV.js is ready');
      }
    };
    script.onerror = () => {
      setError("Failed to load OpenCV.js");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
       <video className="video" playsInline ref={videoElement} />
       <button
        disabled={processing}
        style={{ width: maxVideoSize, padding: 10 }}
        onClick={onClick}
      >
        {processing ? 'Processing...' : 'Take a photo'}
      </button>
      <canvas
        ref={canvasEl}
        width={maxVideoSize}
        height={maxVideoSize}
      ></canvas>


      {error && <p className="err">{error}</p>}
      <div id="arucoShowcase" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3>Original Image</h3>
          <canvas id="arucoCanvasInput" ref={inputCanvasRef}></canvas>
        </div>
        <div>
          <h3>Processed Image</h3>
          <canvas id="arucoCanvasOutput" ref={outputCanvasRef}></canvas>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFiles} />
    </div>
  );
};

export default ArucoPage;
