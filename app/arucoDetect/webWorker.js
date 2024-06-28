let pyodide;
var countForRunPython = 0;
var processTimeArray2 = [];

function waitForOpencv(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
    if (cv.Mat) callbackFn(true);

    let timeSpentMs = 0;
    const interval = setInterval(() => {
        const limitReached = timeSpentMs > waitTimeMs;
        if (cv.Mat || limitReached) {
            clearInterval(interval);
            return callbackFn(!limitReached);
        } else {
            timeSpentMs += stepTimeMs;
        }
    }, stepTimeMs);
}

async function loadOpencv() {
    try {
        self.postMessage({ type: "STATUS", message: "Loading OpenCv" });
        self.importScripts("/js/opencv.js");
        waitForOpencv(function (success) {
            if (success) {
                self.postMessage({ type: "STATUS", message: "OpenCV loaded" });
                self.postMessage({ type: "LOADED" });
            } else {
                postMessage({
                    type: "ERROR",
                    message: "Error on loading OpenCV",
                });
                throw new Error("Error on loading OpenCV");
            }
        });
    } catch (error) {
        self.postMessage({ type: "ERROR", message: error.message });
        console.error(error);
    }
}

let opencvReadyPromise = loadOpencv();

self.onmessage = async function (event) {
    await opencvReadyPromise;

    if (event.data.type === "RUN_JS") {
        const { buffer, width, height, deviceId } = event.data;
        try {
            // 将 ArrayBuffer 转换为 Uint8ClampedArray
            const clampedArray = new Uint8ClampedArray(buffer);
            // 使用 ImageData 构造函数创建一个新的 ImageData 对象
            const imageData = new ImageData(clampedArray, width, height);
            console.log('ImageData in detect Aruco 1: ', imageData);
            const inputImage = cv.matFromImageData(imageData);
            console.log('inputImage in detect Aruco 2: ', inputImage);

            let grayImg = new cv.Mat();
            let RgbImage = new cv.Mat();

            let markerImage = new cv.Mat();
            let dictionary = new cv.Dictionary(cv.DICT_4X4_250);
            let parameter = new cv.DetectorParameters();

            parameter.adaptiveThreshWinSizeMin = 23;
            parameter.adaptiveThreshWinSizeMax = 23;
            parameter.adaptiveThreshWinSizeStep = 10;
            parameter.adaptiveThreshConstant = 7;
            parameter.minMarkerPerimeterRate = 0.1;
            parameter.maxMarkerPerimeterRate = 4;
            parameter.polygonalApproxAccuracyRate = 0.03;
            parameter.minCornerDistanceRate = 0.05;
            parameter.minDistanceToBorder = 3;
            parameter.minMarkerDistanceRate = 0.05;
            parameter.cornerRefinementMethod = cv.CORNER_REFINE_NONE;
            parameter.cornerRefinementWinSize = 5;
            parameter.cornerRefinementMaxIterations = 30;
            parameter.cornerRefinementMinAccuracy = 0.1;
            parameter.markerBorderBits = 1;
            parameter.perspectiveRemovePixelPerCell = 2;
            parameter.perspectiveRemoveIgnoredMarginPerCell = 0.13;
            parameter.maxErroneousBitsInBorderRate = 0.35;
            parameter.minOtsuStdDev = 5.0;
            parameter.errorCorrectionRate = 0.6;

            let markerIds = new cv.Mat();
            let markerCorners = new cv.MatVector();
            let rvecs = new cv.Mat();
            let tvecs = new cv.Mat();
            let cameraMatrix = cv.matFromArray(
                3,
                3,
                cv.CV_64F,
                [
                    9.6635571716090658e2, 0, 2.0679307818305685e2, 0,
                    9.6635571716090658e2, 2.9370020600555273e2, 0, 0, 1,
                ]
            );
            let distCoeffs = cv.matFromArray(
                5,
                1,
                cv.CV_64F,
                [
                    -1.5007354215536557e-3, 9.8722389825801837e-1,
                    1.7188452542408809e-2, -2.6805958820424611e-2,
                    -2.3313928379240205,
                ]
            );

            cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
            console.log("RgbImage:", RgbImage);
            let startTime = performance.now();
            cv.detectMarkers(
                RgbImage,
                dictionary,
                markerCorners,
                markerIds,
                parameter
            );
            let endTime = performance.now();
            let processingTime = endTime - startTime;
            console.log("detect time:", processingTime);
            console.log(markerIds.rows);
            if (markerIds.rows > 0) {
                cv.drawDetectedMarkers(RgbImage, markerCorners, markerIds);
                console.log("estimating pose");
                let startTime = performance.now();
                cv.estimatePoseSingleMarkers(
                    markerCorners,
                    0.1,
                    cameraMatrix,
                    distCoeffs,
                    rvecs,
                    tvecs
                );
                let endTime = performance.now();
                let processingTime = endTime - startTime;
                console.log("Estimate time: ", processingTime);

                for (let i = 0; i < markerIds.rows; ++i) {
                    let rvec = cv.matFromArray(3, 1, cv.CV_64F, [
                        rvecs.doublePtr(0, i)[0],
                        rvecs.doublePtr(0, i)[1],
                        rvecs.doublePtr(0, i)[2],
                    ]);
                    let tvec = cv.matFromArray(3, 1, cv.CV_64F, [
                        tvecs.doublePtr(0, i)[0],
                        tvecs.doublePtr(0, i)[1],
                        tvecs.doublePtr(0, i)[2],
                    ]);
                    cv.drawAxis(
                        RgbImage,
                        cameraMatrix,
                        distCoeffs,
                        rvec,
                        tvec,
                        0.1
                    );
                    console.log('pose: ', [
                        rvec.doublePtr(0, 0)[0],
                        rvec.doublePtr(0, 1)[0],
                        rvec.doublePtr(0, 2)[0]
                    ], [
                        tvec.doublePtr(0, 0)[0],
                        tvec.doublePtr(0, 1)[0],
                        tvec.doublePtr(0, 2)[0]
                    ]);
                    rvec.delete();
                    tvec.delete();
                }
            }

            const processedImage = imageDataFromMat(RgbImage);

            // 从 RgbImage 中提取 ArrayBuffer
            const processedBuffer = processedImage.data.buffer.slice(0);

            RgbImage.delete();
            markerImage.delete();
            dictionary.delete();
            markerIds.delete();
            markerCorners.delete();
            rvecs.delete();
            tvecs.delete();
            cameraMatrix.delete();
            distCoeffs.delete();

            self.postMessage(
                { type: "JS_RESULT", result: processedBuffer, deviceId },
                [processedBuffer]
            );
        } catch (error) {
            self.postMessage({
                type: "PYTHON_ERROR",
                error: error.message,
                deviceId,
            });
        }
    }
};

function imageDataFromMat(mat) {
    // converts the mat type to cv.CV_8U
    const img = new cv.Mat();
    const depth = mat.type() % 8;
    const scale =
        depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0;
    const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0;
    mat.convertTo(img, cv.CV_8U, scale, shift);

    // converts the img type to cv.CV_8UC4
    switch (img.type()) {
        case cv.CV_8UC1:
            cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
            break;
        case cv.CV_8UC3:
            cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
            break;
        case cv.CV_8UC4:
            break;
        default:
            throw new Error(
                "Bad number of channels (Source image must have 1, 3 or 4 channels)"
            );
    }
    const clampedArray = new ImageData(
        new Uint8ClampedArray(img.data),
        img.cols,
        img.rows
    );
    img.delete();
    return clampedArray;
}
