import { useEffect, useState } from 'react';

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState<string>('Loading pyodide');

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js';
        script.onload = async () => {
          try {
            // @ts-ignore
            const pyodideInstance = await window.loadPyodide();
            setPyodide(pyodideInstance);
            setLoading('Loading micropip');
            await pyodideInstance.loadPackage('micropip');
            const micropip = pyodideInstance.pyimport('micropip');
            setLoading('Installing opencv-contrib-python');
            await micropip.install('./whl/opencv_contrib_python-4.9.0.80-cp312-cp312-pyodide_2024_0_wasm32.whl'); 
            setLoading('Loaded opencv-contrib-python');
          } catch (error) {
            setLoading(`Error loading pyodide: ${(error as Error).message}`);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        setLoading(`Error loading script: ${(error as Error).message}`);
      }
    };
    loadPyodide();
  }, []);

  return { pyodide, loading };
};