// // example1.js
// global.Module = {
//     onRuntimeInitialized() {
//       global.cv = cv;
//       console.log('OpenCV.js is ready');
//       console.log(cv.getBuildInformation());
//     }
//   };
  
//   const path = require('path');
//   const fs = require('fs');
  
//   const opencvPath = path.join(__dirname, 'public', 'opencv.js');
//   if (!fs.existsSync(opencvPath)) {
//     console.error('opencv.js file not found!');
//     process.exit(1);
//   }
  
//   try {
//     const cv = require(opencvPath);
//     console.log('OpenCV.js successfully loaded');
//     global.cv = cv;
//   } catch (error) {
//     console.error('Error loading OpenCV.js:', error);
//   }