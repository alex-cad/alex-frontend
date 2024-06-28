"use client";
// import { OpenCvProvider, useOpenCv } from '../../node_modules/opencv-react/dist/index.js'
import { OpenCvProvider, useOpenCv } from 'opencv-react';
import React, { useEffect, useRef } from 'react';


function MyComponent() {
  const data = useOpenCv()
  // console.log(data)
  return <p>OpenCv React test</p>
}
  
  const MyPage = () => {
    const onLoaded = (cv) => {
      console.log('opencv loaded', cv)
      console.log('hihihi')
    }
  
    return (
      <OpenCvProvider onLoad={onLoaded} openCvPath='/js/opencv.js'>
        <MyComponent />
      </OpenCvProvider>
    )
  }

  export default MyPage;
