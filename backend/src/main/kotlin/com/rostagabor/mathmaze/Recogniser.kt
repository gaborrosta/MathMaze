package com.rostagabor.mathmaze

import org.jetbrains.kotlinx.dl.impl.util.argmax
import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import java.io.File

object Recogniser {

    /**
     *   Opens and recognises a maze from an image.
     */
    fun openAndRecogniseMaze(name: String = "maze1.jpg", width: Int = 11, height: Int = 11) {
        //Results for "maze1.jpg"
        val results = listOf(
            1 to 1,
            11 to 4,
            12 to 7,
            22 to 0,
            23 to 1,
            33 to 10,
            34 to 7,
            44 to 4,
            45 to 1,
            55 to 10,
            56 to 1,
            66 to 10,
            67 to 9,
            70 to 4,
            71 to 10,
            72 to 4,
            73 to 6,
            74 to 6,
            75 to 6,
            76 to 10,
            77 to 6,
            78 to 9,
            81 to 2,
            87 to 2,
            88 to 10,
            89 to 8,
            90 to 18,
            91 to 4,
            92 to 16,
            93 to 15,
            94 to 1,
            98 to 4,
            104 to 1,
            105 to 1,
            109 to 14,
        ).toMap()

        //Counters
        var ok = 0
        var fullok = 0

        //Open the image
        val image = openImage(name)

        //Find the maze in the image and rotate the image based on the maze
        var contour = findLargestContour(image)
        var result = rotateBasedOnContour(image, contour)

        //Cut out the maze from the image
        contour = findLargestContour(result)
        result = cutoutContour(result, contour)

        //Cut the maze into tiles
        val tiles = cutMazeToTiles(result, width, height)

        //Process the tiles
        for (i in tiles.indices) {
            //Start tile...
            if (i == 0) continue

            //Process the tile and compare it to the expected result
            val number = processTile(tiles[i], i)
            val expected = results[i] ?: -1
            if (number == expected.toString()) ok++
            if (number == expected.toString() || (expected == -1 && number == "")) fullok++
            println("Tile $i: $number; expected: $expected")
        }

        //Save it to a temporary file
        val tempFile = File.createTempFile("temp", ".jpg")
        println("Temporary file location: ${tempFile.absolutePath}")
        println("Ok: $ok")
        println("Fullok: $fullok")
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


    /**
     *   Cuts the maze into tiles based on the width and height.
     */
    private fun cutMazeToTiles(maze: Mat, width: Int, height: Int): List<Mat> {
        val tiles = mutableListOf<Mat>()
        val tileWidth = maze.width() / width
        val tileHeight = maze.height() / height

        for (y in 0 until height) {
            for (x in 0 until width) {
                val tile = Mat(maze, Rect(x * tileWidth, y * tileHeight, tileWidth, tileHeight))
                tiles.add(tile)
            }
        }

        return tiles
    }


    /**
     *   Processes a tile and returns the number on it.
     */
    private fun processTile(tile: Mat, index: Int): String {
        //Cut every tile into half vertically
        //val upperHalf = Mat(tile, Rect(0, 0, tile.width(), tile.height() / 2))
        val lowerHalf = Mat(tile, Rect(0, tile.height() / 2, tile.width(), tile.height() / 2))

        //Cut lowerHalf into half horizontally
        val numberLeft = Mat(lowerHalf, Rect(0, 0, lowerHalf.width() / 2, lowerHalf.height()))
        val numberRight = Mat(lowerHalf, Rect(lowerHalf.width() / 2, 0, lowerHalf.width() / 2, lowerHalf.height()))

        //Process the images
        val processedLeft = processImage(numberLeft)
        val processedRight = processImage(numberRight)

        //Convert the images to float arrays
        val shiftedFloatLeft = matToFloatArray(processedLeft)
        val shiftedFloatRight = matToFloatArray(processedRight)

        //Check if the images contain a number or empty
        val leftIsANumber = shiftedFloatLeft.max() != 0F
        val rightIsANumber = shiftedFloatRight.max() != 0F

        //Prediction for the left image
        val left = if (leftIsANumber) {
            print("$index left:")
            for (y in 0 until 28) {
                for (x in 0 until 28) {
                    print(if (shiftedFloatLeft[y * 28 + x] > 50) "X" else " ")
                }
                println()
            }

            val predictedNumberLeft = ML.predict(shiftedFloatLeft)
            println("$index left max: ${predictedNumberLeft.argmax()}; ${predictedNumberLeft.joinToString()}, ")
            predictedNumberLeft.argmax().toString()
        } else {
            ""
        }

        //Prediction for the right image
        val right = if (rightIsANumber) {
            print("$index right:")
            for (y in 0 until 28) {
                for (x in 0 until 28) {
                    print(if (shiftedFloatRight[y * 28 + x] > 50) "X" else " ")
                }
                println()
            }

            val predictedNumberRight = ML.predict(shiftedFloatRight)
            println("$index right max: ${predictedNumberRight.argmax()}; ${predictedNumberRight.joinToString()}")
            predictedNumberRight.argmax().toString()
        } else {
            ""
        }

        return left + right
    }

    /**
     *   Processes the image to be used as input for the neural network.
     */
    private fun processImage(image: Mat): Mat {
        //Remove 10px wide border
        var borderlessImage = Mat(image, Rect(10, 10, image.width() - 20, image.height() - 20))

        //Invert black and white
        Core.subtract(Mat(borderlessImage.size(), CvType.CV_8U, Scalar(255.0)), borderlessImage, borderlessImage)

        //Remove the white space
        borderlessImage = removeEmptyRowsAndColumns(borderlessImage)

        //If the image is empty, return a 28x28 black image
        if (borderlessImage.width() == 0 && borderlessImage.height() == 0) {
            return Mat(28, 28, CvType.CV_8U, Scalar(0.0))
        }

        //Find its longest dimension
        val height = borderlessImage.rows()
        val width = borderlessImage.cols()
        val maxDim = maxOf(height, width)

        //Calculate the amount of padding needed
        val top = (maxDim - height) / 2
        val bottom = maxDim - height - top
        val left = (maxDim - width) / 2
        val right = maxDim - width - left

        //Make the image square
        val squareImg = Mat()
        Core.copyMakeBorder(borderlessImage, squareImg, top, bottom, left, right, Core.BORDER_CONSTANT, Scalar(0.0))

        //Rescale the image to 20x20
        val rescaledImage = Mat()
        Imgproc.resize(squareImg, rescaledImage, Size(20.0, 20.0))

        //Apply dilation
        val dilatedImage = Mat()
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(2.0, 2.0))
        Imgproc.dilate(rescaledImage, dilatedImage, kernel)

        //Pad the image to size 28x28
        val paddedImage = Mat()
        Core.copyMakeBorder(dilatedImage, paddedImage, 4, 4, 4, 4, Core.BORDER_CONSTANT, Scalar(0.0, 0.0, 0.0))

        //Remove noise
        Core.inRange(paddedImage, Scalar(50.0), Scalar(255.0), paddedImage)

        //Shift the image
        return shift(paddedImage)
    }

    /**
     *   Removes empty rows and columns from the image.
     */
    private fun removeEmptyRowsAndColumns(image: Mat): Mat {
        var result = image.clone()

        //Remove empty rows
        while (result.rows() > 0 && Core.countNonZero(result.row(0)) == 0) {
            result = result.submat(1, result.rows(), 0, result.cols())
        }
        while (result.rows() > 0 && Core.countNonZero(result.row(result.rows() - 1)) == 0) {
            result = result.submat(0, result.rows() - 1, 0, result.cols())
        }

        //Remove empty columns
        while (result.cols() > 0 && Core.countNonZero(result.col(0)) == 0) {
            result = result.submat(0, result.rows(), 1, result.cols())
        }
        while (result.cols() > 0 && Core.countNonZero(result.col(result.cols() - 1)) == 0) {
            result = result.submat(0, result.rows(), 0, result.cols() - 1)
        }

        return result
    }

    /**
     *   Shifts the image so that the center of mass is in the center of the image.
     */
    private fun shift(image: Mat): Mat {
        //Find the center of mass
        val s = Core.sumElems(image).`val`[0]
        val cy: Double
        val cx: Double
        if (s == 0.0) {
            cy = 0.0
            cx = 0.0
        } else {
            val moments = Imgproc.moments(image, true)
            cx = moments.m10 / moments.m00
            cy = moments.m01 / moments.m00
        }

        //Shape
        val height = image.rows()
        val width = image.cols()

        //Find the shift needed
        val shiftx = Math.round(width / 2.0 - cx).toInt()
        val shifty = Math.round(height / 2.0 - cy).toInt()

        //Transformation matrix
        val m = Mat(2, 3, CvType.CV_32F)
        m.put(0, 0, 1.0)
        m.put(0, 1, 0.0)
        m.put(0, 2, shiftx.toDouble())
        m.put(1, 0, 0.0)
        m.put(1, 1, 1.0)
        m.put(1, 2, shifty.toDouble())

        //Shift the image
        val shiftedImage = Mat()
        Imgproc.warpAffine(image, shiftedImage, m, Size(width.toDouble(), height.toDouble()))

        return shiftedImage
    }

    /**
     *   Converts a Mat to a float array to be used as input for the neural network.
     */
    private fun matToFloatArray(mat: Mat): FloatArray {
        val floatMat = Mat()
        mat.convertTo(floatMat, CvType.CV_32F)
        val size = floatMat.rows() * floatMat.cols() * floatMat.channels()
        val floatArray = FloatArray(size)
        floatMat.get(0, 0, floatArray)
        return floatArray.map { it * 255 }.toFloatArray()
    }

}
