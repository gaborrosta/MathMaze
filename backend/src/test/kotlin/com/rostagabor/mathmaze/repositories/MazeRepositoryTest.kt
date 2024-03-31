package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.Maze
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.context.ActiveProfiles

/**
 *   Tests for the MazeRepository interface.
 */
@DataJpaTest
@ActiveProfiles("test", "dev")
class MazeRepositoryTest {

    @Autowired
    lateinit var mazeRepository: MazeRepository

    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 2 mazes
        val maze = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            saved = false,
            generatedBy = user,
        )
        mazeRepository.save(maze)
        mazeRepository.save(
            Maze(
                width = 5,
                height = 5,
                numbersRangeStart = 1,
                numbersRangeEnd = 10,
                operation = OperationType.SUBTRACTION,
                pathTypeEven = true,
                saved = true,
                generatedBy = user,
            )
        )

        //Find the maze
        val foundMazes = mazeRepository.findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            saved = false,
        )

        //Assert...
        assertNotNull(foundMazes)
        assertEquals(1, foundMazes.size)
        assertEquals(maze, foundMazes[0])
    }

    @Test
    fun findByGeneratedByAndSaved() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 2 mazes
        val maze = Maze(
            width = 5,
            height = 5,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            saved = true,
            generatedBy = user,
        )
        mazeRepository.save(maze)
        mazeRepository.save(
            Maze(
                width = 5,
                height = 5,
                numbersRangeStart = 1,
                numbersRangeEnd = 10,
                operation = OperationType.SUBTRACTION,
                pathTypeEven = true,
                saved = false,
                generatedBy = user,
            )
        )

        //Find the maze
        val foundMazes = mazeRepository.findByGeneratedByAndSaved(user, saved = true)

        //Assert...
        assertNotNull(foundMazes)
        assertEquals(1, foundMazes.size)
        assertEquals(maze, foundMazes[0])
    }

}
