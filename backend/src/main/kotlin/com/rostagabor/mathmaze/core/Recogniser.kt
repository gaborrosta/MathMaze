package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.Point
import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import org.springframework.web.multipart.MultipartFile
import java.io.File
import kotlin.random.Random

/**
 *   Algorithms for recognising the numbers in a maze.
 */
object Recogniser {

    /**
     *   Recognises the number in the maze from the uploaded image.
     */
    @Throws(Exception::class)
    fun recogniseMaze(
        uploadedFile: MultipartFile,
        rotation: Int,
        widthInTiles: Int,
        heightInTiles: Int,
        endPoint: Point,
        numberOfDigits: Int,
    ): Pair<List<List<String>>, List<Point>> {
        //Open the image in grayscale
        val image = openImage(uploadedFile, rotation)

        val tempFile = File.createTempFile("temp", ".jpg")
        println("Temporary file location: ${tempFile.absolutePath}")
        Imgcodecs.imwrite(tempFile.absolutePath, image)

        //TODO...
        return List(11) {
            List(11) { if (Random.nextFloat() < 0.7) Random.nextInt(1, 11).toString() else "" }
        } to listOf(Point.START, endPoint)
    }


    /**
     *   Opens an image in grayscale and rotates it as specified by the user.
     */
    @Throws(RuntimeException::class)
    private fun openImage(uploadedFile: MultipartFile, rotation: Int): Mat {
        //Convert MultipartFile to Mat object
        val image = Imgcodecs.imdecode(MatOfByte(*uploadedFile.bytes), Imgcodecs.IMREAD_UNCHANGED)

        //Check if the image is empty
        if (image.empty()) {
            throw RuntimeException("Failed to open image: ${uploadedFile.originalFilename}")
        }

        //Convert the image to grayscale
        var gray = Mat()
        if (image.channels() > 1) {
            Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY)
        } else {
            gray = image.clone()
        }

        //Rotate if needed
        return if (rotation != 0) {
            val rotateCode = when (rotation) {
                90 -> Core.ROTATE_90_CLOCKWISE
                180 -> Core.ROTATE_180
                270 -> Core.ROTATE_90_COUNTERCLOCKWISE
                else -> throw RuntimeException("Invalid rotation value: $rotation")
            }
            val rotatedImage = Mat()
            Core.rotate(gray, rotatedImage, rotateCode)
            rotatedImage
        } else {
            gray
        }
    }

}
