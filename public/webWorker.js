importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js');

let pyodide;
var countForBuffer2Base64 = 0;
var processTimeArrayForBuffer2Base64 = [];

async function loadPyodideAndPackages() {
    try {
        self.postMessage({ type: 'STATUS', message: 'Loading pyodide' });
        pyodide = await loadPyodide();
        self.postMessage({ type: 'STATUS', message: 'Loading micropip' });
        await pyodide.loadPackage('micropip');
        const micropip = pyodide.pyimport('micropip');
        self.postMessage({ type: 'STATUS', message: 'Installing numpy' });
        await micropip.install('numpy');
        self.postMessage({ type: 'STATUS', message: 'Loaded numpy' });
        self.postMessage({ type: 'STATUS', message: 'Installing opencv-contrib-python' });
        const url = '/whl/opencv_contrib_python-4.9.0.80-cp312-cp312-pyodide_2024_0_wasm32.whl';
        await micropip.install(url);
        self.postMessage({ type: 'STATUS', message: 'Loaded opencv-contrib-python' });


        const code = `
import cv2
print(cv2.__version__)
cv2.__version__
        `;
        const opencvVersion = await pyodide.runPythonAsync(code);
        self.postMessage({ type: 'STATUS', message: `OpenCV version: ${opencvVersion}` });
        self.postMessage({ type: 'STATUS', message: 'Ready to go!' });
        self.postMessage({ type: 'LOADED' });
    } catch (error) {
        self.postMessage({ type: 'ERROR', message: error.message });
    }
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async function (event) {
    console.log('hihihi');
    await pyodideReadyPromise;

    if (event.data.type === 'RUN_PYTHON') {
        const { id, buffer, deviceId } = event.data;
        try {
            let startTime = performance.now();
            // 将 ArrayBuffer 转换为 Base64 字符串
            const uint8Array = new Uint8Array(buffer);
            const binaryString = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
            const base64String = btoa(binaryString);
            let endTime = performance.now();
            let processTime = endTime - startTime;
            processTimeArrayForBuffer2Base64.push(processTime);
            countForBuffer2Base64++;
            if (countForBuffer2Base64 % 10 === 0) {
                //计算平均值
                countForBuffer2Base64 = 0;
                let sum = 0;
                for (let i = 0; i < processTimeArrayForBuffer2Base64.length; i++) {
                  sum += processTimeArrayForBuffer2Base64[i];
                }
                let avg = sum / processTimeArrayForBuffer2Base64.length;
               
                console.log('buffer2base64 avg time:', avg);
                self.postMessage({ type: 'TIME', message: avg });
                processTimeArrayForBuffer2Base64 = [];
              }

            const response = await fetch('/pythonCode/detectAruco.py');
            const detectArucoCode = await response.text();

            const code = `
${detectArucoCode}

encoded_image = process_image('${base64String}')
encoded_image
`;

            const processedImageBase64 = await pyodide.runPythonAsync(code);

            // 将 Base64 字符串转换回 ArrayBuffer
            const processedBinaryString = atob(processedImageBase64);
            const processedBuffer = new ArrayBuffer(processedBinaryString.length);
            const processedUint8Array = new Uint8Array(processedBuffer);
            for (let i = 0; i < processedBinaryString.length; i++) {
                processedUint8Array[i] = processedBinaryString.charCodeAt(i);
            }

            self.postMessage({ type: 'PYTHON_RESULT', id, result: processedBuffer, deviceId }, [processedBuffer]);
        } catch (error) {
            self.postMessage({ type: 'PYTHON_ERROR', id, error: error.message, deviceId });
        }
    }
};
