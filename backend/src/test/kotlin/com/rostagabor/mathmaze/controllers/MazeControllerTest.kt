package com.rostagabor.mathmaze.controllers

import com.beust.klaxon.JsonObject
import com.fasterxml.jackson.databind.ObjectMapper
import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.data.Point
import com.rostagabor.mathmaze.requests.*
import com.rostagabor.mathmaze.services.MazeService
import com.rostagabor.mathmaze.services.UserService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.multipart.MultipartFile

/**
 *   Tests for the MazeController class.
 */
@SpringBootTest(properties = [
    "spring.datasource.url=jdbc:hsqldb:mem:testMaze;DB_CLOSE_DELAY=-1",
    "spring.datasource.driverClassName=org.hsqldb.jdbcDriver",
    "hibernate.dialect=org.hibernate.dialect.HSQLDialect",
])
@AutoConfigureMockMvc
@ActiveProfiles("test", "dev")
class MazeControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var userService: UserService

    @MockBean
    private lateinit var mazeService: MazeService

    @Test
    fun generate() {
        val mazeGenerationRequest = MazeGenerationRequest(
            width = 10,
            height = 10,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            solution1 = SolutionIDForm(null, null, null),
            solution2 = SolutionIDForm(null, null, null),
            solution3 = SolutionIDForm(null, null, null),
            token = "token",
        )
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeGenerationRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.generateMaze(
                width = mazeGenerationRequest.width,
                height = mazeGenerationRequest.height,
                numbersRangeStart = mazeGenerationRequest.numbersRangeStart,
                numbersRangeEnd = mazeGenerationRequest.numbersRangeEnd,
                operation = mazeGenerationRequest.operation,
                pathTypeEven = mazeGenerationRequest.pathTypeEven,
                minLength = mazeGenerationRequest.minLength,
                maxLength = mazeGenerationRequest.maxLength,
                discardedMazes = mazeGenerationRequest.discardedMazes,
                solutions = emptyList()
            )
        ).thenReturn(json)

        val response = MazeController(userService, mazeService).generate(mazeGenerationRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "maze" to json)), response.body)
    }

    @Test
    fun generateWithException() {
        val mazeGenerationRequest = MazeGenerationRequest(
            width = 10,
            height = 10,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            solution1 = SolutionIDForm(null, null, null),
            solution2 = SolutionIDForm(null, null, null),
            solution3 = SolutionIDForm(null, null, null),
            token = "token",
        )
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeGenerationRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.generateMaze(
                width = mazeGenerationRequest.width,
                height = mazeGenerationRequest.height,
                numbersRangeStart = mazeGenerationRequest.numbersRangeStart,
                numbersRangeEnd = mazeGenerationRequest.numbersRangeEnd,
                operation = mazeGenerationRequest.operation,
                pathTypeEven = mazeGenerationRequest.pathTypeEven,
                minLength = mazeGenerationRequest.minLength,
                maxLength = mazeGenerationRequest.maxLength,
                discardedMazes = mazeGenerationRequest.discardedMazes,
                solutions = emptyList()
            )
        ).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).generate(mazeGenerationRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlGenerate() {
        val mazeGenerationRequest = MazeGenerationRequest(
            width = 10,
            height = 10,
            numbersRangeStart = 1,
            numbersRangeEnd = 10,
            operation = OperationType.ADDITION,
            pathTypeEven = true,
            solution1 = SolutionIDForm(null, null, null),
            solution2 = SolutionIDForm(null, null, null),
            solution3 = SolutionIDForm(null, null, null),
            token = "token",
        )
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeGenerationRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.generateMaze(
                width = mazeGenerationRequest.width,
                height = mazeGenerationRequest.height,
                numbersRangeStart = mazeGenerationRequest.numbersRangeStart,
                numbersRangeEnd = mazeGenerationRequest.numbersRangeEnd,
                operation = mazeGenerationRequest.operation,
                pathTypeEven = mazeGenerationRequest.pathTypeEven,
                minLength = mazeGenerationRequest.minLength,
                maxLength = mazeGenerationRequest.maxLength,
                discardedMazes = mazeGenerationRequest.discardedMazes,
                solutions = emptyList()
            )
        ).thenReturn(json)

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(mazeGenerationRequest)

        //Assert...
        mockMvc
            .perform(
                post("/maze/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun save() {
        val mazeSaveRequest = MazeSaveRequest(mazeId = 1, token = "token")
        val json = JsonObject(mapOf("hi" to "there"))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeSaveRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.saveMaze("test@example.com", mazeSaveRequest.mazeId)).thenReturn(Pair(json, locations))

        val response = MazeController(userService, mazeService).save(mazeSaveRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "maze" to json, "locations" to locations)), response.body)
    }

    @Test
    fun saveWithException() {
        val mazeSaveRequest = MazeSaveRequest(mazeId = 1, token = "token")
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeSaveRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.saveMaze("test@example.com", mazeSaveRequest.mazeId)).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).save(mazeSaveRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlSave() {
        val mazeSaveRequest = MazeSaveRequest(mazeId = 1, token = "token")
        val json = JsonObject(mapOf("hi" to "there"))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeSaveRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.saveMaze("test@example.com", mazeSaveRequest.mazeId)).thenReturn(Pair(json, locations))

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(mazeSaveRequest)

        //Assert...
        mockMvc
            .perform(
                post("/maze/save")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun update() {
        val mazeUpdateRequest = MazeUpdateRequest(
            mazeId = 1,
            description = "description",
            location = "/",
            isPrivate = false,
            passcode = "",
            token = "token",
        )
        val json = JsonObject(mapOf("hi" to "there"))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateMaze(
                "test@example.com",
                mazeUpdateRequest.mazeId,
                mazeUpdateRequest.description!!,
                mazeUpdateRequest.location,
                mazeUpdateRequest.isPrivate,
                mazeUpdateRequest.passcode,
            )
        ).thenReturn(Pair(json, locations))

        val response = MazeController(userService, mazeService).update(mazeUpdateRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "maze" to json, "locations" to locations)), response.body)
    }

    @Test
    fun updateWithException() {
        val mazeUpdateRequest = MazeUpdateRequest(
            mazeId = 1,
            description = "description",
            location = "/",
            isPrivate = false,
            passcode = "",
            token = "token",
        )
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateMaze(
                "test@example.com",
                mazeUpdateRequest.mazeId,
                mazeUpdateRequest.description!!,
                mazeUpdateRequest.location,
                mazeUpdateRequest.isPrivate,
                mazeUpdateRequest.passcode,
            )
        ).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).update(mazeUpdateRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlUpdate() {
        val mazeUpdateRequest = MazeUpdateRequest(
            mazeId = 1,
            description = "description",
            location = "/",
            isPrivate = false,
            passcode = "",
            token = "token",
        )
        val json = JsonObject(mapOf("hi" to "there"))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateMaze(
                "test@example.com",
                mazeUpdateRequest.mazeId,
                mazeUpdateRequest.description!!,
                mazeUpdateRequest.location,
                mazeUpdateRequest.isPrivate,
                mazeUpdateRequest.passcode,
            )
        ).thenReturn(Pair(json, locations))

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(mazeUpdateRequest)

        //Assert...
        mockMvc
            .perform(
                post("/maze/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun open() {
        val mazeId = 1L
        val passcode = "123456789"
        val token = "token"
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.openMaze(mazeId, passcode, "test@example.com")).thenReturn(json)

        val response = MazeController(userService, mazeService).open(mazeId, passcode, token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "maze" to json)), response.body)
    }

    @Test
    fun openWithException() {
        val mazeId = 1L
        val passcode = "123456789"
        val token = "token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.openMaze(mazeId, passcode, "test@example.com")).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).open(mazeId, passcode, token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlOpen() {
        val mazeId = 1L
        val passcode = "123456789"
        val token = "token"
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.openMaze(mazeId, passcode, "test@example.com")).thenReturn(json)

        //Assert...
        mockMvc
            .perform(
                get("/maze/open")
                    .param("mazeId", mazeId.toString())
                    .param("passcode", passcode)
                    .param("token", token)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun recognise() {
        val mazeId = 1L
        val image = Mockito.mock(MultipartFile::class.java)
        val rotation = 0
        val token = "token"
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.recogniseMaze(mazeId, image, rotation)).thenReturn(json)

        val response = MazeController(userService, mazeService).recognise(mazeId, image, rotation, token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "recognisedMaze" to json)), response.body)
    }

    @Test
    fun recogniseWithException() {
        val mazeId = 1L
        val image = Mockito.mock(MultipartFile::class.java)
        val rotation = 0
        val token = "token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.recogniseMaze(mazeId, image, rotation)).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).recognise(mazeId, image, rotation, token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlRecognise() {
        val mazeId = 1L
        val image = Mockito.mock(MultipartFile::class.java)
        val rotation = 0
        val token = "token"
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.recogniseMaze(mazeId, image, rotation)).thenReturn(json)

        //Assert...
        mockMvc
            .perform(
                multipart("/maze/recognise")
                    .file("image", image.bytes)
                    .param("mazeId", mazeId.toString())
                    .param("rotation", rotation.toString())
                    .param("token", token)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun check() {
        val mazeCheckRequest = MazeCheckRequest(
            mazeId = 1,
            data = listOf(listOf("1", "2"), listOf("3", "4")),
            path = listOf(Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 0)),
            nickname = "nickname",
            token = "token",
        )
        val json = JsonObject(mapOf("hi" to "there"))
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeCheckRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.checkMaze(
                mazeCheckRequest.mazeId,
                mazeCheckRequest.data,
                mazeCheckRequest.path,
                mazeCheckRequest.nickname,
                "test@example.com",
            )
        ).thenReturn(json)

        val response = MazeController(userService, mazeService).check(mazeCheckRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "checkedMaze" to json)), response.body)
    }

    @Test
    fun checkWithException() {
        val mazeCheckRequest = MazeCheckRequest(
            mazeId = 1,
            data = listOf(listOf("1", "2"), listOf("3", "4")),
            path = listOf(Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 0)),
            nickname = "nickname",
            token = "token",
        )
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeCheckRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.checkMaze(
                mazeCheckRequest.mazeId,
                mazeCheckRequest.data,
                mazeCheckRequest.path,
                mazeCheckRequest.nickname,
                "test@example.com",
            )
        ).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).check(mazeCheckRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlCheck() {
        val mazeCheckRequest = MazeCheckRequest(
            mazeId = 1,
            data = listOf(listOf("1", "2"), listOf("3", "4")),
            path = listOf(Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 0)),
            nickname = "nickname",
            token = "token",
        )
        Mockito.`when`(userService.regenerateTokenIfStillValid(mazeCheckRequest.token)).thenReturn(Pair("test@example.com", "newToken"))

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(mazeCheckRequest)

        //Assert...
        mockMvc
            .perform(
                post("/maze/check")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun getAll() {
        val token = "token"
        val mazes = listOf(JsonObject(mapOf("hi" to "there")))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getAllMazes("test@example.com")).thenReturn(Pair(mazes, locations))

        val response = MazeController(userService, mazeService).getAll(token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "mazes" to mazes, "locations" to locations)), response.body)
    }

    @Test
    fun getAllWithException() {
        val token = "token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getAllMazes("test@example.com")).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).getAll(token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlGetAll() {
        val token = "token"
        val mazes = listOf(JsonObject(mapOf("hi" to "there")))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getAllMazes("test@example.com")).thenReturn(Pair(mazes, locations))

        //Assert...
        mockMvc
            .perform(get("/maze/get-all?token=$token"))
            .andExpect(status().isOk)
    }

    @Test
    fun getSolutions() {
        val mazeId = 1L
        val token = "token"
        val solutions = listOf(JsonObject(mapOf("hi" to "there")))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getSolutions(mazeId, "test@example.com")).thenReturn(solutions)

        val response = MazeController(userService, mazeService).getSolutions(mazeId, token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "solutions" to solutions)), response.body)
    }

    @Test
    fun getSolutionsWithException() {
        val mazeId = 1L
        val token = "token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getSolutions(mazeId, "test@example.com")).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).getSolutions(mazeId, token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlGetSolutions() {
        val mazeId = 1L
        val token = "token"
        val solutions = listOf(JsonObject(mapOf("hi" to "there")))
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(mazeService.getSolutions(mazeId, "test@example.com")).thenReturn(solutions)

        //Assert...
        mockMvc
            .perform(
                get("/maze/get-solutions")
                    .param("mazeId", mazeId.toString())
                    .param("token", token)
            )
            .andExpect(status().isOk)
    }

    @Test
    fun updateLocation() {
        val locationUpdateRequest = LocationUpdateRequest(
            parentLocation = "/",
            originalLocation = "/asd",
            newLocation = "/qwe",
            token = "token",
        )
        val mazes = listOf(JsonObject(mapOf("hi" to "there")))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(locationUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateLocation(
                locationUpdateRequest.parentLocation,
                locationUpdateRequest.originalLocation,
                locationUpdateRequest.newLocation,
                "test@example.com",
            )
        ).thenReturn(Pair(mazes, locations))

        val response = MazeController(userService, mazeService).updateLocation(locationUpdateRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(JsonObject(mapOf("token" to "newToken", "mazes" to mazes, "locations" to locations)), response.body)
    }

    @Test
    fun updateLocationWithException() {
        val locationUpdateRequest = LocationUpdateRequest(
            parentLocation = "/",
            originalLocation = "/asd",
            newLocation = "/qwe",
            token = "token",
        )
        Mockito.`when`(userService.regenerateTokenIfStillValid(locationUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateLocation(
                locationUpdateRequest.parentLocation,
                locationUpdateRequest.originalLocation,
                locationUpdateRequest.newLocation,
                "test@example.com",
            )
        ).thenThrow(Exception::class.java)

        val response = MazeController(userService, mazeService).updateLocation(locationUpdateRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlUpdateLocation() {
        val locationUpdateRequest = LocationUpdateRequest(
            parentLocation = "/",
            originalLocation = "/asd",
            newLocation = "/qwe",
            token = "token",
        )
        val mazes = listOf(JsonObject(mapOf("hi" to "there")))
        val locations = listOf("/")
        Mockito.`when`(userService.regenerateTokenIfStillValid(locationUpdateRequest.token)).thenReturn(Pair("test@example.com", "newToken"))
        Mockito.`when`(
            mazeService.updateLocation(
                locationUpdateRequest.parentLocation,
                locationUpdateRequest.originalLocation,
                locationUpdateRequest.newLocation,
                "test@example.com",
            )
        ).thenReturn(Pair(mazes, locations))

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(locationUpdateRequest)

        //Assert...
        mockMvc
            .perform(
                post("/maze/update-location")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
    }

}
