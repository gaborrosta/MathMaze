package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.Point
import com.rostagabor.mathmaze.utils.CouldNotRecogniseMazeException
import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import org.springframework.web.multipart.MultipartFile
import java.io.File
import kotlin.random.Random

/**
 *   Algorithms to recognise the numbers in a maze.
 */
object Recogniser {

    /**
     *   Recognises the number in the maze from the uploaded image.
     */
    @Throws(CouldNotRecogniseMazeException::class)
    fun recogniseMaze(
        uploadedFile: MultipartFile,
        rotation: Int,
        widthInTiles: Int,
        heightInTiles: Int,
        endPoint: Point,
    ): Pair<List<List<String>>, List<Point>> {
        //Open the image in grayscale
        val image = openImage(uploadedFile, rotation)

        val tempFile = File.createTempFile("temp", ".jpg")
        println("Temporary file location: ${tempFile.absolutePath}")
        Imgcodecs.imwrite(tempFile.absolutePath, image)

        //TODO...
        return List(11) {
            List(11) {
                if (Random.nextFloat() < 0.7) Random.nextInt(1, 11).toString() else ""
            }
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
        val gray = Mat()
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY)

        //Rotate if needed
        return if (rotation != 0) {
            //Size
            val width = gray.cols().toDouble()
            val height = gray.rows().toDouble()

            //Create a rotation matrix
            val center = Point((width / 2), (height / 2))
            val rotationMatrix = Imgproc.getRotationMatrix2D(center, rotation.toDouble(), 1.0)

            //Rotate the image
            val rotatedImage = Mat()
            Imgproc.warpAffine(gray, rotatedImage, rotationMatrix, Size(width, height))

            rotatedImage
        } else {
            gray
        }
    }

}
