package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.MazeGenerationRequest
import com.rostagabor.mathmaze.services.MazeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 *   Controller for maze-related tasks.
 */
@RestController
@RequestMapping("/maze")
class MazeController(private val mazeService: MazeService) {

    /**
     *   Generates a maze.
     */
    @PostMapping("/generate")
    fun generate(@RequestBody mazeGenerationRequest: MazeGenerationRequest): ResponseEntity<Any> {
        return try {
            val maze = mazeService.generateMaze(
                mazeGenerationRequest.width,
                mazeGenerationRequest.height,
                mazeGenerationRequest.numbersRangeStart,
                mazeGenerationRequest.numbersRangeEnd,
                mazeGenerationRequest.operation,
                mazeGenerationRequest.pathTypeEven,
                mazeGenerationRequest.minLength,
                mazeGenerationRequest.maxLength,
            )
            ResponseEntity.ok().body(maze)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
