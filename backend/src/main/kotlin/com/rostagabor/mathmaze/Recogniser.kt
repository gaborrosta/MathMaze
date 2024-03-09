package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.core.ML
import com.rostagabor.mathmaze.data.Point
import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import java.io.File

object Recogniser {

    /**
     *   The factor to make image brighter when loading. (Photo: 75.0)
     */
    private const val BRIGHTNESS = 0.0

    /**
     *   This ratio many pixels have to be nonzero in a line to be considered as an actual line across the image. (Scan: 0.97)
     */
    private const val LINE_FILL_LIMIT = 0.9

    /**
     *   The maximum step between lines to be considered as a part of the same block when determining lines across the image.
     */
    private const val LINES_MAX_STEP_BETWEEN = 3

    /**
     *   The minimum width of the found lines, everything with width less than this will be considered as "noise".
     */
    private const val LINES_MIN_WIDTH_TO_KEEP_FIRST = 5

    /**
     *   The minimum width a line has to have. Lines are made narrower until this width is reached.
     */
    private const val LINES_REDUCED_MIN_WIDTH = 5

    /**
     *   Noise limit for the processed numbers. Pixel with value above this limit is considered as part of the number.
     */
    private const val NOISE_LIMIT = 50.0


    /**
     *   Opens and recognises a maze from an image.
     */
    @Throws(RuntimeException::class)
    fun openAndRecogniseMaze(name: String = "maze1.jpg", width: Int = 11, height: Int = 11, endPoint: Point = Point(8, 10)) {
        //Open the image
        val image = openImage(name)

        //Find the maze in the image and rotate the image based on the maze
        var contour = findLargestContour(image)
        var result = rotateBasedOnContour(image, contour)

        //Cut out the maze from the image
        contour = findLargestContour(result)
        result = cutoutContour(result, contour)

        //Cut the maze into tiles
        val tiles = cutMazeToTiles(result)
        if (tiles.size != width * height) {
            throw RuntimeException("The number of tiles is not correct: ${tiles.size} instead of ${width * height}")
        }

        //Process the tiles
        for (i in tiles.indices) {
            //Start and end tiles...
            if (i == 0 || i == (endPoint.y * width + endPoint.x)) continue

            //Process the tile
            val number = processTile(tiles[i], i)
            println("Tile $i: $number")
        }

        //Save it to a temporary file
        val tempFile = File.createTempFile("temp", ".jpg")
        println("Temporary file location: ${tempFile.absolutePath}")
        Imgcodecs.imwrite(tempFile.absolutePath, result)
    }


    /**
     *   Opens an image in grayscale.
     */
    @Throws(RuntimeException::class)
    private fun openImage(name: String): Mat {
        val image = Imgcodecs.imread("src/main/resources/static/$name")

        if (image.empty()) {
            throw RuntimeException("Failed to open image: $name")
        }

        //Convert the image to grayscale
        val gray = Mat()
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY)

        //Increase brightness
        Core.convertScaleAbs(gray, gray, 1.0, BRIGHTNESS)

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
        val contours = arrayListOf<MatOfPoint>()
        Imgproc.findContours(thresh, contours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        //Fill contours
        Imgproc.drawContours(thresh, contours, -1, Scalar(255.0, 255.0, 255.0), -1)

        //Morph open
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(9.0, 9.0))
        val opening = Mat()
        Imgproc.morphologyEx(thresh, opening, Imgproc.MORPH_OPEN, kernel)

        //Find contours
        val finalContours = arrayListOf<MatOfPoint>()
        Imgproc.findContours(opening, finalContours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)

        //Find the biggest rectangle contour
        return finalContours.maxByOrNull { Imgproc.contourArea(it) } ?: MatOfPoint()
    }

    /**
     *   Rotates the image based on the contour.
     */
    @Throws(RuntimeException::class)
    private fun rotateBasedOnContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            throw RuntimeException("Contour is empty")
        }

        //Get the rotated rectangle of the contour
        val rotatedRect = Imgproc.minAreaRect(MatOfPoint2f(*contour.toArray()))

        //Get the angle
        val angle = if (rotatedRect.angle > 45) rotatedRect.angle - 90 else rotatedRect.angle

        //Get the rotation matrix
        val rotationMatrix = Imgproc.getRotationMatrix2D(rotatedRect.center, angle, 1.0)

        //Apply the rotation to the entire image
        val rotatedImage = Mat()
        Imgproc.warpAffine(image, rotatedImage, rotationMatrix, image.size())

        return rotatedImage
    }

    /**
     *   Cuts out the contour from the image.
     */
    @Throws(RuntimeException::class)
    private fun cutoutContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            throw RuntimeException("Contour is empty")
        }

        //Get the bounding rectangle of the largest contour
        val boundingRect = Imgproc.boundingRect(contour)

        //Cut out the bounding rectangle
        val result = Mat(image, boundingRect)

        return result
    }


    /**
     *   Cuts the maze into tiles based on the edges.
     */
    private fun cutMazeToTiles(maze: Mat): List<Mat> {
        //Get the rows
        val rows = findLines(maze, horizontal = true) { index, _ -> index % 2 == 0 }

        //Get the columns
        val columns = findLines(maze, horizontal = false)

        //Cut the maze into tiles
        val tiles = arrayListOf<Mat>()
        rows.drop(1).dropLast(1).windowed(2, 2).forEach { (y0, y1) ->
            columns.drop(1).dropLast(1).windowed(2, 2).forEach { (x0, x1) ->
                tiles.add(Mat(maze, Rect(x0, y0, x1 - x0, y1 - y0)))
            }
        }

        return tiles
    }

    /**
     *   Finds the horizontal or vertical lines in the image and returns the processed indices.
     */
    private fun findLines(image: Mat, horizontal: Boolean, filter: (Int, List<Int>) -> Boolean = { _, _ -> true }): List<Int> {
        //Apply Gaussian blur to reduce noise
        val blurredImage = Mat()
        Imgproc.GaussianBlur(image, blurredImage, Size(3.0, 3.0), 0.0)

        //Use Sobel operator to detect edges
        val edges = Mat()
        if (horizontal) {
            Imgproc.Sobel(blurredImage, edges, CvType.CV_16S, 0, 1)
        } else {
            Imgproc.Sobel(blurredImage, edges, CvType.CV_16S, 1, 0)
        }

        //Convert back to CV_8U
        val absEdges = Mat()
        Core.convertScaleAbs(edges, absEdges)

        //Find the rows/columns that are almost entirely edges
        val edgeList = mutableListOf<Int>()
        if (horizontal) {
            for (row in 0 until edges.rows()) {
                if (Core.countNonZero(edges.row(row)) > edges.cols() * LINE_FILL_LIMIT) {
                    edgeList.add(row)
                }
            }
        } else {
            for (col in 0 until edges.cols()) {
                if (Core.countNonZero(edges.col(col)) > edges.rows() * LINE_FILL_LIMIT) {
                    edgeList.add(col)
                }
            }
        }

        //Return the processed indices
        return processLines(edgeList, filter)
    }

    /**
     *   Processes the lines of edges and returns pairs which can be used to cut out the inner parts of the grid.
     */
    private fun processLines(numbers: List<Int>, filter: (Int, List<Int>) -> Boolean = { _, _ -> true }): List<Int> {
        val blocks = mutableListOf<List<Int>>()
        var currentBlock = mutableListOf<Int>()

        for (i in numbers.indices) {
            //Add the current number to the current block
            currentBlock.add(numbers[i])

            //Is the next number not a continuation of the current block?
            if (i == numbers.lastIndex || numbers[i] + LINES_MAX_STEP_BETWEEN < numbers[i + 1]) {
                blocks.add(currentBlock)
                currentBlock = mutableListOf()
            }
        }

        //Make the blocks narrower and then return the number before and after the block
        return blocks.asSequence().filter { it.size > LINES_MIN_WIDTH_TO_KEEP_FIRST }.map {
            val removable = ((it.size - LINES_REDUCED_MIN_WIDTH) / 2).coerceAtLeast(0)
            it.drop(removable).dropLast(removable)
        }.filterIndexed(filter).map { listOf(it.first() - 1, it.last() + 1) }.flatten().toList()
    }


    /**
     *   Processes a tile and returns the number on it.
     */
    private fun processTile(tile: Mat, index: Int): String {
        //Cut every tile into half vertically
        val lowerHalfFrom = findLines(tile, horizontal = true).dropWhile { it < tile.height() / 4 }.take(2).let {
            if (it.size >= 2) it[1] else tile.height() / 2
        }
        val lowerHalf = Mat(tile, Rect(0, lowerHalfFrom, tile.width(), tile.height() - lowerHalfFrom))

        //Cut lowerHalf into half horizontally
        val (numberLeftUntil, numberRightFrom) = findLines(lowerHalf, horizontal = false).dropWhile { it < lowerHalf.width() / 4 }.take(2).let {
            if (it.size >= 2) it[0] to it[1] else lowerHalf.width() / 2 to lowerHalf.width() / 2
        }
        val numberLeft = Mat(lowerHalf, Rect(0, 0, numberLeftUntil, lowerHalf.height()))
        val numberRight = Mat(lowerHalf, Rect(numberRightFrom, 0, lowerHalf.width() - numberRightFrom, lowerHalf.height()))

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

            ML.predict(shiftedFloatLeft).toString()
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

            ML.predict(shiftedFloatRight).toString()
        } else {
            ""
        }

        return left + right
    }

    /**
     *   Processes the image to be used as input for the neural network.
     */
    private fun processImage(image: Mat): Mat {
        //Invert black and white
        Core.subtract(Mat(image.size(), CvType.CV_8U, Scalar(255.0)), image, image)

        //Remove the white space
        val borderlessImage = removeEmptyRowsAndColumns(image)

        //Find its longest dimension
        val height = borderlessImage.height()
        val width = borderlessImage.width()
        val maxDim = maxOf(height, width)

        //If the image is empty, return a 28x28 black image
        if (width == 0 && height == 0) {
            return Mat(28, 28, CvType.CV_8U, Scalar(0.0))
        }

        //Calculate the amount of padding needed
        val top = (maxDim - height) / 2
        val bottom = maxDim - height - top
        val left = (maxDim - width) / 2
        val right = maxDim - width - left

        //Make the image square
        val squareImage = Mat()
        Core.copyMakeBorder(borderlessImage, squareImage, top, bottom, left, right, Core.BORDER_CONSTANT, Scalar(0.0))

        //Rescale the image to 20x20
        val rescaledImage = Mat()
        Imgproc.resize(squareImage, rescaledImage, Size(20.0, 20.0))

        //Apply dilation
        val dilatedImage = Mat()
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(2.0, 2.0))
        Imgproc.dilate(rescaledImage, dilatedImage, kernel)

        //Pad the image to size 28x28
        val paddedImage = Mat()
        Core.copyMakeBorder(dilatedImage, paddedImage, 4, 4, 4, 4, Core.BORDER_CONSTANT, Scalar(0.0, 0.0, 0.0))

        //Remove noise
        Core.inRange(paddedImage, Scalar(NOISE_LIMIT), Scalar(255.0), paddedImage)

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
        val sum = Core.sumElems(image).`val`[0]
        val centerY: Double
        val centerX: Double
        if (sum == 0.0) {
            centerY = 0.0
            centerX = 0.0
        } else {
            val moments = Imgproc.moments(image, true)
            centerX = moments.m10 / moments.m00
            centerY = moments.m01 / moments.m00
        }

        //Shape
        val height = image.rows()
        val width = image.cols()

        //Find the shift needed
        val shiftX = Math.round(width / 2.0 - centerX).toInt()
        val shiftY = Math.round(height / 2.0 - centerY).toInt()

        //Transformation matrix
        val m = Mat(2, 3, CvType.CV_32F)
        m.put(0, 0, 1.0)
        m.put(0, 1, 0.0)
        m.put(0, 2, shiftX.toDouble())
        m.put(1, 0, 0.0)
        m.put(1, 1, 1.0)
        m.put(1, 2, shiftY.toDouble())

        //Shift the image
        val shiftedImage = Mat()
        Imgproc.warpAffine(image, shiftedImage, m, Size(width.toDouble(), height.toDouble()))

        return shiftedImage
    }

    /**
     *   Converts the image to a float array to be used as input for the neural network.
     */
    private fun matToFloatArray(image: Mat): FloatArray {
        val floatMat = Mat()
        image.convertTo(floatMat, CvType.CV_32F)
        val size = floatMat.rows() * floatMat.cols() * floatMat.channels()
        val floatArray = FloatArray(size)
        floatMat.get(0, 0, floatArray)
        return floatArray.map { it * 255 }.toFloatArray()
    }

}
