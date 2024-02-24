package com.rostagabor.mathmaze

import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import java.io.File

object Recogniser {

    /**
     *   Opens and recognises a maze from an image.
     */
    fun openAndRecogniseMaze(name: String) {
        //Open the image
        val image = openImage(name)

        //Find the maze in the image and rotate the image based on the maze
        var contour = findLargestContour(image)
        var result = rotateBasedOnContour(image, contour)

        //Cut out the maze from the image
        contour = findLargestContour(result)
        result = cutoutContour(result, contour)

        //Save it to a temporary file
        val tempFile = File.createTempFile("temp", ".jpg")
        println("Temporary file location: ${tempFile.absolutePath}")
        Imgcodecs.imwrite(tempFile.absolutePath, result)
    }


    /**
     *   Opens an image in grayscale.
     */
    private fun openImage(name: String): Mat {
        val image = Imgcodecs.imread("src/main/resources/static/$name")

        if (image.empty()) {
            throw RuntimeException("Failed to open image: $name")
        }

        //Convert the image to grayscale
        val gray = Mat()
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY)
        return gray
    }

    /**
     *   Finds the largest contour in the image.
     *
     *   Adapted from: https://stackoverflow.com/questions/67302143/opencv-python-how-to-detect-filled-rectangular-shapes-on-picture
     */
    private fun findLargestContour(image: Mat): MatOfPoint {
        //Adaptive threshold
        val thresh = Mat()
        Imgproc.adaptiveThreshold(image, thresh, 255.0, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C, Imgproc.THRESH_BINARY_INV, 51, 9.0)

        //Find contours
        val contours: List<MatOfPoint> = ArrayList()
        Imgproc.findContours(thresh, contours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        //Fill contours
        Imgproc.drawContours(thresh, contours, -1, Scalar(255.0, 255.0, 255.0), -1)

        //Morph open
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(9.0, 9.0))
        val opening = Mat()
        Imgproc.morphologyEx(thresh, opening, Imgproc.MORPH_OPEN, kernel)

        //Find contours
        val finalContours: List<MatOfPoint> = ArrayList()
        Imgproc.findContours(opening, finalContours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        // Find the biggest rectangle contour
        return finalContours.maxByOrNull { Imgproc.contourArea(it) } ?: MatOfPoint()
    }

    /**
     *   Rotates the image based on the contour.
     */
    private fun rotateBasedOnContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            return image
        }

        //Get the rotated rectangle of the contour
        val rotatedRect = Imgproc.minAreaRect(MatOfPoint2f(*contour.toArray()))

        //Get the rotation matrix
        val rotationMatrix = Imgproc.getRotationMatrix2D(rotatedRect.center, rotatedRect.angle, 1.0)

        //Apply the rotation to the entire image
        var rotatedImage = Mat()
        if (rotatedRect.angle % 90 != 0.0) {
            Imgproc.warpAffine(image, rotatedImage, rotationMatrix, image.size())
        } else {
            rotatedImage = image
        }

        //Convert the rotated rectangle to integer coordinates
        val boundingRect = rotatedRect.boundingRect()

        //Create a new image that is a subimage of the rotated image, cut to the bounding rectangle
        val result = Mat(rotatedImage, boundingRect)

        return result
    }

    /**
     *   Cuts out the contour from the image.
     */
    private fun cutoutContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            return image
        }

        //Get the bounding rectangle of the largest contour
        val boundingRect = Imgproc.boundingRect(contour)

        //Create a new image that is a subimage of the original image, cut to the bounding rectangle
        val result = Mat(image, boundingRect)

        return result
    }

}
