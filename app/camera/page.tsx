"use client"
import { useRef, useEffect, useState } from "react";




export default function App() {


const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
const videoRefs = useRef<{ [deviceId: string]: HTMLVideoElement | null }>({});

  const videoRef = useRef();



  const handleCameraSelect = (deviceId: string) => {
    if (!selectedCameras.includes(deviceId)) {
        setSelectedCameras((prevSelectedCameras) => [...prevSelectedCameras, deviceId]);
        startCamera(deviceId);
    } else {
        setSelectedCameras((prevSelectedCameras) => prevSelectedCameras.filter((id) => id !== deviceId));
        stopCamera(deviceId);
    }
};

const startCamera = async (deviceId: string) => {{
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: false
            });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };
            setStreaming((prev) => ({ ...prev, [deviceId]: true }));
            console.log(`Started camera ${deviceId}`);
        } catch (err) {
            console.error(err.name + ": " + err.message);
        }
    }
};

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <div className="App">
      <video ref={videoRef} autoPlay />
    </div>
  );
}
