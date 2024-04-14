package com.rostagabor.mathmaze.services

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.core.Generator
import com.rostagabor.mathmaze.core.Recogniser
import com.rostagabor.mathmaze.data.*
import com.rostagabor.mathmaze.repositories.MazeRepository
import com.rostagabor.mathmaze.repositories.SolutionRepository
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.requests.SolutionIDForm
import com.rostagabor.mathmaze.utils.*
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.multipart.MultipartFile
import java.util.*

/**
 *   Tests for the MazeService class.
 */
class MazeServiceTest {

    private lateinit var userRepository: UserRepository

    private lateinit var mazeRepository: MazeRepository

    private lateinit var solutionRepository: SolutionRepository

    private lateinit var mazeService: MazeService

    @BeforeEach
    fun setUp() {
        userRepository = mockk<UserRepository>()
        mazeRepository = mockk<MazeRepository>()
        solutionRepository = mockk<SolutionRepository>()
        mazeService = MazeService(userRepository, mazeRepository, solutionRepository)
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun `generateMaze returns a newly generated maze`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = listOf(5L)
        val solutions = emptyList<SolutionIDForm>()
        val admin = User(username = "admin", email = ADMIN_EMAIL_ADDRESS)
        val maze = spyk(Maze(1, admin)) {
            every { pathLength } returns 25
            every { jsonWhenGeneratedOrSaved } returns JsonObject()
        }

        mockkObject(Generator)
        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns admin
        every {
            mazeRepository.findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved(
                width = any(),
                height = any(),
                numbersRangeStart = any(),
                numbersRangeEnd = any(),
                operation = any(),
                pathTypeEven = any(),
                saved = any(),
            )
        } returns emptyList()
        every { mazeRepository.findById(any()) } returns Optional.of(Maze())
        every { mazeRepository.findById(5L) } returns Optional.of(Maze(basedOn1 = Solution()))
        every { mazeRepository.delete(any()) } just runs
        every { Generator.generateMazeAndEndpoint(any(), any(), any()) } returns Triple(
            Array(11) { BooleanArray(11) },
            Point(5, 5),
            listOf(Point(0, 0), Point(1, 1))
        )
        every {
            Generator.populateMazeWithNumbersAndOperations(
                maze = any(),
                path = any(),
                numbersRange = any(),
                operation = any(),
                pathTypeEven = any(),
                endpoint = any(),
                mustInclude = any(),
            )
        } returns listOf(listOf("1", "2"), listOf("3", "4"))
        every { mazeRepository.save(any()) } returns maze

        val result = mazeService.generateMaze(
            width = width,
            height = height,
            numbersRangeStart = numbersRangeStart,
            numbersRangeEnd = numbersRangeEnd,
            operation = operation,
            pathTypeEven = pathTypeEven,
            minLength = minLength,
            maxLength = maxLength,
            discardedMazes = discardedMazes,
            solutions = solutions,
        )

        //Assert...
        assertEquals(maze.jsonWhenGeneratedOrSaved, result)
        verify { mazeRepository.delete(any()) }
        verify(exactly = 10) { Generator.generateMazeAndEndpoint(width, height, (minLength + 2)..(maxLength + 2)) }
        verify { Generator.populateMazeWithNumbersAndOperations(any(), any(), any(), any(), any(), any(), any()) }
        verify { mazeRepository.save(any()) }

        unmockkObject(Generator)
    }

    @Test
    fun `generateMaze throws an InvalidMazeDimensionException when the dimensions of the maze are invalid`() {
        val width = -1
        val height = -1
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = emptyList<SolutionIDForm>()

        //Assert...
        assertThrows<InvalidMazeDimensionException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an InvalidPathRangeException when the path range is invalid`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 30
        val maxLength = 20
        val discardedMazes = emptyList<Long>()
        val solutions = emptyList<SolutionIDForm>()

        //Assert...
        assertThrows<InvalidPathRangeException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an InvalidNumbersRangeException when the numbers range is invalid`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 10
        val numbersRangeEnd = 1
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = emptyList<SolutionIDForm>()

        //Assert...
        assertThrows<InvalidNumbersRangeException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an InvalidSolutionDataException when the solution data is invalid`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(1, 1, "noOne"))

        //Assert...
        assertThrows<InvalidSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an NotFoundSolutionDataException when a solution is not found`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(1, null, ""))

        every { solutionRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<NotFoundSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an NotFoundSolutionDataException when a solution is not found because nickname is empty`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(spyk(SolutionIDForm(null, null, "")) {
            every { isCorrect } returns true
        })

        every { solutionRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<NotFoundSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an NotFoundSolutionDataException when a solution is not found because maze is not found`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(null, 1, "noOne"))

        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<NotFoundSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an NotFoundSolutionDataException when a solution is not found because of maze and nickname combo`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(null, 1, "noOne"))

        every { mazeRepository.findById(any()) } returns Optional.of(Maze())
        every { solutionRepository.findByMazeAndNickname(any(), any()) } returns null

        //Assert...
        assertThrows<NotFoundSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an NotCompatibleSolutionDataException when the found solution is not compatible`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(null, 1, "noOne"))
        val notCompatibleMaze = Maze()

        every { mazeRepository.findById(any()) } returns Optional.of(Maze())
        every { solutionRepository.findByMazeAndNickname(any(), any()) } returns mockk<Solution> {
            every { maze } returns notCompatibleMaze
        }

        //Assert...
        assertThrows<NotCompatibleSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an MultipleSolutionDataException when the same solution is used multiple times`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = listOf(SolutionIDForm(null, 1, "noOne"), SolutionIDForm(null, 1, "noOne"))

        every { mazeRepository.findById(any()) } returns Optional.of(Maze())
        every { solutionRepository.findByMazeAndNickname(any(), any()) } returns mockk<Solution> {
            every { maze } returns Maze(numbersRangeStart = numbersRangeStart, numbersRangeEnd = numbersRangeEnd, operation = operation)
        }

        //Assert...
        assertThrows<MultipleSolutionDataException> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze throws an Exception when admin is not found`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = emptyList<SolutionIDForm>()

        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns null

        //Assert...
        assertThrows<Exception> {
            mazeService.generateMaze(
                width = width,
                height = height,
                numbersRangeStart = numbersRangeStart,
                numbersRangeEnd = numbersRangeEnd,
                operation = operation,
                pathTypeEven = pathTypeEven,
                minLength = minLength,
                maxLength = maxLength,
                discardedMazes = discardedMazes,
                solutions = solutions,
            )
        }
    }

    @Test
    fun `generateMaze returns a previously generated maze`() {
        val width = 11
        val height = 11
        val numbersRangeStart = 1
        val numbersRangeEnd = 10
        val operation = OperationType.ADDITION
        val pathTypeEven = true
        val minLength = 20
        val maxLength = 30
        val discardedMazes = emptyList<Long>()
        val solutions = emptyList<SolutionIDForm>()
        val admin = User(username = "admin", email = ADMIN_EMAIL_ADDRESS)
        val maze = spyk(Maze(1, admin)) {
            every { pathLength } returns 25
            every { jsonWhenGeneratedOrSaved } returns JsonObject()
        }

        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns admin
        every {
            mazeRepository.findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved(
                width = any(),
                height = any(),
                numbersRangeStart = any(),
                numbersRangeEnd = any(),
                operation = any(),
                pathTypeEven = any(),
                saved = any(),
            )
        } returns listOf(maze)
        every { maze.jsonWhenGeneratedOrSaved } returns JsonObject()

        val result = mazeService.generateMaze(
            width = width,
            height = height,
            numbersRangeStart = numbersRangeStart,
            numbersRangeEnd = numbersRangeEnd,
            operation = operation,
            pathTypeEven = pathTypeEven,
            minLength = minLength,
            maxLength = maxLength,
            discardedMazes = discardedMazes,
            solutions = solutions,
        )

        //Assert...
        assertEquals(maze.jsonWhenGeneratedOrSaved, result)
    }

    @Test
    fun `saveMaze returns a pair of JsonObject and a list of strings when the maze is saved successfully`() {
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1L, user)) {
            every { jsonWhenGeneratedOrSaved } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { mazeRepository.save(any()) } returns maze
        every { mazeRepository.findByGeneratedByAndSaved(any(), any()) } returns listOf(maze)

        val result = mazeService.saveMaze(user.email, maze.mazeId)

        //Assert...
        assertEquals(maze.jsonWhenGeneratedOrSaved, result.first)
        assertEquals(listOf("/"), result.second)
    }

    @Test
    fun `saveMaze returns a pair of JsonObject and an empty list when the email is empty`() {
        val user = User(username = "username", email = "admin@example.com")
        val maze = spyk(Maze(1L, user)) {
            every { jsonWhenGeneratedOrSaved } returns JsonObject()
        }

        every { userRepository.findByEmail("") } returns null
        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { mazeRepository.save(any()) } returns maze

        val result = mazeService.saveMaze("", maze.mazeId)

        //Assert...
        assertEquals(maze.jsonWhenGeneratedOrSaved, result.first)
        assertEquals(emptyList<String>(), result.second)
    }

    @Test
    fun `saveMaze throws an exception when the user is not found`() {
        val email = "test@example.com"
        val mazeId = 1L

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows<Exception> {
            mazeService.saveMaze(email, mazeId)
        }
    }

    @Test
    fun `saveMaze throws an exception when the maze is not found`() {
        val user = User(username = "username", email = "test@example.com")
        val mazeId = 1L

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<NoSuchElementException> {
            mazeService.saveMaze(user.email, mazeId)
        }
    }

    @Test
    fun `saveMaze throws an exception when the admin is not found`() {
        val email = "test@example.com"
        val mazeId = 1L

        every { userRepository.findByEmail(email) } returns null
        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns null

        assertThrows<Exception> {
            mazeService.saveMaze(email, mazeId)
        }
    }

    @Test
    fun `updateMaze returns a pair of JsonObject and a list of strings when the maze is updated successfully`() {
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1L, user)) {
            every { jsonForProfile } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { mazeRepository.save(any()) } returns maze
        every { mazeRepository.findByGeneratedByAndSaved(any(), any()) } returns listOf(maze)

        val result = mazeService.updateMaze(user.email, maze.mazeId, "description", "/location/", true, "123456789")

        //Assert...
        assertEquals(maze.jsonForProfile, result.first)
        assertEquals(listOf("/"), result.second)
    }

    @Test
    fun `updateMaze throws an exception when the description is invalid`() {
        val user = User(username = "username", email = "test@example.com")
        val maze = Maze(1L, user)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows<DescriptionInvalidFormatException> {
            mazeService.updateMaze(user.email, maze.mazeId, "invalid&description", maze.location, maze.isPrivate, maze.passcode)
        }
    }

    @Test
    fun `updateMaze throws an exception when the location is invalid`() {
        val user = User(username = "username", email = "test@example.com")
        val maze = Maze(1L, user)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows<LocationInvalidFormatException> {
            mazeService.updateMaze(user.email, maze.mazeId, maze.description, "invalid location", maze.isPrivate, maze.passcode)
        }
    }

    @Test
    fun `updateMaze throws an exception when the passcode is invalid`() {
        val user = User(username = "username", email = "test@example.com")
        val maze = Maze(1L, user)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows<PasscodeInvalidFormatException> {
            mazeService.updateMaze(user.email, maze.mazeId, maze.description, maze.location, maze.isPrivate, "invalid passcode")
        }
    }

    @Test
    fun `updateMaze throws an exception when the user is not found`() {
        val email = "nonexistent@example.com"
        val mazeId = 1L

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows<UserNotFoundException> {
            mazeService.updateMaze(email, mazeId, "description", "/location/", true, "123456789")
        }
    }

    @Test
    fun `updateMaze throws an exception when the maze is not found`() {
        val user = User(username = "username", email = "test@example.com")
        val mazeId = 1L

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<InvalidMazeIdException> {
            mazeService.updateMaze(user.email, mazeId, "description", "/location/", true, "123456789")
        }
    }

    @Test
    fun `updateMaze throws an exception when the maze is not generated by the user`() {
        val user = User(username = "username", email = "test@example.com")
        val otherUser = User(username = "otherUsername", email = "other@example.com")
        val maze = Maze(1L, otherUser)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows<MazeOwnerException> {
            mazeService.updateMaze(user.email, maze.mazeId, "description", "/location/", true, "123456789")
        }
    }

    @Test
    fun `openMaze returns the maze when the user is the owner`() {
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(mazeId, user)) {
            every { endPoint } returns Point(4, 4)
            every { jsonForSolving } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        val result = mazeService.openMaze(mazeId, null, user.email)

        //Assert...
        assertEquals(maze.jsonForSolving, result)
    }

    @Test
    fun `openMaze returns the maze when it is public and not protected`() {
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(mazeId, user, isPrivate = false, passcode = "")) {
            every { endPoint } returns Point(4, 4)
            every { jsonForSolving } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        val result = mazeService.openMaze(mazeId, null, user.email)

        //Assert...
        assertEquals(maze.jsonForSolving, result)
    }

    @Test
    fun `openMaze asks for the passcode when the maze is not private`() {
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(mazeId, user, isPrivate = false, passcode = "1234")) {
            every { endPoint } returns Point(4, 4)
            every { jsonForSolving } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns null
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        val result = mazeService.openMaze(mazeId, null, "")

        //Assert...
        assertEquals(false, result["passcode"])
    }

    @Test
    fun `openMaze throws an exception when the maze id is invalid`() {
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<InvalidMazeIdException> {
            mazeService.openMaze(mazeId, null, user.email)
        }
    }

    @Test
    fun `openMaze throws an exception when the maze is private and protected`() {
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(mazeId, user, isPrivate = true, passcode = "1234")) {
            every { endPoint } returns Point(4, 4)
            every { jsonForSolving } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns null
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows<InvalidMazeIdException> {
            mazeService.openMaze(mazeId, null, "")
        }
    }

    @Test
    fun `recogniseMaze returns a JsonObject when the maze is found and recognised`() {
        val image = mockk<MultipartFile>()
        val rotation = 90
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user)) {
            every { endPoint } returns Point(4, 4)
            every { jsonWhenRecognised } returns JsonObject()
        }

        mockkObject(Recogniser)
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { Recogniser.recogniseMaze(any(), any(), any(), any(), any(), any()) } returns Pair(listOf(listOf("1")), listOf(Point(0, 0)))

        val result = mazeService.recogniseMaze(mazeId, image, rotation)

        //Assert...
        assertEquals(listOf(listOf("1")), result["data"])
        assertEquals(listOf(Point(0, 0)), result["path"])
        assertEquals(2, result.size)
        verify { Recogniser.recogniseMaze(image, rotation, -1, -1, Point(4, 4), 2) }

        unmockkObject(Recogniser)
    }

    @Test
    fun `recogniseMaze throws an exception when the rotation is not a multiple of 90`() {
        val image = mockk<MultipartFile>()
        val rotation = 45

        //Assert...
        assertThrows<InvalidRotationException> {
            mazeService.recogniseMaze(1L, image, rotation)
        }
    }

    @Test
    fun `recogniseMaze throws an exception when the maze is not found`() {
        val image = mockk<MultipartFile>()
        val rotation = 90

        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<InvalidMazeIdException> {
            mazeService.recogniseMaze(1L, image, rotation)
        }
    }

    @Test
    fun `recogniseMaze throws an exception when Recogniser throws an exception`() {
        val image = mockk<MultipartFile>()
        val rotation = 90
        val mazeId = 1L
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user)) {
            every { endPoint } returns Point(4, 4)
        }

        mockkObject(Recogniser)
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { Recogniser.recogniseMaze(any(), any(), any(), any(), any(), any()) } throws Exception()

        //Assert...
        assertThrows<Exception> {
            mazeService.recogniseMaze(mazeId, image, rotation)
        }
        verify { Recogniser.recogniseMaze(image, rotation, -1, -1, Point(4, 4), 2) }

        unmockkObject(Recogniser)
    }

    @Test
    fun `checkMaze returns a JsonObject when everything is fine`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user, width = 2, height = 2)) {
            every { endPoint } returns Point(1, 1)
        }
        val solution = spyk(
            Solution(
                maze = maze,
                nickname = nickname,
                data = data.flatten().joinToString(";"),
                path = path.joinToString(";") { (x, y) -> "$x,$y" },
            )
        ) {
            every { createResultsObject(any()) } returns JsonObject()
        }

        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { solutionRepository.existsByMazeAndNickname(any(), any()) } returns false
        every { solutionRepository.save(any()) } returns solution

        mazeService.checkMaze(1L, data, path, nickname, user.email)

        //Assert...
        verify { solution.createResultsObject(UserType.ME) }
    }

    @Test
    fun `checkMaze throws an exception when the nickname is invalid`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "invalid@nickname"
        val email = "test@example.com"

        //Assert...
        assertThrows<NicknameInvalidFormatException> {
            mazeService.checkMaze(1L, data, path, nickname, email)
        }
    }

    @Test
    fun `checkMaze throws an exception when the maze is not found`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val email = "test@example.com"

        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows<InvalidMazeIdException> {
            mazeService.checkMaze(1L, data, path, nickname, email)
        }
    }

    @Test
    fun `checkMaze throws an exception when the nickname is not unique for the maze`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user))

        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { solutionRepository.existsByMazeAndNickname(any(), any()) } returns true

        //Assert...
        assertThrows<NicknameNotUniqueException> {
            mazeService.checkMaze(1L, data, path, nickname, user.email)
        }
    }

    @Test
    fun `checkMaze throws an exception when the path is invalid`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user)) {
            every { endPoint } returns Point(1, 0)
        }

        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { solutionRepository.existsByMazeAndNickname(any(), any()) } returns false

        //Assert...
        assertThrows<InvalidPathException> {
            mazeService.checkMaze(1L, data, path, nickname, user.email)
        }
    }

    @Test
    fun `checkMaze throws an exception when the dimensions of the maze is invalid`() {
        val data = listOf(listOf("1", "2"), listOf("3", "4"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user)) {
            every { endPoint } returns Point(1, 1)
        }

        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { solutionRepository.existsByMazeAndNickname(any(), any()) } returns false

        //Assert...
        assertThrows<InvalidMazeDimensionException> {
            mazeService.checkMaze(1L, data, path, nickname, user.email)
        }
    }

    @Test
    fun `checkMaze throws an exception when at least one cell contains a non number`() {
        val data = listOf(listOf("1", "2"), listOf("3", "a"))
        val path = listOf(Point(0, 0), Point(1, 1))
        val nickname = "validNickname"
        val user = User(username = "username", email = "test@example.com")
        val maze = spyk(Maze(1, user, width = 2, height = 2)) {
            every { endPoint } returns Point(1, 1)
        }

        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { solutionRepository.existsByMazeAndNickname(any(), any()) } returns false

        //Assert...
        assertThrows<NotNumberInMazeException> {
            mazeService.checkMaze(1L, data, path, nickname, user.email)
        }
    }

    @Test
    fun `getAllMazes returns mazes when the user is found and has generated mazes`() {
        val email = "test@example.com"
        val user = User(username = "username", email = email)
        val maze = spyk(Maze(1, user))

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findByGeneratedByAndSaved(any()) } returns listOf(maze)
        every { maze.jsonForProfile } returns JsonObject()

        val result = mazeService.getAllMazes(email)

        //Assert...
        verify { userRepository.findByEmail(email) }
        verify { mazeRepository.findByGeneratedByAndSaved(user) }
        assertEquals(1, result.first.size)
        assertEquals(maze.jsonForProfile, result.first[0])
        assertEquals(listOf("/"), result.second)
    }

    @Test
    fun `getAllMazes throws an exception when the user is not found`() {
        val email = "test@example.com"

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows(Exception::class.java) {
            mazeService.getAllMazes(email)
        }
    }

    @Test
    fun `getSolutions returns solutions when the user and maze are found and the maze is generated by the user`() {
        val email = "test@example.com"
        val mazeId = 1L
        val user = User(username = "username", email = email)
        val maze = spyk(Maze(mazeId, user))

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)
        every { maze.solutions } returns listOf(mockk<Solution> {
            every { createResultsObject() } returns JsonObject()
        })

        val solutions = mazeService.getSolutions(mazeId, email)

        //Assert...
        verify { userRepository.findByEmail(email) }
        verify { mazeRepository.findById(mazeId) }
        assertEquals(1, solutions.size)
    }

    @Test
    fun `getSolutions throws an exception when the user is not found`() {
        val email = "test@example.com"
        val mazeId = 1L

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows(Exception::class.java) {
            mazeService.getSolutions(mazeId, email)
        }
    }

    @Test
    fun `getSolutions throws an exception when the maze is not found`() {
        val email = "test@example.com"
        val mazeId = 1L
        val user = User(username = "username", email = email)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.empty()

        //Assert...
        assertThrows(InvalidMazeIdException::class.java) {
            mazeService.getSolutions(mazeId, email)
        }
    }

    @Test
    fun `getSolutions throws an exception when the maze is not generated by the user`() {
        val email = "test@example.com"
        val mazeId = 1L
        val user = User(username = "username", email = email)
        val otherUser = User(username = "otherUsername", email = "other@example.com")
        val maze = Maze(mazeId, otherUser)

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findById(any()) } returns Optional.of(maze)

        //Assert...
        assertThrows(MazeOwnerException::class.java) {
            mazeService.getSolutions(mazeId, email)
        }
    }

    @Test
    fun `updateLocation returns a pair of JsonObjects and a list of strings when the location is updated successfully`() {
        val parentLocation = "/validLocation/"
        val originalLocation = "originalLocation"
        val newLocation = "newLocation"
        val email = "test@example.com"
        val user = User(username = "username", email = email)
        val maze = spyk(Maze(1L, user, location = "$parentLocation$originalLocation/")) {
            every { jsonForProfile } returns JsonObject()
        }

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findByGeneratedByAndSaved(any()) } returns listOf(maze)
        every { mazeRepository.save(any()) } returns maze

        val result = mazeService.updateLocation(parentLocation, originalLocation, newLocation, email)

        //Assert...
        assertEquals(maze.jsonForProfile, result.first[0])
        assertEquals(listOf("/", parentLocation, "$parentLocation$originalLocation/"), result.second)
    }

    @Test
    fun `updateLocation throws an exception when the parent location is invalid`() {
        val parentLocation = "invalid location"
        val originalLocation = "originalLocation"
        val newLocation = "newLocation"
        val email = "test@example.com"

        //Assert...
        assertThrows<LocationInvalidFormatException> {
            mazeService.updateLocation(parentLocation, originalLocation, newLocation, email)
        }
    }

    @Test
    fun `updateLocation throws an exception when the new location is invalid`() {
        val parentLocation = "validLocation/"
        val originalLocation = "originalLocation"
        val newLocation = "invalid location"
        val email = "test@example.com"

        //Assert...
        assertThrows<LocationInvalidFormatException> {
            mazeService.updateLocation(parentLocation, originalLocation, newLocation, email)
        }
    }

    @Test
    fun `updateLocation throws an exception when the user is not found`() {
        val parentLocation = "validLocation/"
        val originalLocation = "originalLocation"
        val newLocation = "newLocation"
        val email = "someone@example.com"

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows<Exception> {
            mazeService.updateLocation(parentLocation, originalLocation, newLocation, email)
        }
    }

    @Test
    fun `updateLocation throws an exception when the new location is not unique`() {
        val parentLocation = "/validLocation/"
        val originalLocation = "originalLocation"
        val newLocation = "newLocation"
        val user = User(username = "username", email = "test@example.com")
        val maze = Maze(1L, user)
        val maze2 = Maze(2L, user, location = "$parentLocation$newLocation/")

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findByGeneratedByAndSaved(any()) } returns listOf(maze, maze2)

        //Assert...
        assertThrows<LocationNotUniqueException> {
            mazeService.updateLocation(parentLocation, originalLocation, newLocation, user.email)
        }
    }

    @Test
    fun `updateLocation throws an exception when the original location does not exist`() {
        val parentLocation = "/validLocation/"
        val originalLocation = "nonexistentLocation"
        val newLocation = "newLocation"
        val user = User(username = "username", email = "test@example.com")

        every { userRepository.findByEmail(any()) } returns user
        every { mazeRepository.findByGeneratedByAndSaved(any()) } returns emptyList()

        //Assert...
        assertThrows<LocationNotFoundException> {
            mazeService.updateLocation(parentLocation, originalLocation, newLocation, user.email)
        }
    }

}
