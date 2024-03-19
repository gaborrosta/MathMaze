package com.rostagabor.mathmaze.controllers

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.requests.*
import com.rostagabor.mathmaze.services.MazeService
import com.rostagabor.mathmaze.services.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

/**
 *   Controller for maze-related tasks.
 */
@RestController
@RequestMapping("/maze")
class MazeController(
    private val userService: UserService,
    private val mazeService: MazeService,
) {

    /**
     *   Generates a maze.
     */
    @PostMapping("/generate")
    fun generate(@RequestBody mazeGenerationRequest: MazeGenerationRequest): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (_, token) = userService.regenerateTokenIfStillValid(mazeGenerationRequest.token)

            //Generate the maze
            val maze = mazeService.generateMaze(
                width = mazeGenerationRequest.width,
                height = mazeGenerationRequest.height,
                numbersRangeStart = mazeGenerationRequest.numbersRangeStart,
                numbersRangeEnd = mazeGenerationRequest.numbersRangeEnd,
                operation = mazeGenerationRequest.operation,
                pathTypeEven = mazeGenerationRequest.pathTypeEven,
                minLength = mazeGenerationRequest.minLength,
                maxLength = mazeGenerationRequest.maxLength,
                discardedMazes = mazeGenerationRequest.discardedMazes,
                solutions = listOf(
                    mazeGenerationRequest.solution1,
                    mazeGenerationRequest.solution2,
                    mazeGenerationRequest.solution3,
                ).filter { !it.isEmpty },
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["maze"] = maze
                    this["token"] = token
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Saves a maze.
     */
    @PostMapping("/save")
    fun save(@RequestBody mazeSaveRequest: MazeSaveRequest): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, token) = userService.regenerateTokenIfStillValid(mazeSaveRequest.token)

            //Save the maze
            val (maze, locations) = mazeService.saveMaze(
                email = email,
                mazeId = mazeSaveRequest.mazeId,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["maze"] = maze
                    this["locations"] = locations
                    this["token"] = token
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Updates a maze.
     */
    @PostMapping("/update")
    fun update(@RequestBody mazeUpdateRequest: MazeUpdateRequest): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, token) = userService.regenerateTokenIfStillValid(mazeUpdateRequest.token)

            //Update the maze
            val (maze, locations) = mazeService.updateMaze(
                email = email,
                mazeId = mazeUpdateRequest.mazeId,
                description = mazeUpdateRequest.description ?: "",
                location = mazeUpdateRequest.location,
                isPrivate = mazeUpdateRequest.isPrivate,
                passcode = mazeUpdateRequest.passcode,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["maze"] = maze
                    this["locations"] = locations
                    this["token"] = token
                }
            )
        } catch (e: Exception) {
            e.printStackTrace()
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Recognises a maze in an image.
     */
    @PostMapping("/recognise", consumes = ["multipart/form-data"])
    fun recognise(
        @RequestParam("mazeId") mazeId: Long,
        @RequestParam("image") image: MultipartFile,
        @RequestParam("rotation") rotation: Int,
        @RequestParam("token") token: String?,
    ): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (_, newToken) = userService.regenerateTokenIfStillValid(token)

            //Recognise the maze
            val recognisedMaze = mazeService.recogniseMaze(
                mazeId = mazeId,
                image = image,
                rotation = rotation,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["recognisedMaze"] = recognisedMaze
                    this["token"] = newToken
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Checks a maze.
     */
    @PostMapping("/check")
    fun check(@RequestBody mazeCheckRequest: MazeCheckRequest): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, token) = userService.regenerateTokenIfStillValid(mazeCheckRequest.token)

            //Check the maze
            val maze = mazeService.checkMaze(
                mazeId = mazeCheckRequest.mazeId,
                data = mazeCheckRequest.data,
                path = mazeCheckRequest.path,
                nickname = mazeCheckRequest.nickname,
                email = email,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["checkedMaze"] = maze
                    this["token"] = token
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Retrieves all the mazes generated by the user.
     */
    @GetMapping("/getAll")
    fun getAll(@RequestParam token: String): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, newToken) = userService.regenerateTokenIfStillValid(token)

            //Get all the mazes
            val (mazes, locations) = mazeService.getAllMazes(
                email = email,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["mazes"] = mazes
                    this["locations"] = locations
                    this["token"] = newToken
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

    /**
     *   Retrieves all the solutions for a given maze.
     */
    @GetMapping("/getSolutions")
    fun getSolutions(@RequestParam mazeId: Long, @RequestParam token: String?): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, newToken) = userService.regenerateTokenIfStillValid(token)

            //Get all the solutions
            val solutions = mazeService.getSolutions(
                mazeId = mazeId,
                email = email,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["solutions"] = solutions
                    this["token"] = newToken
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Updates the location of mazes.
     */
    @PostMapping("/update-location")
    fun updateLocation(@RequestBody locationUpdateRequest: LocationUpdateRequest): ResponseEntity<Any> {
        return try {
            //Authentication status
            val (email, token) = userService.regenerateTokenIfStillValid(locationUpdateRequest.token)

            //Update the location
            val (mazes, locations) = mazeService.updateLocation(
                parentLocation = locationUpdateRequest.parentLocation,
                originalLocation = locationUpdateRequest.originalLocation,
                newLocation = locationUpdateRequest.newLocation,
                email = email,
            )

            //Create the response
            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["mazes"] = mazes
                    this["locations"] = locations
                    this["token"] = token
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
