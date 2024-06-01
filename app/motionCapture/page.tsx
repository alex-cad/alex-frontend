'use client';

import { useEffect, useState } from 'react';
import { usePyodide } from './usePyodide';

const PyodidePage = () => {
  const { pyodide, loading } = usePyodide();
  const [output, setOutput] = useState<string | null>(null);

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

  return (
    <div>
      <h1>Pyodide test page</h1>
      <p>Status: {loading}</p>
      {output && <p>Loaded cv2 version: {output}</p>}
    </div>
  );
};

export default PyodidePage;
