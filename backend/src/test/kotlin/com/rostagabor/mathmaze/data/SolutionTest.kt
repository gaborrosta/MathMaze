package com.rostagabor.mathmaze.data

import com.beust.klaxon.JsonObject
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.fail
import java.time.Instant

/**
 *   Tests for the Solution class.
 */
class SolutionTest {

    @Test
    fun createResultsObject() {
        val user = User(username = "testUser", email = "test@example.com")
        val maze = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            saved = true,
            generatedBy = user,
            data = ";1 + 1;1 + 1;1 + 1;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;",
            path = "0,0;0,1;0,2;0,3;0,4;1,4;2,4;3,4;4,4",
        )
        val solvedAt = Instant.now()
        val solution = Solution(
            maze = maze,
            nickname = "testUser",
            data = ";2;2;2;2;3;5;3;3;2;3;;3;3;2;3;3;3;3;4;3;3;3;3;",
            path = "0,0;0,1;0,2;0,3;0,4;1,0;2,4;3,4;4,4",
            solvedAt = solvedAt,
        )

        //Get results objects
        val results = solution.createResultsObject(UserType.SOMEONE)
        val results2 = solution.createResultsObject()

        //Assert...
        assertTrue(results.contains("width") && results["width"] == 5)
        assertTrue(results.contains("height") && results["height"] == 5)
        assertTrue(results.contains("start") && results["start"] == listOf(0, 0))
        assertTrue(results.contains("end") && results["end"] == listOf(4, 4))
        assertTrue(results.contains("info"))
        assertTrue(results2.contains("info"))
        assertTrue(results.contains("data"))

        //Info
        val info = results["info"] as JsonObject
        val info2 = results2["info"] as JsonObject

        //Assert...
        assertTrue(info.contains("correct") && info["correct"] == 20)
        assertTrue(info.contains("incorrect") && info["incorrect"] == 2)
        assertTrue(info.contains("correctPath") && info["correctPath"] == 6)
        assertTrue(info.contains("wrongPath") && info["wrongPath"] == 1)
        assertTrue(info.contains("missedPath") && info["missedPath"] == 1)
        assertTrue(info.contains("solutionId") && info.int("solutionId") == 0)
        assertTrue(info.contains("mazeId") && info.int("mazeId") == 0)
        assertTrue(info.contains("nickname") && info["nickname"] == "testUser")
        assertTrue(info.contains("userType") && info["userType"] == UserType.SOMEONE.name)
        assertFalse(info.contains("solvedAt"))
        assertTrue(info2.contains("solvedAt") && info2["solvedAt"] == solvedAt.toEpochMilli())
        assertFalse(info2.contains("userType"))

        //Data
        val data = results["data"] as? List<*> ?: fail("Data is not a list of lists of JSON objects")
        val expected = mapOf(
            Point(1, 0) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to true, "isMazePath" to false),
            Point(2, 0) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(3, 0) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(4, 0) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(0, 1) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
            Point(1, 1) to mapOf("operation" to "1 + 2", "result" to 5, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(2, 1) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(3, 1) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(4, 1) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(0, 2) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
            Point(2, 2) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(3, 2) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(4, 2) to mapOf("operation" to "1 + 1", "result" to 2, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(0, 3) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
            Point(1, 3) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(2, 3) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(3, 3) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to false),
            Point(4, 3) to mapOf("operation" to "1 + 1", "result" to 4, "expectedResult" to 2, "isUserPath" to false, "isMazePath" to false),
            Point(0, 4) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
            Point(1, 4) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to false, "isMazePath" to true),
            Point(2, 4) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
            Point(3, 4) to mapOf("operation" to "1 + 2", "result" to 3, "expectedResult" to 3, "isUserPath" to true, "isMazePath" to true),
        )

        //Assert...
        assertEquals(5, data.size)
        assertEquals(5, (data[0] as List<*>).size)
        data.forEachIndexed { y, row ->
            (row as List<*>).forEachIndexed { x, cell ->
                val cellData = cell as JsonObject

                when (val point = Point(x, y)) {
                    Point.START, Point(4, 4) -> assertEquals(0, cellData.size)

                    Point(1, 2) -> {
                        assertTrue(cellData.contains("isUserPath") && cellData["isUserPath"] == false)
                        assertTrue(cellData.contains("isMazePath") && cellData["isMazePath"] == false)
                    }

                    else -> assertEquals(expected[point], cellData)
                }
            }
        }
    }

    @Test
    fun getIncorrectResults() {
        val user = User(username = "testUser", email = "test@example.com")
        val maze = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            saved = true,
            generatedBy = user,
            data = ";1 + 1;1 + 1;1 + 1;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;1 + 1;1 + 2;1 + 2;1 + 2;1 + 2;",
            path = "0,0;0,1;0,2;0,3;0,4;1,4;2,4;3,4;4,4",
        )
        val solution = Solution(
            maze = maze,
            nickname = "testUser",
            data = ";2;2;2;2;3;5;3;3;2;3;;3;3;2;3;3;3;3;4;3;3;3;3;",
            path = "0,0;0,1;0,2;0,3;0,4;1,0;2,4;3,4;4,4",
        )

        //Get incorrect results
        val incorrectResults = solution.getIncorrectResults()

        //Assert...
        assertEquals(2, incorrectResults.size)
        assertEquals(
            MustIncludeTile(number1 = 1, number2 = 2, result = 3, operationType = OperationType.ADDITION, operation = "1 + 2"),
            incorrectResults[0]
        )
        assertEquals(
            MustIncludeTile(number1 = 1, number2 = 1, result = 2, operationType = OperationType.ADDITION, operation = "1 + 1"),
            incorrectResults[1]
        )
    }

}
