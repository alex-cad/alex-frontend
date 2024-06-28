/**
 *  Here we will check from time to time if we can access the OpenCV
 *  functions. We will return in a callback if it's been resolved
 *  well (true) or if there has been a timeout (false).
 */
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

/**
 * This exists to capture all the events that are thrown out of the worker
 * into the worker. Without this, there would be no communication possible
 * with the project.
 */
onmessage = function (e) {
  switch (e.data.msg) {
    case "load": {
      // Import Webassembly script
      self.importScripts("./opencv.js");
      waitForOpencv(function (success) {
        if (success) postMessage({ msg: e.data.msg });
        else throw new Error("Error on loading OpenCV");
      });
      break;
    }
    default:
      break;
  }
  /**
   * With OpenCV we have to work with the images as cv.Mat (matrices),
   * so you'll have to transform the ImageData to it.
   */
  function imageProcessing({ msg, payload }) {
    const img = cv.matFromImageData(payload);
    let result = new cv.Mat();

    // This converts the image to a greyscale.
    let startTime = performance.now();
    cv.cvtColor(img, result, cv.COLOR_BGR2GRAY);
    let endTime = performance.now();
    let processingTime = endTime - startTime;
    console.log("Processing time: ", processingTime);
    postMessage({ msg, payload: imageDataFromMat(result) });
  }

  function detectAruco({ msg, payload }) {
    console.log('inputImage in detect Aruco 1: ', payload)
    const inputImage = cv.matFromImageData(payload);
    console.log('inputImage in detect Aruco 2: ', inputImage)
    let grayImg = new cv.Mat();
    RgbImage = new cv.Mat();
   

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
    let markerCorners  = new cv.MatVector();
    let rvecs = new cv.Mat();
    let tvecs = new cv.Mat();
    cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [
        9.6635571716090658e+02, 0., 2.0679307818305685e+02, 0.,
        9.6635571716090658e+02, 2.9370020600555273e+02, 0., 0., 1.
    ]);
    let distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [
        -1.5007354215536557e-03, 9.8722389825801837e-01,
        1.7188452542408809e-02, -2.6805958820424611e-02, -2.3313928379240205e+00
    ]);
    
    cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
    console.log("RgmImage:", RgbImage);
    let startTime = performance.now()
        cv.detectMarkers(RgbImage, dictionary, markerCorners, markerIds, parameter);
    let endTime = performance.now()
    let processingTime = endTime - startTime; 
    console.log('detect time:', processingTime);
    console.log(markerIds.rows);
    if (markerIds.rows > 0) {
        cv.drawDetectedMarkers(RgbImage, markerCorners, markerIds);
        console.log('estimating pose');
        let startTime = performance.now();
        cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
        let endTime = performance.now();
        let processingTime = endTime - startTime;
        console.log("Estimate time: ", processingTime);
        console.log(rvecs.rows, tvecs.rows);
        for(let i=0; i < markerIds.rows; ++i) {
            let rvec = cv.matFromArray(3, 1, cv.CV_64F, [rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);
            let tvec = cv.matFromArray(3, 1, cv.CV_64F, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);
            cv.drawAxis(RgbImage, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
            rvec.delete();
            tvec.delete();
        }
    }
    
    // // cv.imshow("arucoCanvasOutput", RgbImage);
    // RgbImagev.delete(); markerImage.delete(); dictionary.delete(); markerIds.delete(); markerCorners.delete(); rvecs.delete(); tvecs.delete(); cameraMatrix.delete(); distCoeffs.delete();

    // This converts the image to a greyscale.
    // let startTime = performance.now();
   
    // let endTime = performance.now();
    // let processingTime = endTime - startTime;
    // console.log("Processing time: ", processingTime);
    postMessage({ msg, payload: imageDataFromMat(RgbImage) });
  }




  /**
   * This function converts again from cv.Mat to ImageData
   */
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

  onmessage = function (e) {
    switch (e.data.msg) {
      // ...previous onmessage code here...
      case "imageProcessing":
        return imageProcessing(e.data);
        case "detectAruco": 
        return detectAruco(e.data);
            
      default:
        break;
    }
  };
};
