package com.rostagabor.mathmaze.services

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.core.Generator
import com.rostagabor.mathmaze.core.Recogniser
import com.rostagabor.mathmaze.data.*
import com.rostagabor.mathmaze.repositories.MazeRepository
import com.rostagabor.mathmaze.repositories.SolutionRepository
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.utils.*
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.time.Instant
import kotlin.jvm.optionals.getOrNull
import kotlin.math.min

/**
 *   Handles maze related operations.
 */
@Service
class MazeService(
    private val userRepository: UserRepository,
    private val mazeRepository: MazeRepository,
    private val solutionRepository: SolutionRepository,
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
        var path: List<Point>
        do {
            val result = Generator.generateMazeAndEndpoint(width, height, lengthRange)
            booleanMaze = result.first
            endpoint = result.second
            path = result.third
            maxRepeat--
        } while (path.size !in lengthRange && maxRepeat > 0)

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
                data = maze.flatten().joinToString(";"),
                path = path.joinToString(";") { (x, y) -> "$x,$y" },
            )
        )

        //Return the maze
        return savedMaze.jsonObject
    }


    /**
     *   Saves a maze.
     */
    @Throws(Exception::class)
    fun saveMaze(email: String, mazeId: Long): Pair<JsonObject, List<String>> {
        //Find the user or the admin
        val user = userRepository.findByEmail(email) ?: userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) ?: throw Exception()

        //Find the maze
        val maze = mazeRepository.findById(mazeId).get()

        //Save the maze
        mazeRepository.save(maze.copy(generatedBy = user, saved = true, createdAt = Instant.now()))

        //Find the mazes
        val locations = if (email.isNotEmpty()) {
            val mazes = mazeRepository.findByGeneratedByAndSaved(user)
            mazes.mapTo(HashSet()) { it.location }.toList()
        } else {
            listOf()
        }

        //Return the maze
        return maze.jsonObject to locations
    }


    /**
     *   Updates a maze.
     */
    @Throws(Exception::class)
    fun updateMaze(email: String, mazeId: Long, description: String, location: String): JsonObject {
        //Find the user or the admin
        val user = userRepository.findByEmail(email) ?: throw UserNotFoundException()

        //Find the maze
        val maze = mazeRepository.findById(mazeId).getOrNull() ?: throw InvalidMazeIdException()

        //Check if the maze was generated by the user
        if (maze.generatedBy != user) throw MazeOwnerException()

        //Save the maze
        mazeRepository.save(maze.copy(description = description, location = location))

        //Return the maze
        return maze.displayableDataObject
    }


    /**
     *   Recognises a maze in an image.
     */
    @Throws(Exception::class)
    fun recogniseMaze(mazeId: Long, image: MultipartFile, rotation: Int): JsonObject {
        //Validate the rotation
        if (rotation % 90 != 0) throw InvalidRotationException()

        //Find the maze
        val maze = mazeRepository.findById(mazeId).getOrNull() ?: throw InvalidMazeIdException()

        //Recognise the maze
        val (recognisedNumbers, recognisedPath) = Recogniser.recogniseMaze(
            uploadedFile = image,
            rotation = rotation,
            widthInTiles = maze.width,
            heightInTiles = maze.height,
            endPoint = maze.endPoint,
            numberOfDigits = maze.numberOfDigits,
        )

        //Return the maze
        return maze.basicJsonObject.apply {
            this["data"] = recognisedNumbers
            this["path"] = recognisedPath
        }
    }


    /**
     *   Checks a maze.
     */
    @Throws(Exception::class)
    fun checkMaze(mazeId: Long, data: List<List<String>>, path: List<Point>, nickname: String, email: String): JsonObject {
        //Validate the nickname
        validateNickname(nickname).let { if (!it) throw NicknameInvalidFormatException() }

        //Find the maze
        val maze = mazeRepository.findById(mazeId).getOrNull() ?: throw InvalidMazeIdException()

        //Check if the nickname is unique at this maze
        solutionRepository.existsByMazeAndNickname(maze, nickname).let { if (it) throw NicknameNotUniqueException() }

        //Validate the path
        if (Point.START !in path || maze.endPoint !in path) throw InvalidPathException()

        //Validate the data
        if (data.size != maze.height || data.any { it.size != maze.width }) throw InvalidMazeDimensionException()

        //Save the solution
        val solution = solutionRepository.save(
            Solution(
                maze = maze,
                nickname = nickname,
                data = data.flatten().joinToString(";"),
                path = path.joinToString(";") { (x, y) -> "$x,$y" },
            )
        )

        //Who generated the maze?
        val generatedBy = maze.generatedBy
        val userType = when (generatedBy.email) {
            ADMIN_EMAIL_ADDRESS -> UserType.ADMIN
            email -> UserType.ME
            else -> UserType.SOMEONE
        }

        //Return the result
        return solution.createResultsObject(userType)
    }


    /**
     *   Retrieves all mazes generated by the user.
     */
    @Throws(Exception::class)
    fun getAllMazes(email: String): Pair<List<JsonObject>, List<String>> {
        //Find the user or the admin
        val user = userRepository.findByEmail(email) ?: throw Exception()

        //Find the mazes
        val mazes = mazeRepository.findByGeneratedByAndSaved(user)

        //Return the mazes
        return mazes.map { it.displayableDataObject } to mazes.mapTo(HashSet()) { it.location }.toList()
    }

}
