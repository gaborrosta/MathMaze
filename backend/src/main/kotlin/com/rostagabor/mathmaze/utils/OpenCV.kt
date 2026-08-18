package com.rostagabor.mathmaze.utils

import org.bytedeco.javacpp.Loader
import org.bytedeco.opencv.global.opencv_core
import org.bytedeco.opencv.global.opencv_imgcodecs
import org.bytedeco.opencv.global.opencv_imgproc
import org.opencv.core.Core

/**
 *   Loads OpenCV or throws an exception if it fails.
 */
@Throws(Exception::class)
fun loadOpenCV() {
    Loader.load(opencv_core::class.java)
    Loader.load(opencv_imgproc::class.java)
    Loader.load(opencv_imgcodecs::class.java)

    //Check if OpenCV is loaded (it will throw an exception if it is not)
    println("OpenCV version: ${Core.VERSION}")
}
