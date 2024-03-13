package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.Point
import org.opencv.core.*
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import org.springframework.web.multipart.MultipartFile

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
        //Stores the recognised numbers and a boolean indicating if the tile is part of the path
        val recognisedNumbers = arrayListOf<String>()
        val path = arrayListOf<Point>()

        //We try different configurations
        var shouldTryAgain: Boolean
        val configIterator = RecogniserConfiguration.configs.iterator()

        do {
            //Get the next configuration
            val config = configIterator.next()
            println("Trying to recognise a maze with the following configuration: $config")

            //We should not try again unless an exception occurs
            shouldTryAgain = false

            //Create variables to be able to release them
            var image: Mat? = null
            var tiles = listOf<Mat>()

            //Try while handling exceptions
            try {
                //Open the image in grayscale
                image = openImage(uploadedFile, rotation, config.brightness)

                //Find the maze in the image and rotate the image based on the maze
                var contour = findLargestContour(image)
                image = rotateBasedOnContour(image, contour)
                contour.release()

                //Cut out the maze from the image
                contour = findLargestContour(image)
                image = cutoutContour(image, contour)
                contour.release()

                //Cut the maze into tiles
                tiles = cutMazeToTiles(image, config)
                if (tiles.size != widthInTiles * heightInTiles) {
                    throw RuntimeException("The number of tiles is not correct: ${tiles.size} instead of ${widthInTiles * heightInTiles}")
                }

                //Process the tiles
                for (i in tiles.indices) {
                    val p = Point(i % widthInTiles, i / widthInTiles)

                    //Start and end tiles...
                    if (i == 0 || p == endPoint) {
                        recognisedNumbers.add("")
                        path.add(p)
                        continue
                    }

                    //Process the tile
                    val (number, isMarkedAsPath) = processTile(tiles[i], config, numberOfDigits)
                    tiles[i].release()

                    //Save the data
                    recognisedNumbers.add(number)
                    if (isMarkedAsPath) {
                        path.add(p)
                    }
                }
            } catch (e: Exception) {
                //Print the exception
                println("An exception occurred: ${e.message}")

                //If an exception occurred, we should try again with the next configuration
                shouldTryAgain = true

                //Clear the variables
                recognisedNumbers.clear()
                path.clear()
            } finally {
                image?.release()
                tiles.forEach { it.release() }
            }
        } while (shouldTryAgain && configIterator.hasNext())

        //OpenCV is not releasing the memory...
        System.gc()

        //Return the result
        return recognisedNumbers.windowed(size = widthInTiles, step = widthInTiles) to path
    }


    /**
     *   Opens an image in grayscale and rotates it as specified by the user.
     */
    @Throws(RuntimeException::class)
    private fun openImage(uploadedFile: MultipartFile, rotation: Int, brightness: Double): Mat {
        //Convert MultipartFile to Mat object
        val matOfByte = MatOfByte(*uploadedFile.bytes)
        val image = Imgcodecs.imdecode(matOfByte, Imgcodecs.IMREAD_UNCHANGED)
        matOfByte.release()

        //Check if the image is empty
        if (image.empty()) {
            throw RuntimeException("Failed to open image: ${uploadedFile.originalFilename}")
        }

        //Convert the image to grayscale
        if (image.channels() > 1) {
            Imgproc.cvtColor(image, image, Imgproc.COLOR_BGR2GRAY)
        }

        //Increase brightness
        Core.convertScaleAbs(image, image, 1.0, brightness)

        //Rotate if needed
        return if (rotation != 0) {
            val rotateCode = when (rotation) {
                90 -> Core.ROTATE_90_CLOCKWISE
                180 -> Core.ROTATE_180
                270 -> Core.ROTATE_90_COUNTERCLOCKWISE
                else -> throw RuntimeException("Invalid rotation value: $rotation")
            }
            Core.rotate(image, image, rotateCode)
            image
        } else {
            image
        }
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
        contours.forEach { it.release() }

        //Morph open
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(9.0, 9.0))
        val opening = Mat()
        Imgproc.morphologyEx(thresh, opening, Imgproc.MORPH_OPEN, kernel)
        thresh.release()
        kernel.release()

        //Find contours
        val finalContours = arrayListOf<MatOfPoint>()
        Imgproc.findContours(opening, finalContours, Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE)
        opening.release()

        //Find the biggest rectangle contour
        val max = finalContours.maxByOrNull { Imgproc.contourArea(it) } ?: MatOfPoint()
        finalContours.forEach { if (it != max) it.release() }

        return max
    }


    /**
     *   Rotates the image based on the contour.
     */
    @Throws(RuntimeException::class)
    private fun rotateBasedOnContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            throw RuntimeException("Contour is empty for rotation")
        }

        //Get the rotated rectangle of the contour
        val rotatedRect = Imgproc.minAreaRect(MatOfPoint2f(*contour.toArray()))

        //Get the angle
        val angle = if (rotatedRect.angle > 45) rotatedRect.angle - 90 else rotatedRect.angle

        //Get the rotation matrix
        val rotationMatrix = Imgproc.getRotationMatrix2D(rotatedRect.center, angle, 1.0)

        //Apply the rotation to the entire image
        Imgproc.warpAffine(image, image, rotationMatrix, image.size())
        rotationMatrix.release()

        return image
    }


    /**
     *   Cuts out the contour from the image.
     */
    @Throws(RuntimeException::class)
    private fun cutoutContour(image: Mat, contour: MatOfPoint): Mat {
        //If contour is empty, return
        if (contour.empty()) {
            throw RuntimeException("Contour is empty for cutting it out")
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
    private fun cutMazeToTiles(maze: Mat, config: RecogniserConfiguration): List<Mat> {
        //Get the rows
        val rows = findLines(maze, config, horizontal = true) { index, _ -> index % 2 == 0 }

        //Get the columns
        val columns = findLines(maze, config, horizontal = false)

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
    private fun findLines(
        image: Mat,
        config: RecogniserConfiguration,
        horizontal: Boolean,
        filter: (Int, List<Int>) -> Boolean = { _, _ -> true },
    ): List<Int> {
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
        blurredImage.release()

        //Find the rows/columns that are almost entirely edges
        val edgeList = mutableListOf<Int>()
        if (horizontal) {
            for (row in 0 until edges.rows()) {
                if (Core.countNonZero(edges.row(row)) > edges.cols() * config.lineFillLimit) {
                    edgeList.add(row)
                }
            }
        } else {
            for (col in 0 until edges.cols()) {
                if (Core.countNonZero(edges.col(col)) > edges.rows() * config.lineFillLimit) {
                    edgeList.add(col)
                }
            }
        }
        edges.release()

        //Return the processed indices
        return processLines(edgeList, config, filter)
    }

    /**
     *   Processes the lines of edges and returns pairs which can be used to cut out the inner parts of the grid.
     */
    private fun processLines(
        numbers: List<Int>,
        config: RecogniserConfiguration,
        filter: (Int, List<Int>) -> Boolean = { _, _ -> true }
    ): List<Int> {
        val blocks = mutableListOf<List<Int>>()
        var currentBlock = mutableListOf<Int>()

        for (i in numbers.indices) {
            //Add the current number to the current block
            currentBlock.add(numbers[i])

            //Is the next number not a continuation of the current block?
            if (i == numbers.lastIndex || numbers[i] + config.linesMaxStepBetween < numbers[i + 1]) {
                blocks.add(currentBlock)
                currentBlock = mutableListOf()
            }
        }

        //Make the blocks narrower and then return the number before and after the block
        return blocks.asSequence().filter { it.size > config.linesMinWidthToKeepFirst }.map {
            val removable = ((it.size - config.linesReducedMinWidth) / 2).coerceAtLeast(0)
            it.drop(removable).dropLast(removable)
        }.filterIndexed(filter).map { listOf(it.first() - 1, it.last() + 1) }.flatten().toList()
    }


    /**
     *   Processes a tile and returns the number on it and a boolean indicating if the tile is marked as part of the path.
     */
    @Throws(RuntimeException::class)
    private fun processTile(tile: Mat, config: RecogniserConfiguration, numberOfDigits: Int): Pair<String, Boolean> {
        //Cut every tile into half horizontally
        val (upperHalf, lowerHalf) = cutHalfByLine(tile, config, horizontal = true)

        //Cut lowerHalf into half or third vertically
        val numbers = when (numberOfDigits) {
            2 -> cutHalfByLine(lowerHalf, config, horizontal = false)
            3 -> cutThirdByLine(lowerHalf, config)
            else -> throw RuntimeException("Invalid number of digits: $numberOfDigits")
        }
        lowerHalf.release()

        //The predicted number
        var result = ""

        //Process the numbers one by one
        numbers.forEach { number ->
            //Process the image
            val processed = processImage(number, config.noiseLimit)
            number.release()

            //Drop the image if it is almost empty
            if (Core.countNonZero(processed) < 10) {
                return@forEach
            }

            //Convert the image to float array
            val shiftedFloat = matToFloatArray(processed)
            processed.release()

            //Check if the image contain a number or empty
            val isANumber = shiftedFloat.max() != 0F

            //Prediction for the image
            if (isANumber) {
                result += ML.predict(shiftedFloat).toString()
            }
        }

        //Cut out the square from the upper half indicating if the tile is part of the path
        val upperHalfWidth = upperHalf.width()
        val pathSquareWidth = (upperHalfWidth * 15 / 100)
        val pathSquareHeight = (upperHalf.height() * 30 / 100)
        val pathSquarePart = Rect(upperHalfWidth - pathSquareWidth, 0, pathSquareWidth, pathSquareHeight)
        val pathSquare = Mat(upperHalf, pathSquarePart)

        //Calculate the average intensity of the square to determine if the tile is marked as part of the path
        val isMarkedAsPath = Core.mean(pathSquare).`val`[0] < 200.0
        upperHalf.release()
        pathSquare.release()

        return result to isMarkedAsPath
    }

    /**
     *   Cuts the image into two halves based on the lines found in the image.
     */
    private fun cutHalfByLine(image: Mat, config: RecogniserConfiguration, horizontal: Boolean): List<Mat> {
        val size = if (horizontal) image.height() else image.width()
        val maxCuttingDifference = size / 10
        val halfPoint = size / 2

        //Find the lines and select that pair which is the closest to the half point
        val notFoundCutPoint = (halfPoint - (maxCuttingDifference / 2)) to (halfPoint + (maxCuttingDifference / 2))
        val (firstUntil, secondFrom) = findLines(image, config, horizontal).windowed(2).firstOrNull { (p0, p1) ->
            halfPoint in (p0 + 1)..<p1 && p1 - p0 <= maxCuttingDifference
        }?.let { it[0] to it[1] } ?: notFoundCutPoint

        //First half
        val first = if (horizontal) {
            Mat(image, Rect(0, 0, image.width(), firstUntil))
        } else {
            Mat(image, Rect(0, 0, firstUntil, image.height()))
        }

        //Second half
        val second = if (horizontal) {
            Mat(image, Rect(0, secondFrom, image.width(), size - secondFrom))
        } else {
            Mat(image, Rect(secondFrom, 0, size - secondFrom, image.height()))
        }

        return listOf(first, second)
    }

    /**
     *   Cuts the image into three parts based on the lines found in the image.
     */
    private fun cutThirdByLine(image: Mat, config: RecogniserConfiguration): List<Mat> {
        val size = image.width()
        val maxCuttingDifference = size / 10
        val thirdPoint = size / 3
        val twoThirdPoint = 2 * thirdPoint

        //Find the lines and select those pairs which are the closest to the third points
        val lines = findLines(image, config, horizontal = false)
        val notFoundFirstCutPoint = (thirdPoint - (maxCuttingDifference / 2)) to (thirdPoint + (maxCuttingDifference / 2))
        val notFoundSecondCutPoint = (twoThirdPoint - (maxCuttingDifference / 2)) to (twoThirdPoint + (maxCuttingDifference / 2))
        val (firstUntil, secondFrom) = lines.windowed(2).firstOrNull { (p0, p1) ->
            thirdPoint in (p0 + 1)..<p1 && p1 - p0 <= maxCuttingDifference
        }?.let { it[0] to it[1] } ?: notFoundFirstCutPoint
        val (secondUntil, thirdFrom) = lines.windowed(2).firstOrNull { (p0, p1) ->
            twoThirdPoint in (p0 + 1)..<p1 && p1 - p0 <= maxCuttingDifference
        }?.let { it[0] to it[1] } ?: notFoundSecondCutPoint

        //First
        val first = Mat(image, Rect(0, 0, firstUntil, image.height()))

        //Second
        val second = Mat(image, Rect(secondFrom, 0, secondUntil - secondFrom, image.height()))

        //Third
        val third = Mat(image, Rect(thirdFrom, 0, size - thirdFrom, image.height()))

        return listOf(first, second, third)
    }

    /**
     *   Processes the image to be used as input for the neural network.
     */
    private fun processImage(image: Mat, noiseLimit: Double): Mat {
        //Invert black and white
        val inverter = Mat(image.size(), CvType.CV_8U, Scalar(255.0))
        Core.subtract(inverter, image, image)
        inverter.release()

        //Remove the white space
        var borderlessImage = removeEmptyRowsAndColumns(image)

        //Find its longest dimension
        val height = borderlessImage.height()
        val width = borderlessImage.width()
        val maxDim = maxOf(height, width)

        //If the image is empty, return a 28x28 black image
        if (width == 0 && height == 0) {
            borderlessImage.release()
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
        borderlessImage.release()

        //Rescale the image to 20x20
        val rescaledImage = Mat()
        Imgproc.resize(squareImage, rescaledImage, Size(20.0, 20.0))
        squareImage.release()

        //Apply dilation
        val dilatedImage = Mat()
        val kernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, Size(2.0, 2.0))
        Imgproc.dilate(rescaledImage, dilatedImage, kernel)
        rescaledImage.release()
        kernel.release()

        //Remove noise with the help of a mask
        val mask = Mat()
        Core.inRange(dilatedImage, Scalar(noiseLimit), Scalar(255.0), mask)
        Core.bitwise_not(mask, mask)
        dilatedImage.setTo(Scalar(0.0), mask)
        mask.release()

        //Count the non-zero pixels in a borderless image
        val borderSize = 3
        borderlessImage = Mat(
            dilatedImage,
            Rect(borderSize, borderSize, dilatedImage.width() - 2 * borderSize, dilatedImage.height() - 2 * borderSize)
        )
        val nonZeroPixelsInInnerImage = Core.countNonZero(borderlessImage)
        borderlessImage.release()

        //If the image is almost empty, return a 28x28 black image (it had content because of a border)
        if (nonZeroPixelsInInnerImage < 30) {
            dilatedImage.release()
            return Mat(28, 28, CvType.CV_8U, Scalar(0.0))
        }

        //Pad the image to size 28x28
        val paddedImage = Mat()
        Core.copyMakeBorder(dilatedImage, paddedImage, 4, 4, 4, 4, Core.BORDER_CONSTANT, Scalar(0.0, 0.0, 0.0))
        dilatedImage.release()

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
        Imgproc.warpAffine(image, image, m, Size(width.toDouble(), height.toDouble()))
        m.release()

        return image
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
        floatMat.release()

        return floatArray.map { it * 255 }.toFloatArray()
    }

}
