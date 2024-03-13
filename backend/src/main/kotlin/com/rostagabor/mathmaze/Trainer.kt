package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.core.ML
import com.rostagabor.mathmaze.core.Recogniser
import com.rostagabor.mathmaze.data.Point
import com.rostagabor.mathmaze.utils.loadOpenCV
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStream

/**
 *   This trains the Ml model, saves it and runs the local recogniser.
 */
fun main() {
    //Load OpenCV
    loadOpenCV()

    //Train the model and save it
    ML.trainAndSave()

    //Digitally filled, thin lines
    openAndRecogniseMaze(
        name = "maze1.jpg",
        endPoint = Point(10, 10),
        numberOfDigits = 2,
        expected = ",1,,,,,,,,,,4,7,,,,,,,,,,0,1,,,,,,,,,,10,7,,,,,,,,,,4,1,,,,,,,,,,10,1,,,,,,,,,,10,9,,,4,10,4,6,6,6,10,6,9,,,2,,,,,,2,10,8,18,4,16,15,1,,,,4,,,,,,1,1,,,,14,,,,,,,,,,,",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 0, y = 1),
            Point(x = 0, y = 2),
            Point(x = 0, y = 3),
            Point(x = 0, y = 4),
            Point(x = 0, y = 5),
            Point(x = 0, y = 6),
            Point(x = 0, y = 7),
            Point(x = 0, y = 8),
            Point(x = 1, y = 8),
            Point(x = 2, y = 8),
            Point(x = 3, y = 8),
            Point(x = 4, y = 8),
            Point(x = 4, y = 7),
            Point(x = 4, y = 6),
            Point(x = 5, y = 6),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
        ),
    )

    //Digitally filled, thin lines, rotated +20 degrees
    openAndRecogniseMaze(
        name = "maze2.jpg",
        endPoint = Point(10, 10),
        numberOfDigits = 2,
        expected = ",1,,,,,,,,,,4,7,,,,,,,,,,0,1,,,,,,,,,,10,7,,,,,,,,,,4,1,,,,,,,,,,10,1,,,,,,,,,,10,9,,,4,10,4,6,6,6,10,6,9,,,2,,,,,,2,10,8,18,4,16,15,1,,,,4,,,,,,1,1,,,,14,,,,,,,,,,,",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 0, y = 1),
            Point(x = 0, y = 2),
            Point(x = 0, y = 3),
            Point(x = 0, y = 4),
            Point(x = 0, y = 5),
            Point(x = 0, y = 6),
            Point(x = 0, y = 7),
            Point(x = 0, y = 8),
            Point(x = 1, y = 8),
            Point(x = 2, y = 8),
            Point(x = 3, y = 8),
            Point(x = 4, y = 8),
            Point(x = 4, y = 7),
            Point(x = 4, y = 6),
            Point(x = 5, y = 6),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
        ),
    )

    //Digitally filled, thick lines
    openAndRecogniseMaze(
        name = "maze3.jpg",
        endPoint = Point(10, 10),
        numberOfDigits = 2,
        expected = ",1,13,7,7,7,,,,,,4,7,,,,,,,,,,0,,,,,,,,,,,10,7,3,1,1,,,,,,,4,,,,,,,,,,,10,,,,,,,,,,,10,9,,,4,10,4,6,6,6,10,6,,,,2,,,,,,2,10,8,18,4,16,,,,,,4,,,,,,,,,,,14,,,,,,,,,,,",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 0, y = 1),
            Point(x = 0, y = 2),
            Point(x = 0, y = 3),
            Point(x = 0, y = 4),
            Point(x = 0, y = 5),
            Point(x = 0, y = 6),
            Point(x = 0, y = 7),
            Point(x = 0, y = 8),
            Point(x = 1, y = 8),
            Point(x = 2, y = 8),
            Point(x = 3, y = 8),
            Point(x = 4, y = 8),
            Point(x = 4, y = 7),
            Point(x = 4, y = 6),
            Point(x = 5, y = 6),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
        ),
    )

    //Scanned, 150 dpi, low resolution
    openAndRecogniseMaze(
        name = "scan1.jpg",
        endPoint = Point(8, 10),
        numberOfDigits = 2,
        expected = ",10,4,10,8,7,9,3,5,9,9,9,5,9,7,10,9,5,8,3,9,5,7,7,9,9,4,9,7,7,9,7,9,5,9,7,9,8,7,9,7,7,7,7,7,5,9,7,10,4,10,7,9,7,7,3,9,7,5,3,7,10,7,9,5,9,7,9,3,7,5,9,8,10,6,10,8,5,9,7,3,7,9,5,3,9,9,8,3,9,5,9,5,7,9,9,9,9,6,9,7,9,9,9,7,5,7,9,7,8,7,5,9,3,9,7,3,9,,8,6",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 1, y = 0),
            Point(x = 2, y = 0),
            Point(x = 3, y = 0),
            Point(x = 4, y = 0),
            Point(x = 4, y = 1),
            Point(x = 4, y = 2),
            Point(x = 4, y = 3),
            Point(x = 4, y = 4),
            Point(x = 5, y = 4),
            Point(x = 6, y = 4),
            Point(x = 6, y = 5),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
            Point(x = 9, y = 10),
            Point(x = 8, y = 10),
        ),
    )

    //Scanned, 300 dpi, low resolution
    openAndRecogniseMaze(
        name = "scan2.jpg",
        endPoint = Point(8, 10),
        numberOfDigits = 2,
        expected = ",10,4,10,8,7,9,3,5,9,9,9,5,9,7,10,9,5,x,3,9,5,7,7,9,9,4,9,7,7,9,7,9,5,9,7,9,8,7,9,7,7,7,7,7,5,9,7,10,4,10,7,9,7,7,3,9,7,5,3,7,10,7,9,5,9,7,9,3,7,5,9,8,10,6,10,8,5,9,7,3,7,9,5,3,9,9,8,3,9,5,9,5,7,9,9,9,9,6,9,7,9,9,9,7,5,7,9,7,8,7,5,9,3,9,7,3,9,,8,6",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 1, y = 0),
            Point(x = 2, y = 0),
            Point(x = 3, y = 0),
            Point(x = 4, y = 0),
            Point(x = 4, y = 1),
            Point(x = 4, y = 2),
            Point(x = 4, y = 3),
            Point(x = 4, y = 4),
            Point(x = 5, y = 4),
            Point(x = 6, y = 4),
            Point(x = 6, y = 5),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
            Point(x = 9, y = 10),
            Point(x = 8, y = 10),
        ),
    )

    //Scanned, 300 dpi, low resolution
    openAndRecogniseMaze(
        name = "scan3.jpg",
        endPoint = Point(8, 0),
        numberOfDigits = 3,
        expected = ",323,198,270,234,192,182,256,,195,255,228,289,234,225,289,143,209,289,165,285,323,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 0, y = 1),
            Point(x = 0, y = 2),
            Point(x = 1, y = 2),
            Point(x = 2, y = 2),
            Point(x = 2, y = 1),
            Point(x = 2, y = 0),
            Point(x = 3, y = 0),
            Point(x = 4, y = 0),
            Point(x = 5, y = 0),
            Point(x = 6, y = 0),
            Point(x = 7, y = 0),
            Point(x = 8, y = 0),
        ),
    )

    //Scanned, 300 dpi, high resolution
    openAndRecogniseMaze(
        name = "scan4.jpg",
        endPoint = Point(8, 10),
        numberOfDigits = 2,
        expected = ",10,4,10,8,7,9,3,5,9,9,9,5,9,7,10,9,5,x,3,9,5,7,7,9,9,4,9,7,7,9,7,9,5,9,7,9,8,7,9,7,7,7,7,7,5,9,7,10,4,10,7,9,7,7,3,9,7,5,3,7,10,7,9,5,9,7,9,3,7,5,9,8,10,6,10,8,5,9,7,3,7,9,5,3,9,9,8,3,9,5,9,5,7,9,9,9,9,6,9,7,9,9,9,7,5,7,9,7,8,7,5,9,3,9,7,3,9,,8,6",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 1, y = 0),
            Point(x = 2, y = 0),
            Point(x = 3, y = 0),
            Point(x = 4, y = 0),
            Point(x = 4, y = 1),
            Point(x = 4, y = 2),
            Point(x = 4, y = 3),
            Point(x = 4, y = 4),
            Point(x = 5, y = 4),
            Point(x = 6, y = 4),
            Point(x = 6, y = 5),
            Point(x = 6, y = 6),
            Point(x = 7, y = 6),
            Point(x = 8, y = 6),
            Point(x = 9, y = 6),
            Point(x = 10, y = 6),
            Point(x = 10, y = 7),
            Point(x = 10, y = 8),
            Point(x = 10, y = 9),
            Point(x = 10, y = 10),
            Point(x = 9, y = 10),
            Point(x = 8, y = 10),
        ),
    )

    //Scanned, 300 dpi, high resolution
    openAndRecogniseMaze(
        name = "scan5.jpg",
        endPoint = Point(8, 0),
        numberOfDigits = 3,
        expected = ",323,198,270,234,192,182,256,,195,255,228,289,234,225,289,143,209,289,165,285,323,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
        expectedPath = listOf(
            Point(x = 0, y = 0),
            Point(x = 0, y = 1),
            Point(x = 0, y = 2),
            Point(x = 1, y = 2),
            Point(x = 2, y = 2),
            Point(x = 2, y = 1),
            Point(x = 2, y = 0),
            Point(x = 3, y = 0),
            Point(x = 4, y = 0),
            Point(x = 5, y = 0),
            Point(x = 6, y = 0),
            Point(x = 7, y = 0),
            Point(x = 8, y = 0),
        ),
    )
}


/**
 *   A custom implementation of the MultipartFile interface to be able to use a file directly.
 */
private class LocalMultipartFile(private val file: File) : MultipartFile {

    override fun getName(): String = file.name

    override fun getOriginalFilename(): String = file.name

    override fun getContentType(): String? = null

    override fun isEmpty(): Boolean = file.length() == 0L

    override fun getSize(): Long = file.length()

    override fun getBytes(): ByteArray = file.readBytes()

    @Throws(IOException::class)
    override fun getInputStream(): InputStream = FileInputStream(file)

    @Throws(IOException::class)
    override fun transferTo(dest: File) {
        file.copyTo(dest, true)
    }

}


/**
 *   Opens and recognises a maze from an image.
 */
private fun openAndRecogniseMaze(
    name: String,
    endPoint: Point,
    numberOfDigits: Int,
    expected: String,
    expectedPath: List<Point>,
) {
    //Open and recognise the maze
    val file = LocalMultipartFile(File("src/main/resources/static/$name"))
    val (numbers, path) = Recogniser.recogniseMaze(
        uploadedFile = file,
        rotation = 0,
        widthInTiles = 11,
        heightInTiles = 11,
        endPoint = endPoint,
        numberOfDigits = numberOfDigits,
    )

    //Flatten the numbers
    val result = numbers.flatten()

    //Counters
    var countDigitOk = 0
    var countNumberOk = 0
    var countNotExpectedNumber = 0
    var countNotExpectedDigit = 0
    var digitsCount = 0
    var numbersCount = 0

    //Check the results
    expected.split(",").forEachIndexed { i, expectedResult ->
        if (expectedResult == "") {
            if (result[i] != "") {
                countNotExpectedNumber++
            }
        } else {
            if (expectedResult != "x") {
                numbersCount++
                if (result[i] == expectedResult) {
                    countNumberOk++
                }

                val paddedResult = result[i].padStart(3, '-')
                expectedResult.padStart(3, '-').forEachIndexed { index, c ->
                    if (c == '-') {
                        if (paddedResult[index] != '-') {
                            countNotExpectedDigit++
                        }
                    } else {
                        digitsCount++
                        if (paddedResult[index] == c) {
                            countDigitOk++
                        }
                    }
                }
            }
        }
    }

    //Check the path
    val notExpectedPath = path.filter { !expectedPath.contains(it) }
    val expectedButNotPath = expectedPath.filter { !path.contains(it) }

    //Print the results
    println("--------------------")
    println("Image: $name")
    println("Recognised numbers: $result")
    println("Recognised path: $path")
    println("Number ok: $countNumberOk/$numbersCount ${countNumberOk / numbersCount.toFloat() * 100} %")
    println("Digit ok: $countDigitOk/$digitsCount ${countDigitOk / digitsCount.toFloat() * 100} %")
    println("Not expected number: $countNotExpectedNumber")
    println("Not expected digit: $countNotExpectedDigit")
    println("Not expected path: ${notExpectedPath.size}")
    println("Expected but not path: ${expectedButNotPath.size}")
    println("Path ok: ${notExpectedPath.isEmpty() && expectedButNotPath.isEmpty()}")
    println("--------------------")
}
