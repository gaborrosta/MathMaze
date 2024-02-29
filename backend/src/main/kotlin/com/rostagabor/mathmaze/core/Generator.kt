package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Point
import java.util.*

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
    private fun generateMaze(maze: Array<BooleanArray>, x: Int, y: Int, lengths: HashMap<Point, Int>) {
        //Mark the current cell as path
        maze[y][x] = true

        //Shuffle the directions
        val ways = Direction.entries.shuffled()

        //Try to move in each direction
        for (way in ways) {
            when (way) {
                Direction.UP -> if (y >= 2 && !maze[y - 2][x]) {
                    maze[y - 1][x] = true
                    lengths[Point(x, y - 2)] = lengths[Point(x, y)]!! + 2
                    generateMaze(maze, x, y - 2, lengths)
                }

                Direction.DOWN -> if (y < maze.size - 2 && !maze[y + 2][x]) {
                    maze[y + 1][x] = true
                    lengths[Point(x, y + 2)] = lengths[Point(x, y)]!! + 2
                    generateMaze(maze, x, y + 2, lengths)
                }

                Direction.LEFT -> if (x >= 2 && !maze[y][x - 2]) {
                    maze[y][x - 1] = true
                    lengths[Point(x - 2, y)] = lengths[Point(x, y)]!! + 2
                    generateMaze(maze, x - 2, y, lengths)
                }

                Direction.RIGHT -> if (x < maze[0].size - 2 && !maze[y][x + 2]) {
                    maze[y][x + 1] = true
                    lengths[Point(x + 2, y)] = lengths[Point(x, y)]!! + 2
                    generateMaze(maze, x + 2, y, lengths)
                }
            }
        }
    }


    /**
     *   Generates a maze and find an endpoint for it.
     */
    @Throws(Exception::class)
    fun generateMazeAndEndpoint(width: Int, height: Int, lengthRange: IntRange): Triple<Array<BooleanArray>, Point, Int> {
        //Create the maze and the lengths of the possible paths
        val maze = Array(height) { BooleanArray(width) { false } }
        val lengths = hashMapOf(Point(0, 0) to 0)

        //Generate the maze
        generateMaze(maze, 0, 0, lengths)

        //Original end point and its length from the start
        val originalEndPoint = Point(width - 1, height - 1)
        val originalLength = lengths[originalEndPoint] ?: 0

        //If the original length is not in the range, find a new border point that is in the range
        val endPoint = if (originalLength !in lengthRange) {
            lengths.entries.filter { it.value in lengthRange && it.key.atBorder(width, height) }.minByOrNull { it.value }?.key ?: originalEndPoint
        } else {
            originalEndPoint
        }

        //Return the maze and the end point
        return lengths[endPoint]?.let { length -> Triple(maze, endPoint, length) } ?: throw Exception()
    }


    /**
     *   Finds the path in the maze.
     */
    fun findPath(maze: Array<BooleanArray>, endpoint: Point): List<Point> {
        val width = maze[0].size
        val height = maze.size
        val start = Point(0, 0)

        //Visited array and queue for the BFS
        val visited = Array(height) { BooleanArray(width) { false } }
        val queue: Queue<Pair<Point, List<Point>>> = LinkedList()

        //Add the start point to the queue
        queue.add(Pair(start, listOf(start)))
        visited[start.y][start.x] = true

        //BFS
        while (queue.isNotEmpty()) {
            //Get the current point and path
            val (currentPoint, path) = queue.remove()

            //If the current point is the end point, return the path
            if (currentPoint == endpoint) return path

            //Add the neighbours to the queue
            for (neighbor in currentPoint.neighboursInRange(width, height)) {
                if (maze[neighbor.y][neighbor.x] && !visited[neighbor.y][neighbor.x]) {
                    queue.add(Pair(neighbor, path + neighbor))
                    visited[neighbor.y][neighbor.x] = true
                }
            }
        }

        //Return an empty list if no path was found
        return emptyList()
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
        //Generate a list of type of operations for the path
        val pathLength = path.size - 2
        val pathOperations = generateOperationList(pathLength, operation)

        //Generate a list of type of operations for the maze
        val mazeLength = maze.size * maze[0].size - pathLength - 2
        val mazeOperations = generateOperationList(mazeLength, operation)

        //Populate the maze with numbers and operations
        return if (operation.involvesProduct) {
            //Generate the possible values for the products
            val possibleValues = numbersRange.flatMap { a -> numbersRange.map { b -> Triple(a, b, a * b) } }

            //Populate the maze
            maze.mapIndexed { y, row ->
                row.mapIndexed { x, _ ->
                    if (x == 0 && y == 0 || Point(x, y) == endpoint) {
                        "" //Empty string for the start and end points
                    } else {
                        //Is the current cell a path?
                        val isPartOfPath = Point(x, y) in path

                        //Get the next operation
                        val multiplication = (if (isPartOfPath) pathOperations else mazeOperations).next()

                        //Generate the operation
                        generateProductOperation(multiplication, possibleValues, pathTypeEven, isPartOfPath)
                    }
                }
            }
        } else {
            //Populate the maze
            maze.mapIndexed { y, row ->
                row.mapIndexed { x, _ ->
                    if (x == 0 && y == 0 || Point(x, y) == endpoint) {
                        "" //Empty string for the start and end points
                    } else {
                        //Is the current cell a path?
                        val isPartOfPath = Point(x, y) in path

                        //Get the next operation
                        val addition = (if (isPartOfPath) pathOperations else mazeOperations).next()

                        //Generate the operation
                        generateSumOperation(addition, numbersRange, pathTypeEven, isPartOfPath)
                    }
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
        isPartOfPath: Boolean
    ): String {
        //Should be the answer even or odd?
        val even = (pathTypeEven && isPartOfPath) || (!pathTypeEven && !isPartOfPath)

        //Select a value randomly
        val selected = if (even) {
            if (multiplication) {
                possibleValues.filter { it.third % 2 == 0 }.random()
            } else {
                possibleValues.filter { it.second % 2 == 0 }.random()
            }
        } else {
            if (multiplication) {
                possibleValues.filter { it.third % 2 != 0 }.random()
            } else {
                possibleValues.filter { it.second % 2 != 0 }.random()
            }
        }

        //Return the operation
        return if (multiplication) {
            "${selected.first} * ${selected.second}"
        } else {
            "${selected.third} / ${selected.first}"
        }
    }

    /**
     *   Generates a sum operation (addition or subtraction).
     */
    private fun generateSumOperation(addition: Boolean, numbersRange: IntRange, pathTypeEven: Boolean, isPartOfPath: Boolean): String {
        //Should be the answer even or odd?
        val even = (pathTypeEven && isPartOfPath) || (!pathTypeEven && !isPartOfPath)

        //TODO...

        //Return the operation
        return if (even) {
            "1 + 1"
        } else {
            "1 + 2"
        }
    }

}
