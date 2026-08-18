package com.rostagabor.mathmaze.utils

import org.bytedeco.javacpp.Loader
import org.bytedeco.opencv.opencv_java
import org.opencv.core.Core

/**
 *   Loads OpenCV or throws an exception if it fails.
 */
@Throws(Exception::class)
fun loadOpenCV() {
    Loader.load(opencv_java::class.java)

    //Check if OpenCV is loaded (it will throw an exception if it is not)
    println("OpenCV version: ${Core.VERSION}")
}
