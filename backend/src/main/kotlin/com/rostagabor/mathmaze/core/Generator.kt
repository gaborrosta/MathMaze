package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Point
import java.util.*
import kotlin.math.max
import kotlin.math.min

/**
 *   Algorithms for generating a maze.
 */
object Generator {

    /**
     *   Enum for the directions.
     */
    private enum class Direction {
        UP, DOWN, LEFT, RIGHT,
    }

    /**
     *   Generates a boolean maze.
     */
    private fun generateMaze(maze: Array<BooleanArray>, x: Int, y: Int, lengths: HashMap<Point, Pair<Point, Int>>) {
        //Mark the current cell as path
        maze[y][x] = true

        //Shuffle the directions
        val ways = Direction.entries.shuffled()

        //Try to move in each direction
        for (way in ways) {
            when (way) {
                Direction.UP -> if (y >= 2 && !maze[y - 2][x]) {
                    maze[y - 1][x] = true
                    lengths[Point(x, y - 1)] = Point(x, y) to (lengths[Point(x, y)]!!.second + 1)
                    lengths[Point(x, y - 2)] = Point(x, y - 1) to (lengths[Point(x, y - 1)]!!.second + 1)
                    generateMaze(maze, x, y - 2, lengths)
                }

                Direction.DOWN -> if (y < maze.size - 2 && !maze[y + 2][x]) {
                    maze[y + 1][x] = true
                    lengths[Point(x, y + 1)] = Point(x, y) to (lengths[Point(x, y)]!!.second + 1)
                    lengths[Point(x, y + 2)] = Point(x, y + 1) to (lengths[Point(x, y + 1)]!!.second + 1)
                    generateMaze(maze, x, y + 2, lengths)
                }

                Direction.LEFT -> if (x >= 2 && !maze[y][x - 2]) {
                    maze[y][x - 1] = true
                    lengths[Point(x - 1, y)] = Point(x, y) to (lengths[Point(x, y)]!!.second + 1)
                    lengths[Point(x - 2, y)] = Point(x - 1, y) to (lengths[Point(x - 1, y)]!!.second + 1)
                    generateMaze(maze, x - 2, y, lengths)
                }

                Direction.RIGHT -> if (x < maze[0].size - 2 && !maze[y][x + 2]) {
                    maze[y][x + 1] = true
                    lengths[Point(x + 1, y)] = Point(x, y) to (lengths[Point(x, y)]!!.second + 1)
                    lengths[Point(x + 2, y)] = Point(x + 1, y) to (lengths[Point(x + 1, y)]!!.second + 1)
                    generateMaze(maze, x + 2, y, lengths)
                }
            }
        }
    }


    /**
     *   Generates a maze and find an endpoint for it.
     */
    @Throws(Exception::class)
    fun generateMazeAndEndpoint(width: Int, height: Int, lengthRange: IntRange): Triple<Array<BooleanArray>, Point, List<Point>> {
        //Create the maze and the lengths of the possible paths
        val maze = Array(height) { BooleanArray(width) { false } }
        val lengths = hashMapOf(Point.START to Pair(Point.NOWHERE, 1))

        //Generate the maze
        generateMaze(maze, 0, 0, lengths)

        //Original end point and its length from the start
        val originalEndPoint = Point(width - 1, height - 1)
        val (_, originalLength) = lengths[originalEndPoint] ?: throw Exception()

        //If the original length is not in the range, find a new border point that is in the range
        val endPoint = if (originalLength !in lengthRange) {
            lengths.entries.filter { it.value.second in lengthRange && it.key.atBorder(width, height) }
                .minByOrNull { it.value.second }?.key ?: originalEndPoint
        } else {
            originalEndPoint
        }

        //Return the maze, the end point and the path
        return lengths[endPoint]?.let { _ ->
            val path = arrayListOf(endPoint)
            var current = endPoint
            while (current != Point.START) {
                path.add(lengths[current]!!.first)
                current = lengths[current]!!.first
            }
            Triple(maze, endPoint, path.reversed())
        } ?: throw Exception()
    }


    /**
     *   Populates the maze with numbers and operations.
     */
    fun populateMazeWithNumbersAndOperations(
        maze: Array<BooleanArray>,
        path: List<Point>,
        numbersRange: IntRange,
        operation: OperationType,
        pathTypeEven: Boolean,
        endpoint: Point,
    ): List<List<String>> {
        //Maze size
        val width = maze[0].size
        val height = maze.size

        //Generate a list of type of operations for the path
        val pathLength = path.size - 2
        val pathOperations = generateOperationList(pathLength, operation)

        //Generate a list of type of operations for the maze
        val mazeLength = height * width - pathLength - 2
        val mazeOperations = generateOperationList(mazeLength, operation)

        //Neighbours so operations are not repeated next to each other
        val neighbours = Array(height) { Array<Triple<Int, Int, Int>?>(width) { null } }

        //Generate the possible values for the products
        val possibleValues = numbersRange.flatMap { a -> numbersRange.map { b -> Triple(a, b, a * b) } }

        //Populate the maze with numbers and operations
        return maze.mapIndexed { y, row ->
            row.mapIndexed { x, _ ->
                val p = Point(x, y)
                if (p == Point.START || p == endpoint) {
                    "" //Empty string for the start and end points
                } else {
                    //Is the current cell a path?
                    val isPartOfPath = p in path

                    //Get the next operation
                    val isFirstTypeOfOperation = (if (isPartOfPath) pathOperations else mazeOperations).next()

                    //Generate the operation
                    val (new, savable) = if (operation.involvesProduct) {
                        generateProductOperation(
                            multiplication = isFirstTypeOfOperation,
                            possibleValues = possibleValues,
                            pathTypeEven = pathTypeEven,
                            isPartOfPath = isPartOfPath,
                            neighbours = p.neighboursInRange(width, height).map { (x, y) -> neighbours[y][x] },
                        )
                    } else {
                        generateSumOperation(
                            addition = isFirstTypeOfOperation,
                            numbersRange = numbersRange,
                            pathTypeEven = pathTypeEven,
                            isPartOfPath = isPartOfPath,
                            neighbours = p.neighboursInRange(width, height).map { (x, y) -> neighbours[y][x] },
                        )
                    }

                    //Save the operation to the neighbours array
                    neighbours[y][x] = savable

                    //Return the operation
                    new
                }
            }
        }
    }

    /**
     *   Generates a list of type of operations.
     */
    private fun generateOperationList(length: Int, operation: OperationType): Iterator<Boolean> {
        val secondOperationCount = if (operation.isMixed) length / 2 else if (!operation.firsOperation) length else 0
        return (List(length - secondOperationCount) { true } + List(secondOperationCount) { false }).shuffled().iterator()
    }

    /**
     *   Generates a product operation (multiplication or division).
     */
    private fun generateProductOperation(
        multiplication: Boolean,
        possibleValues: List<Triple<Int, Int, Int>>,
        pathTypeEven: Boolean,
        isPartOfPath: Boolean,
        neighbours: List<Triple<Int, Int, Int>?>,
    ): Pair<String, Triple<Int, Int, Int>> {
        //Should be the answer even or odd?
        val even = (pathTypeEven && isPartOfPath) || (!pathTypeEven && !isPartOfPath)

        //Select a value randomly
        val selected = if (even) {
            if (multiplication) {
                possibleValues.filter { it.third % 2 == 0 && it !in neighbours }.random()
            } else {
                possibleValues.filter { it.second % 2 == 0 && it !in neighbours }.random()
            }
        } else {
            if (multiplication) {
                possibleValues.filter { it.third % 2 != 0 && it !in neighbours }.random()
            } else {
                possibleValues.filter { it.second % 2 != 0 && it !in neighbours }.random()
            }
        }

        //Return the operation
        return if (multiplication) {
            "${selected.first} * ${selected.second}" to selected
        } else {
            "${selected.third} / ${selected.first}" to selected
        }
    }

    /**
     *   Generates a sum operation (addition or subtraction).
     */
    private fun generateSumOperation(
        addition: Boolean,
        numbersRange: IntRange,
        pathTypeEven: Boolean,
        isPartOfPath: Boolean,
        neighbours: List<Triple<Int, Int, Int>?>,
    ): Pair<String, Triple<Int, Int, Int>> {
        //Should the answer be even or odd?
        val remainder = if ((pathTypeEven && isPartOfPath) || (!pathTypeEven && !isPartOfPath)) 0 else 1

        //Generate two random numbers within the numbersRange
        var firstNumber: Int
        var secondNumber: Int
        do {
            firstNumber = numbersRange.random()
            secondNumber = numbersRange.random()
        } while (
            (firstNumber + secondNumber) % 2 != remainder
            || firstNumber + secondNumber !in numbersRange
            || Triple(firstNumber, secondNumber, firstNumber + secondNumber) in neighbours
            || Triple(secondNumber, firstNumber, firstNumber + secondNumber) in neighbours
            || Triple(firstNumber, secondNumber, firstNumber - secondNumber) in neighbours
            || Triple(secondNumber, firstNumber, secondNumber - firstNumber) in neighbours
            || (firstNumber == secondNumber && !addition)
        )

        //Return the operation
        return if (addition) {
            "$firstNumber + $secondNumber" to Triple(firstNumber, secondNumber, firstNumber + secondNumber)
        } else {
            val max = max(firstNumber, secondNumber)
            val min = min(firstNumber, secondNumber)
            "$max - $min" to Triple(max, min, max - min)
        }
    }

}
