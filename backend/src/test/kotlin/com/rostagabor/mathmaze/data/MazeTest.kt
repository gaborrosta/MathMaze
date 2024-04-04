package com.rostagabor.mathmaze.data

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant

/**
 *   Tests for the Maze class.
 */
class MazeTest {

    @Test
    fun endPoint() {
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

        //Assert...
        assertEquals(Point(4, 4), maze.endPoint)
    }

    @Test
    fun pathLength() {
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

        //Assert...
        assertEquals(9, maze.pathLength)
    }

    @Test
    fun sendableData() {
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

        //Assert...
        assertEquals(
            listOf(
                listOf("", "1 + 1", "1 + 1", "1 + 1", "1 + 1"),
                listOf("1 + 2", "1 + 2", "1 + 2", "1 + 2", "1 + 1"),
                listOf("1 + 2", "1 + 2", "1 + 2", "1 + 2", "1 + 1"),
                listOf("1 + 2", "1 + 2", "1 + 2", "1 + 2", "1 + 1"),
                listOf("1 + 2", "1 + 2", "1 + 2", "1 + 2", ""),
            ),
            maze.sendableData
        )
    }

    @Test
    fun sendablePath() {
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

        //Assert...
        assertEquals(
            listOf(Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 3), Point(0, 4), Point(1, 4), Point(2, 4), Point(3, 4), Point(4, 4)),
            maze.sendablePath
        )
    }

    @Test
    fun numberOfDigits() {
        val user = User(username = "testUser", email = "test@example.com")
        val maze1 = Maze(
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
        val maze2 = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 20,
            operation = OperationType.MULTIPLICATION,
            pathTypeEven = true,
            saved = true,
            generatedBy = user,
            data = "",
            path = "",
        )
        val maze3 = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.MULTIPLICATION,
            pathTypeEven = true,
            saved = true,
            generatedBy = user,
            data = "",
            path = "",
        )

        //Assert...
        assertEquals(2, maze1.numberOfDigits)
        assertEquals(3, maze2.numberOfDigits)
        assertEquals(2, maze3.numberOfDigits)
    }

    @Test
    fun jsonWhenRecognised() {
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

        //Assert...
        val json = maze.jsonWhenRecognised
        assertTrue(json.contains("id") && json.int("id") == 0)
        assertTrue(json.contains("width") && json["width"] == 5)
        assertTrue(json.contains("height") && json["height"] == 5)
        assertTrue(json.contains("start") && json["start"] == listOf(0, 0))
        assertTrue(json.contains("end") && json["end"] == listOf(4, 4))
    }

    @Test
    fun jsonForSolving() {
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

        //Assert...
        val json = maze.jsonForSolving
        assertTrue(json.contains("id") && json.int("id") == 0)
        assertTrue(json.contains("width") && json["width"] == 5)
        assertTrue(json.contains("height") && json["height"] == 5)
        assertTrue(json.contains("start") && json["start"] == listOf(0, 0))
        assertTrue(json.contains("end") && json["end"] == listOf(4, 4))
        assertTrue(json.contains("data") && json["data"] == maze.sendableData)
        assertTrue(json.contains("path") && json["path"] == maze.sendablePath)
        assertTrue(json.contains("digits") && json["digits"] == 2)
        assertTrue(json.contains("pathLength") && json["pathLength"] == 7)
        assertTrue(json.contains("pathTypeEven") && json["pathTypeEven"] == true)
        assertTrue(json.contains("user") && json["user"] == "testUser")
    }

    @Test
    fun jsonWhenGeneratedOrSaved() {
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

        //Assert...
        val json = maze.jsonWhenGeneratedOrSaved
        assertTrue(json.contains("id") && json.int("id") == 0)
        assertTrue(json.contains("width") && json["width"] == 5)
        assertTrue(json.contains("height") && json["height"] == 5)
        assertTrue(json.contains("start") && json["start"] == listOf(0, 0))
        assertTrue(json.contains("end") && json["end"] == listOf(4, 4))
        assertTrue(json.contains("data") && json["data"] == maze.sendableData)
        assertTrue(json.contains("path") && json["path"] == maze.sendablePath)
        assertTrue(json.contains("digits") && json["digits"] == 2)
        assertTrue(json.contains("pathLength") && json["pathLength"] == 7)
        assertTrue(json.contains("pathTypeEven") && json["pathTypeEven"] == true)
        assertTrue(json.contains("user") && json["user"] == "testUser")
        assertTrue(json.contains("location") && json["location"] == "/")
        assertTrue(json.contains("description") && json["description"] == "")
        assertTrue(json.contains("isPrivate") && json["isPrivate"] == true)
        assertTrue(json.contains("passcode") && json["passcode"] == "")
    }

    @Test
    fun jsonForProfile() {
        val user = User(username = "testUser", email = "test@example.com")
        val createdAt = Instant.now()
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
            createdAt = createdAt,
        )

        //Assert...
        val json = maze.jsonForProfile
        assertTrue(json.contains("id") && json.int("id") == 0)
        assertTrue(json.contains("width") && json["width"] == 5)
        assertTrue(json.contains("height") && json["height"] == 5)
        assertTrue(json.contains("start") && json["start"] == listOf(0, 0))
        assertTrue(json.contains("end") && json["end"] == listOf(4, 4))
        assertTrue(json.contains("data") && json["data"] == maze.sendableData)
        assertTrue(json.contains("path") && json["path"] == maze.sendablePath)
        assertTrue(json.contains("digits") && json["digits"] == 2)
        assertTrue(json.contains("pathLength") && json["pathLength"] == 7)
        assertTrue(json.contains("pathTypeEven") && json["pathTypeEven"] == true)
        assertTrue(json.contains("user") && json["user"] == "testUser")
        assertTrue(json.contains("location") && json["location"] == "/")
        assertTrue(json.contains("description") && json["description"] == "")
        assertTrue(json.contains("isPrivate") && json["isPrivate"] == true)
        assertTrue(json.contains("passcode") && json["passcode"] == "")
        assertTrue(json.contains("numbersRangeStart") && json["numbersRangeStart"] == 1)
        assertTrue(json.contains("numbersRangeEnd") && json["numbersRangeEnd"] == 10)
        assertTrue(json.contains("operation") && json["operation"] == 0)
        assertTrue(json.contains("createdAt") && json["createdAt"] == createdAt.toEpochMilli())
        assertTrue(json.contains("solved") && json["solved"] == 0)
    }

}
