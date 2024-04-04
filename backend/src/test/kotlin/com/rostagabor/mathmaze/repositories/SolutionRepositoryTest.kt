package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.Maze
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Solution
import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.context.ActiveProfiles

/**
 *   Tests for the SolutionRepository interface.
 */
@DataJpaTest
@ActiveProfiles("test", "dev")
class SolutionRepositoryTest {

    @Autowired
    lateinit var solutionRepository: SolutionRepository

    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var mazeRepository: MazeRepository

    @Test
    fun findByMazeAndNickname() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 1 maze
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

        //Save 2 solutions
        val solution = Solution(maze = maze, nickname = "testNickname")
        solutionRepository.save(solution)
        solutionRepository.save(Solution(maze = maze, nickname = "testNickname2"))

        //Find the solution by maze and nickname
        val foundSolution = solutionRepository.findByMazeAndNickname(maze, "testNickname")

        //Assert...
        assertNotNull(foundSolution)
        assertEquals(solution, foundSolution)
    }

    @Test
    fun existsByMazeAndNickname() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 1 maze
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

        //Save 2 solutions
        val solution = Solution(maze = maze, nickname = "testNickname")
        solutionRepository.save(solution)
        solutionRepository.save(Solution(maze = maze, nickname = "testNickname2"))

        //Assert...
        assertTrue(solutionRepository.existsByMazeAndNickname(maze, "testNickname"))
    }

    @Test
    fun testSolutionUniqueness() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 1 maze
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

        //Save 1 solution
        val solution1 = Solution(maze = maze, nickname = "testNickname")
        solutionRepository.save(solution1)

        //Create another solution with the same maze and nickname
        val solution2 = Solution(maze = maze, nickname = "testNickname")

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) { solutionRepository.saveAndFlush(solution2) }
    }

    @Test
    fun testDataLength() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 1 maze
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

        //Create 1 solution
        val solution = Solution(maze = maze, nickname = "testNickname", data = "a".repeat(25001))

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) { solutionRepository.saveAndFlush(solution) }
    }

    @Test
    fun testPathLength() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Save 1 maze
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

        //Create 1 solution
        val solution = Solution(maze = maze, nickname = "testNickname", path = "a".repeat(25001))

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) { solutionRepository.saveAndFlush(solution) }
    }

}
