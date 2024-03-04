package com.rostagabor.mathmaze.services

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.core.Generator
import com.rostagabor.mathmaze.data.Maze
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Point
import com.rostagabor.mathmaze.repositories.MazeRepository
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.utils.*
import org.springframework.stereotype.Service
import java.time.Instant
import kotlin.math.min

/**
 *   Handles maze related operations.
 */
@Service
class MazeService(
    private val userRepository: UserRepository,
    private val mazeRepository: MazeRepository,
) {

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
        discardedMazes: List<Long>,
    ): JsonObject {
        //Validate the dimensions of the maze
        validateMazeDimensions(width, height).let { if (!it) throw InvalidMazeDimensionException() }

        //Validate the length range
        if (minLength > maxLength || minLength < min(height, width) || maxLength > width * height) throw InvalidPathRangeException()
        val lengthRange = (minLength + 2)..(maxLength + 2)

        //Validate the numbers range
        validateNumbersRange(numbersRangeStart, numbersRangeEnd, operation).let { if (!it) throw InvalidNumbersRangeException() }
        val numbersRange = numbersRangeStart..numbersRangeEnd

        //Admin user
        val adminUser = userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) ?: throw Exception()

        //Check if there is a maze in the database with the same parameters
        val foundMaze = mazeRepository.findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved(
            width = width,
            height = height,
            numbersRangeStart = numbersRangeStart,
            numbersRangeEnd = numbersRangeEnd,
            operation = operation,
            pathTypeEven = pathTypeEven,
        ).firstOrNull {
            it.generatedBy == adminUser
                    && it.mazeId !in discardedMazes
                    && it.pathLength in lengthRange
        }

        //If there is a maze with the same parameters, return it
        if (foundMaze != null) {
            return foundMaze.jsonObject
        }

        //Generate the maze and the endpoint maximum 10 times to find a path that is in the range
        var maxRepeat = 10
        var booleanMaze: Array<BooleanArray>
        var endpoint: Point
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

        //Save the maze
        val savedMaze = mazeRepository.save(
            Maze(
                generatedBy = adminUser,
                location = "/",
                description = "",
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                path = path.joinToString(";") { (x, y) -> "$x,$y" },
                data = maze.flatten().joinToString(";")
            )
        )

        //Return the maze
        return savedMaze.jsonObject
    }

    /**
     *   Saves a maze.
     */
    @Throws(Exception::class)
    fun saveMaze(email: String, mazeId: Long): JsonObject {
        //Find the user or the admin
        val user = userRepository.findByEmail(email) ?: userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) ?: throw Exception()

        //Find the maze
        val maze = mazeRepository.findById(mazeId).get()

        //Save the maze
        mazeRepository.save(maze.copy(generatedBy = user, saved = true, createdAt = Instant.now()))

        //Return the maze
        return maze.jsonObject
    }

}
