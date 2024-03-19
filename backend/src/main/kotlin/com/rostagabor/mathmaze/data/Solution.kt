package com.rostagabor.mathmaze.data

import com.beust.klaxon.JsonObject
import jakarta.persistence.*
import java.time.Instant

/**
 *   Data class representing a solution in the database.
 */
@Entity
@Table(
    name = "solutions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["for_maze", "nickname"])],
)
data class Solution @JvmOverloads constructor(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "solution_id")
    val solutionId: Long = 0,

    @ManyToOne
    @JoinColumn(name = "for_maze", nullable = false)
    val maze: Maze = Maze(),

    @Column(name = "nickname", nullable = false)
    val nickname: String = "",

    @Column(name = "data", nullable = false, length = 25000)
    val data: String = "",

    @Column(name = "path", nullable = false, length = 25000)
    val path: String = "",

    @Column(name = "solved_at", nullable = false)
    val solvedAt: Instant = Instant.now(),
) {

    /**
     *   Properly formatted data.
     */
    private val sendableData: List<List<String>>
        get() = data.split(";").windowed(maze.width, maze.width)

    /**
     *   Properly formatted path.
     */
    private val sendablePath: List<Point>
        get() = path.split(";").map { it.split(",").let { (x, y) -> Point(x.toInt(), y.toInt()) } }


    /**
     *   Processes the solution compared to the actual solution.
     */
    private fun processResults(userType: UserType?): Pair<List<List<JsonObject>>, JsonObject> {
        val mazeData = maze.sendableData
        val mazePath = maze.sendablePath
        val userPath = sendablePath

        var correct = 0
        var incorrect = 0
        var correctPath = 0 //The user marked a tile as part of the path, and it is
        var wrongPath = 0 //The user marked a tile as part of the path, but it is not
        var missedPath = 0 //The user did not mark a tile as part of the path, but it is

        //Construct the result
        val data: List<List<JsonObject>> = sendableData.mapIndexed { y, row ->
            row.mapIndexed { x, result ->
                val numberResult = result.toIntOrNull()
                val p = Point(x, y)

                //Check path
                val isUserPath = userPath.contains(p)
                val isMazePath = mazePath.contains(p)
                if (isUserPath && !isMazePath) {
                    wrongPath++
                } else if (!isUserPath && isMazePath) {
                    missedPath++
                } else if (isUserPath && isMazePath && p != Point.START && p != maze.endPoint) {
                    correctPath++
                }

                //Did the user evaluate this tile? Or is it the start or the end?
                if (p == Point.START || p == maze.endPoint) {
                    //Save an empty tile
                    JsonObject()
                } else if (numberResult == null) {
                    //Save the tile
                    JsonObject().apply {
                        this["isUserPath"] = userPath.contains(p)
                        this["isMazePath"] = mazePath.contains(p)
                    }
                } else {
                    //Calculate the expected result for the tile
                    val (leftNumber, operation, rightNumber) = mazeData[y][x].split(" ")
                    val expectedResult = when (operation) {
                        "+" -> leftNumber.toInt() + rightNumber.toInt()
                        "-" -> leftNumber.toInt() - rightNumber.toInt()
                        "*" -> leftNumber.toInt() * rightNumber.toInt()
                        "/" -> leftNumber.toInt() / rightNumber.toInt()
                        else -> throw IllegalArgumentException("Invalid operation type: $operation")
                    }

                    //Check if the user's result is correct
                    if (expectedResult == numberResult) {
                        correct++
                    } else {
                        incorrect++
                    }

                    //Save the tile
                    JsonObject().apply {
                        this["operation"] = mazeData[y][x]
                        this["result"] = numberResult
                        this["expectedResult"] = expectedResult
                        this["isUserPath"] = userPath.contains(p)
                        this["isMazePath"] = mazePath.contains(p)
                    }
                }
            }
        }

        //Info
        val info = JsonObject().apply {
            this["correct"] = correct
            this["incorrect"] = incorrect
            this["correctPath"] = correctPath
            this["wrongPath"] = wrongPath
            this["missedPath"] = missedPath
            this["solutionId"] = solutionId
            this["mazeId"] = maze.mazeId
            this["nickname"] = nickname

            if (userType != null) {
                this["userType"] = userType.name
            } else {
                this["solvedAt"] = solvedAt.toEpochMilli()
            }
        }

        return data to info
    }

    /**
     *   Creates the JSON representation of the solution compared to the actual solution.
     */
    fun createResultsObject(userType: UserType? = null): JsonObject {
        val (data, info) = processResults(userType)

        return JsonObject().apply {
            this["info"] = info
            this["data"] = data
            this["width"] = maze.width
            this["height"] = maze.height
            this["start"] = Point.START.toList()
            this["end"] = maze.endPoint.toList()
        }
    }

    /**
     *   Gets the incorrect results.
     */
    fun getIncorrectResults(): List<MustIncludeTile> {
        val (data, _) = processResults(null)

        return data.flatMap { row ->
            //Filter the incorrect results
            row.filter { it["result"] != it["expectedResult"] }.map {
                val operation = it["operation"] as String
                val numbers = operation.split(" ").let { l -> listOf(l[0].toInt(), l[2].toInt()) }
                val expectedResult = it["expectedResult"] as Int
                val operationType = OperationType.from(operation)

                MustIncludeTile(numbers[0], numbers[1], expectedResult, operationType, operation)
            }
        }
    }

}
