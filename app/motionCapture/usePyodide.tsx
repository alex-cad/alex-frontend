import { useEffect, useState, useRef } from 'react';

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState<string>('Loading pyodide');
  const [status, setStatus] = useState<string[]>([]);
  const statusRef = useRef<string[]>([]);

  const addStatus = (message: string) => {
    // 避免重复添加相同的信息
    if (!statusRef.current.includes(message)) {
      statusRef.current = [...statusRef.current, message];
      setStatus([...statusRef.current]);
    }
  };

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        addStatus('Please wait...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js';
        script.onload = async () => {
          try {
            // @ts-ignore
            const pyodideInstance = await window.loadPyodide();
            setPyodide(pyodideInstance);
            addStatus('Loading micropip');
            setLoading('Loading micropip');
            
            await pyodideInstance.loadPackage('micropip');
            const micropip = pyodideInstance.pyimport('micropip');
            addStatus('Installing opencv-contrib-python');
            setLoading('Installing opencv-contrib-python');
            await micropip.install('./whl/opencv_contrib_python-4.9.0.80-cp312-cp312-pyodide_2024_0_wasm32.whl'); 
            setLoading('Loaded opencv-contrib-python');
            addStatus('Loaded opencv-contrib-python');

            const code = `
import cv2
print(cv2.__version__)
cv2.__version__
            `;
            const opencvVersion = await pyodideInstance.runPythonAsync(code);
            addStatus(`OpenCV version: ${opencvVersion}`);
            setLoading('Ready')
            addStatus('Ready to go!');
          } catch (error) {
            setLoading(`Error loading pyodide: ${(error as Error).message}`);
            addStatus(`Error loading pyodide: ${(error as Error).message}`);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        setLoading(`Error loading script: ${(error as Error).message}`);
        addStatus(`Error loading script: ${(error as Error).message}`);
      }
    };
    loadPyodide();
  }, []);

  return { pyodide, loading, status };
};