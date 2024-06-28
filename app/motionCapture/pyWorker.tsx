import { useEffect, useState, useRef } from 'react';
import { add } from 'three/examples/jsm/nodes/Nodes.js';


var countForPostMessage = 0;
var processTimeArrayForPost: number[] = [];

export const usePyodide = () => {
  const [loading, setLoading] = useState<string>('Loading pyodide');
  const [status, setStatus] = useState<string[]>([]);
  const statusRef = useRef<string[]>([]);
  const workerRef = useRef<Worker | null>(null);

  const addStatus = (message: string) => {
    if (!statusRef.current.includes(message)) {
      statusRef.current = [...statusRef.current, message];
      setStatus([...statusRef.current]);
    }
  };

  useEffect(() => {
    const worker = new Worker(new URL('./webWorker.js', import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, message, result, error, deviceId } = event.data;
      if (type === 'STATUS') {
        addStatus(message);
      } else if (type === 'ERROR') {
        setLoading(`Error: ${message}`);
        addStatus(`Error: ${message}`);
      } else if (type === 'LOADED') {
        setLoading('Ready');
        addStatus('Ready to go!');
      } else if (type === 'PYTHON_RESULT') {
        // 处理接收到的 ArrayBuffer
        document.dispatchEvent(new CustomEvent('python-result', { detail: { result, deviceId } }));
      } if (type === 'TIME') {
        addStatus(`Time: ${message}`);
        console.log(`Time: ${message}`);
      }
      
      else if (type === 'PYTHON_ERROR') {
        console.error(`Python error for device ${deviceId}:`, error);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const runPython = (buffer: ArrayBuffer, width: number, height: number, deviceId: string) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const worker = workerRef.current;
      if (worker) {

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'PYTHON_RESULT' && event.data.deviceId === deviceId) {
            resolve(event.data.result);
          } else if (event.data.type === 'PYTHON_ERROR' && event.data.deviceId === deviceId) {
            reject(event.data.error);
          }
          worker.removeEventListener('message', handleMessage);
        };

        worker.addEventListener('message', handleMessage);
        let startTime = performance.now();
        worker.postMessage({ type: 'RUN_PYTHON', buffer, deviceId }, [buffer]);
        let endTime = performance.now();
        processTimeArrayForPost.push(endTime - startTime);
        countForPostMessage++;
        if (countForPostMessage % 10 === 0) {
          //计算平均值
          countForPostMessage = 0;
          let sum = 0;
          for (let i = 0; i < processTimeArrayForPost.length; i++) {
            sum += processTimeArrayForPost[i];
          }
          let avg = sum / processTimeArrayForPost.length;
          console.log("Average processing time for 10 frames (post): ", avg);
          processTimeArrayForPost = [];
        }
        
      } else {
        reject('Worker not initialized');
      }
    });
  };

  return { loading, status, addStatus, runPython };
};
