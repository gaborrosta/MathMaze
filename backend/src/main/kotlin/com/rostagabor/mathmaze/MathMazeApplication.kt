package com.rostagabor.mathmaze

import org.opencv.core.Core
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.io.File
import java.util.*
import kotlin.math.min

@SpringBootApplication
class MathMazeApplication

fun main(args: Array<String>) {
    //ML.train()

    val osName = System.getProperty("os.name").lowercase(Locale.getDefault())
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
            "libzmq.so.5",
            "libavformat.so.58",
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

    try {
        println("OpenCV version: ${Core.VERSION}")
    } catch (e: UnsatisfiedLinkError) {
        println("Failed to load OpenCV: ${e.message}")
    }

    runApplication<MathMazeApplication>(*args)
}

@RestController
class BasicController {

    @GetMapping("/")
    fun index() = "Hello"

    @GetMapping("/name")
    fun name(@RequestParam name: String) = "Hello, $name!"

    @GetMapping("/generate")
    fun generate(
        @RequestParam width: Int,
        @RequestParam height: Int,
        @RequestParam minLength: Int = min(width, height),
        @RequestParam maxLength: Int = Int.MAX_VALUE,
    ): String {
        return try {
            val (result, message) = Generator.generateCharacterMaze(width, height, minLength, maxLength)
            "<pre>" + result.joinToString(
                separator = "<br>",
                prefix = "-".repeat(width + 2) + "\n",
                postfix = "\n" + "-".repeat(width + 2),
            ) {
                it.joinToString(
                    separator = "",
                    prefix = "|",
                    postfix = "|",
                )
            } + "</pre><br>$message"
        } catch (e: Exception) {
            e.message ?: "Unknown error"
        }
    }

    //@GetMapping("/ml")
    //fun ml() = "<pre>" + ML.ask().joinToString(separator = "<br>") + "</pre>"

}
