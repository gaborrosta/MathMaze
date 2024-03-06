package com.rostagabor.mathmaze.controllers

import com.beust.klaxon.JsonObject
import com.rostagabor.mathmaze.data.MazeGenerationRequest
import com.rostagabor.mathmaze.data.MazeSaveRequest
import com.rostagabor.mathmaze.services.MazeService
import com.rostagabor.mathmaze.services.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

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
            val (_, token) = userService.regenerateTokenIfStillValid(mazeGenerationRequest.token)

            val maze = mazeService.generateMaze(
                mazeGenerationRequest.width,
                mazeGenerationRequest.height,
                mazeGenerationRequest.numbersRangeStart,
                mazeGenerationRequest.numbersRangeEnd,
                mazeGenerationRequest.operation,
                mazeGenerationRequest.pathTypeEven,
                mazeGenerationRequest.minLength,
                mazeGenerationRequest.maxLength,
                mazeGenerationRequest.discardedMazes,
            )
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
            val (email, token) = userService.regenerateTokenIfStillValid(mazeSaveRequest.token)

            val maze = mazeService.saveMaze(email, mazeSaveRequest.mazeId)
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
     *   Retrieves all mazes created by the user.
     */
    @GetMapping("/getAll")
    fun getAll(@RequestParam token: String): ResponseEntity<Any> {
        return try {
            val (email, newToken) = userService.regenerateTokenIfStillValid(token)
            val mazes = mazeService.getAllMazes(email)

            ResponseEntity.ok().body(
                JsonObject().apply {
                    this["mazes"] = mazes
                    this["token"] = newToken
                }
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
