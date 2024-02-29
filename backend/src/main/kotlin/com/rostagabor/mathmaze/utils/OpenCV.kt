package com.rostagabor.mathmaze.utils

import org.opencv.core.Core
import java.io.File

/**
 *   Loads OpenCV or throws an exception if it fails.
 */
@Throws(Exception::class)
fun loadOpenCV() {
    //Load OpenCV
    val osName = System.getProperty("os.name").lowercase()
    if (!osName.startsWith("mac")) {
        val opencvName = if (osName.startsWith("win")) "opencv_java490.dll" else "libopencv_java490.so"

        if (!osName.startsWith("win")) {
            val dependencies = listOf(
                "libjpeg.so.62",
                "libva.so.2",
                "libdrm.so.2",
                "libva-drm.so.2",
                "libXfixes.so.3",
                "libva-x11.so.2",
                "libvdpau.so.1",
                "libmfx.so.1",
                "libOpenCL.so.1",
                "libavutil.so.56",
                "libsoxr.so.0",
                "libswresample.so.3",
                "libvpx.so.6",
                "libwebp.so.6",
                "libdav1d.so.4",
                "libzvbi.so.0",
                "libsnappy.so.1",
                "libaom.so.0",
                "libcodec2.so.0.9",
                "libgsm.so.1",
                "libshine.so.3",
                "libtwolame.so.0",
                "libwavpack.so.1",
                "libx264.so.160",
                "libx265.so.192",
                "libxvidcore.so.4",
                "libavcodec.so.58",
                "libgme.so.0",
                "libmpg123.so.0",
                "libopenmpt.so.0",
                "libchromaprint.so.1",
                "libudfread.so.0",
                "libbluray.so.2",
                "libsrt-gnutls.so.1.4",
                "libssh-gcrypt.so.4",
                "libpgm-5.3.so.0",
                "libnorm.so.1",
                "libzmq.so.5",
                "libavformat.so.58",
                "libswscale.so.5",
                "libopencv_core.so.409",
                "libopencv_imgproc.so.409",
                "libopencv_ml.so.409",
                "libopencv_photo.so.409",
                "libopencv_imgcodecs.so.409",
                "libopencv_dnn.so.409",
                "libopencv_flann.so.409",
                "libopencv_features2d.so.409",
                "libopencv_calib3d.so.409",
                "libopencv_videoio.so.409",
                "libopencv_objdetect.so.409",
                "libopencv_video.so.409",
            )

            dependencies.forEach { dependency ->
                System.load(File("libs/$dependency").absolutePath)
            }
        }

        System.load(File("libs/$opencvName").absolutePath)
    } else {
        println("OpenCV is not loaded on macOS. Please install it using Homebrew.")
    }

    //Check if OpenCV is loaded (it will throw an exception if it is not)
    println("OpenCV version: ${Core.VERSION}")
}
