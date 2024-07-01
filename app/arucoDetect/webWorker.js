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
        self.postMessage({ type: "STATUS", message: "Loading OpenCV" });
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

var countForRunJS = 0;
var processTimeArrayJS = [];
// let poseData = [{num: 0, markerId:'', rvecs: [], tvecs: []}];
let poseData = [];
let num = 0;
let recordingStartTime = null;

self.onmessage = async function (event) {
    await opencvReadyPromise;
    let startTime = performance.now();
    if (event.data.type === "RUN_JS") {
        const { buffer, processedBuffer, width, height, deviceId, isRecordData, markerSize } = event.data;

        try {
            const clampedArray = new Uint8ClampedArray(buffer);
            const imageData = new ImageData(clampedArray, width, height);
            // console.log('ImageData in detect Aruco 1: ', imageData);
            const inputImage = cv.matFromImageData(imageData);
            // console.log('inputImage in detect Aruco 2: ', inputImage);

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
            let cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [971.2252, 0, 655.3664, 0, 970.747, 367.5246, 0, 0, 1]);
            let distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [0, 0, 0, 0, 0]);

            cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
            // cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGB2GRAY, 0);
            // console.log("RgbImage:", RgbImage);
            // let startTime = performance.now();
            cv.detectMarkers(RgbImage, dictionary, markerCorners, markerIds, parameter);
            // let endTime = performance.now();
            // let processingTime = endTime - startTime;
            // console.log("detect time:", processingTime);

            // console.log('MARKERIDS length: ', markerIds.ucharPtr(0, 0).length);
            // console.log('MARKERIDS: ',markerIds.ucharPtr(0, 0)[0]);

            if (markerIds.rows > 0) {
                cv.drawDetectedMarkers(RgbImage, markerCorners, markerIds);
                // console.log("estimating pose");
                // let startTime = performance.now();
                cv.estimatePoseSingleMarkers(markerCorners, markerSize, cameraMatrix, distCoeffs, rvecs, tvecs);

                // console.log('rvecs(0): ', rvecs.doublePtr(0), 'rvecs(1): ', rvecs.doublePtr(1))

                // 保存data
            }

            // let endTime = performance.now();
            // let processingTime = endTime - startTime;
            // console.log("Estimate time: ", processingTime);

            for (let i = 0; i < markerIds.rows; ++i) {
                let rvec = cv.matFromArray(3, 1, cv.CV_64F, [rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);
                let tvec = cv.matFromArray(3, 1, cv.CV_64F, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);
                cv.drawAxis(RgbImage, cameraMatrix, distCoeffs, rvec, tvec, 30);
                // console.log(
                //     "pose: ",
                //     [rvec.doublePtr(0, 0)[0], rvec.doublePtr(0, 1)[0], rvec.doublePtr(0, 2)[0]],
                //     [tvec.doublePtr(0, 0)[0], tvec.doublePtr(0, 1)[0], tvec.doublePtr(0, 2)[0]]
                // );
                if (isRecordData) {
                    if (recordingStartTime === null) {
                        recordingStartTime = performance.now();
                    }
                    let currentTime = performance.now();
                    let elapsedTime = ((currentTime - recordingStartTime) / 1000).toFixed(3); // 秒数
                    // console.log("Marker ID [", i, "]: ", markerIds.ucharPtr(i, 0)[0], "rvecs: ", rvecs.doublePtr(i), "tvecs: ", tvecs.doublePtr(i));
                    // console.log(
                    //     "pushed: ",
                    //     "num: ",
                    //     num,
                    //     "markerId: ",
                    //     markerIds.ucharPtr(i, 0)[0],
                    //     "rvecs: ",
                    //     [rvec.doublePtr(0, 0)[0], rvec.doublePtr(0, 1)[0], rvec.doublePtr(0, 2)[0]],
                    //     "tvecs: ",
                    //     [tvec.doublePtr(0, 0)[0], tvec.doublePtr(0, 1)[0], tvec.doublePtr(0, 2)[0]]
                    // );
                    poseData.push({
                        num: num,
                        time: elapsedTime,  
                        markerId: markerIds.ucharPtr(i, 0)[0],
                        rvecs: [+rvec.doublePtr(0, 0)[0].toFixed(4), +rvec.doublePtr(0, 1)[0].toFixed(4), +rvec.doublePtr(0, 2)[0].toFixed(4)],
                        tvecs: [+tvec.doublePtr(0, 0)[0].toFixed(4), +tvec.doublePtr(0, 1)[0].toFixed(4), +tvec.doublePtr(0, 2)[0].toFixed(4)],
                    });

                    // poseData.push({
                    // poseData.push({ num: num, markerId: markerIds.ucharPtr(i, 0)[0], rvecs: rvecs.doublePtr(i), tvecs: tvecs.doublePtr(i) });
                    // poseData.push({
                    //     num,
                    //     markerId: markerIds.ucharPtr(i, 0)[0],
                    //     rvecs: Array.from(rvecs.data64F.subarray(i * 3, i * 3 + 3)),
                    //     tvecs: Array.from(tvecs.data64F.subarray(i * 3, i * 3 + 3)),
                    // });
                }
                rvec.delete();
                tvec.delete();
            }
            if (isRecordData) {
                num++;
            }
            // 保存 rvecs 和 tvecs 数据

            const processedImage = imageDataFromMat(RgbImage);
            // console.log("processedImage: ", processedImage);
            const processedView = new Uint8ClampedArray(processedBuffer);
            processedView.set(new Uint8ClampedArray(processedImage.data.buffer));
            self.postMessage({ type: "JS_RESULT", deviceId, result: { rvecs, tvecs, num, markerId: markerIds.ucharPtr(0, 0)[0] } }); //这个也许不需要？

            // console.log("Processed view first 10 elements: ", processedView.slice(0, 10));

            inputImage.delete();
            RgbImage.delete();
            markerImage.delete();
            dictionary.delete();
            markerIds.delete();
            markerCorners.delete();
            rvecs.delete();
            tvecs.delete();
            cameraMatrix.delete();
            distCoeffs.delete();
            // console.log("poseData: ", poseData);
        } catch (error) {
            self.postMessage({
                type: "JS_ERROR",
                error: error.message,
                deviceId,
            });
        }
    } else if (event.data.type === "GET_POSE") {
        self.postMessage({ type: "POSE_DATA", deviceId: event.data.deviceId, result: poseData });
    }
    countForRunJS++;
    let endTime = performance.now();
    let processTime = endTime - startTime;
    processTimeArrayJS.push(processTime);
    if (countForRunJS % 10 === 0) {
        countForRunJS = 0;
        let sum = 0;
        for (let i = 0; i < processTimeArrayJS.length; i++) {
            sum += processTimeArrayJS[i];
        }
        let avg = sum / processTimeArrayJS.length;
        console.log("Average time for 10 frames (runJS): ", avg);
        processTimeArrayJS = [];
    }
};

function imageDataFromMat(mat) {
    // converts the mat type to cv.CV_8U
    const img = new cv.Mat();
    const depth = mat.type() % 8;
    const scale = depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0;
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
            throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
    }
    const clampedArray = new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);
    img.delete();
    return clampedArray;
}
