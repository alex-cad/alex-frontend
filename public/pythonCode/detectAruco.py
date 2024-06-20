import cv2
import numpy as np
import base64
import cv2.aruco as aruco

def process_image( base64_str):
    # Decode the Base64 string
    image_data = base64.b64decode(base64_str)
    # Create a NumPy array from the decoded bytes
    image_array = np.frombuffer(image_data, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    cx = 655.3664
    cy = 367.5246
    fx = 971.2252
    fy = 970.7470
    k1 = 0.0097
    k2 = -0.00745
    k3 = 0.00
    p1 = 0.00
    p2 = 0.00
    intrinsic_camera = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])
    distortion = np.array([k1, k2, p1, p2, k3])

    arucoDict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
    arucoParams = aruco.DetectorParameters()

    corners, ids, rejected = cv2.aruco.detectMarkers(gray_image, arucoDict, parameters=arucoParams)

    if ids is not None:
        for index in range(0, len(ids)):
            # print(f"ID length: {len(ids)}")
            rvec, tvec, _ = cv2.aruco.estimatePoseSingleMarkers(corners[index], 20, intrinsic_camera,
                                                                    distortion)
            cv2.aruco.drawDetectedMarkers(gray_image, corners, ids)
            cv2.drawFrameAxes(gray_image, intrinsic_camera, distortion, rvec, tvec, 20)

    # Encode image back to base64 string
    _, buffer = cv2.imencode('.jpg', gray_image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')
    return encoded_image
