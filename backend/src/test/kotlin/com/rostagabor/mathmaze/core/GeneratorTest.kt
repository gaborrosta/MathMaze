package com.rostagabor.mathmaze.core

import com.rostagabor.mathmaze.data.MustIncludeTile
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Point
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 *   Basic tests for the Generator object.
 */
class GeneratorTest {

    @Test
    fun `generateMazeAndEndpoint generates a valid maze and endpoint`() {
        val width = 5
        val height = 5
        val lengthRange = 3..10

        repeat(10) {
            val (maze, endpoint, path) = Generator.generateMazeAndEndpoint(width, height, lengthRange)

            //Assert...
            assertEquals(height, maze.size)
            assertEquals(width, maze[0].size)
            assertTrue(endpoint.x in 0 until width)
            assertTrue(endpoint.y in 0 until height)
            assertEquals(Point.START, path.first())
            assertEquals(endpoint, path.last())
            path.zipWithNext { a, b -> assertTrue(b in a.neighboursInRange(width, height)) }
            assertTrue(path.size in lengthRange || endpoint == Point(4, 4))
        }
    }

    @Test
    fun `populateMazeWithNumbersAndOperations generates a valid maze`() {
        val width = 5
        val height = 5
        val numbersRange = 1..10
        val pathTypeEven = true
        val mustInclude = emptyList<MustIncludeTile>()

        OperationType.entries.forEach { operation ->
            val (maze, endpoint, path) = Generator.generateMazeAndEndpoint(width, height, 3..10)
            val populatedMaze =
                Generator.populateMazeWithNumbersAndOperations(maze, path, numbersRange, operation, pathTypeEven, endpoint, mustInclude)

            //Assert...
            assertEquals(height, populatedMaze.size)
            assertEquals(width, populatedMaze[0].size)
            populatedMaze.forEachIndexed { y, row ->
                row.forEachIndexed { x, cell ->
                    val point = Point(x, y)
                    assertTrue(cell.isNotEmpty() || point == endpoint || point == Point.START)
                    if (point != endpoint && point != Point.START) {
                        assertTrue(cell.isNotEmpty())
                        assertEquals(2, cell.count { it == ' ' })
                        assertTrue(cell.contains('*') || cell.contains('+') || cell.contains('-') || cell.contains('/'))
                    }
                }
            }
        }
    }

}
