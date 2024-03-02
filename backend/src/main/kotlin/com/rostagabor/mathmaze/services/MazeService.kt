package com.rostagabor.mathmaze.services

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.core.Generator
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.utils.*
import org.springframework.stereotype.Service
import kotlin.math.min

/**
 *   Handles maze related operations.
 */
@Service
class MazeService {

    /**
     *   Generates a maze.
     */
    @Throws(Exception::class)
    fun generateMaze(
        width: Int,
        height: Int,
        numbersRangeStart: Int,
        numbersRangeEnd: Int,
        operation: OperationType,
        pathTypeEven: Boolean,
        minLength: Int,
        maxLength: Int,
    ): JsonObject {
        //Validate the dimensions of the maze
        validateMazeDimensions(width, height).let { if (!it) throw InvalidMazeDimensionException() }

        //Validate the length range
        if (minLength > maxLength || minLength < min(height, width) || maxLength > width * height) throw InvalidPathRangeException()
        val lengthRange = (minLength + 2)..(maxLength + 2)

        //Validate the numbers range
        validateNumbersRange(numbersRangeStart, numbersRangeEnd, operation).let { if (!it) throw InvalidNumbersRangeException() }
        val numbersRange = numbersRangeStart..numbersRangeEnd

        //Generate the maze and the endpoint maximum 10 times to find a path that is in the range
        var maxRepeat = 10
        var booleanMaze: Array<BooleanArray>
        var endpoint: com.rostagabor.mathmaze.data.Point
        var pathLength: Int
        do {
            val result = Generator.generateMazeAndEndpoint(width, height, lengthRange)
            booleanMaze = result.first
            endpoint = result.second
            pathLength = result.third + 1
            maxRepeat--
        } while (pathLength !in lengthRange && maxRepeat > 0)

        //Find the actual path
        val path = Generator.findPath(booleanMaze, endpoint)
        if (path.isEmpty()) throw Exception()

        //Populate the maze with numbers and operations
        val maze = Generator.populateMazeWithNumbersAndOperations(booleanMaze, path, numbersRange, operation, pathTypeEven, endpoint)

        //Return the maze
        return JsonObject().apply {
            this["height"] = height
            this["width"] = width
            this["start"] = listOf(0, 0)
            this["end"] = endpoint.toList()
            this["data"] = maze
            this["path"] = path
        }
    }

}
