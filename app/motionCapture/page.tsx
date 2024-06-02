'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { usePyodide } from './usePyodide';

const PyodidePage = () => {
  const { pyodide, loading, status } = usePyodide();
  const [output, setOutput] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleCameraSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    if (navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } }
        });
        if (webcamRef.current && webcamRef.current.video) {
          webcamRef.current.video.srcObject = stream;
          webcamRef.current.video.play();
        }
      } catch (error) {
        console.error(`Error accessing user media: ${error}`);
      }
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    return imageSrc;
  }, [webcamRef]);

  const processImageWithPython = async (imageSrc: string) => {
    if (pyodide) {
      try {
        const imageArrayBuffer = await fetch(imageSrc).then(res => res.arrayBuffer());
        const imageBytes = new Uint8Array(imageArrayBuffer);

        // Convert image bytes to base64
        let imageString = '';
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

# Process the image with OpenCV (example: convert to grayscale)
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
      cv2.drawFrameAxes(gray_image, intrinsic_camera, distortion, rvec, tvec, 10)

# Encode image back to base64 string
_, buffer = cv2.imencode('.jpg', gray_image)
encoded_image = base64.b64encode(buffer).decode('utf-8')
encoded_image
        `;

        const processedImageBase64 = await pyodide.runPythonAsync(code);
        setProcessedImage(`data:image/jpeg;base64,${processedImageBase64}`);
      } catch (error) {
        setProcessedImage(`Error processing image: ${(error as Error).message}`);
      }
    }
  };

  useEffect(() => {
    const getCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
    };

    getCameras();
  }, []);

  useEffect(() => {
    const runPython = async () => {
      if (pyodide && loading === 'Loaded opencv-contrib-python') {
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
    const interval = setInterval(() => {
      const imageSrc = capture();
      if (imageSrc) {
        processImageWithPython(imageSrc);
      }
    }, 50); // Capture and process image every 5 seconds

    return () => clearInterval(interval);
  }, [capture, processImageWithPython]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Robotic Data Monitor</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <div className="bg-gray-100 p-4 rounded-md shadow h-48 overflow-y-auto">
            <ul className="list-disc list-inside">
              {status.map((statusMessage, index) => (
                <li key={index}>{statusMessage}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-2">
          <label htmlFor="camera-select" className="block text-lg font-semibold mb-2">Camera:</label>
          <select 
            id="camera-select" 
            className="select select-bordered w-full max-w-xs"
            onChange={handleCameraSelect}
          >
            <option value="">Choose a camera</option>
            {cameras.map((camera, index) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-100 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Camera View</h2>
          {selectedCamera ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ deviceId: selectedCamera }}
              className="w-full"
            />
          ) : (
            <p>Camera View will be shown here</p>
          )}
        </div>
        <div className="bg-gray-100 p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Processed Camera View</h2>
          {/* <canvas ref={canvasRef} className='w-full' width='640' height='480'></canvas> */}
          {processedImage ? (
            <img src={processedImage} alt="Processed camera view" className="w-full" />
          ) : (
            <p>Processed Camera View will be shown here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PyodidePage;