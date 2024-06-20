import cv2
import cv2.aruco as aruco
import numpy as np

def run_aruco_code():
    print('opencv version: ', cv2.__version__)
    print('numpy version: ', np.__version__)
    aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
    print('hello')
run_aruco_code()