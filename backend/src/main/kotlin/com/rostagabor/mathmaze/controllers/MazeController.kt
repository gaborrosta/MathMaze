package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.OperationType
import com.rostagabor.mathmaze.services.MazeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import kotlin.math.min

/**
 *   Controller for maze-related tasks.
 */
@RestController
@RequestMapping("/maze")
class MazeController(private val mazeService: MazeService) {

    /**
     *   Generates a maze.
     */
    @GetMapping("/generate")
    fun generate(
        @RequestParam width: Int,
        @RequestParam height: Int,
        @RequestParam numbersRangeStart: Int = 1,
        @RequestParam numbersRangeEnd: Int = 10,
        @RequestParam operation: OperationType = OperationType.MULTIPLICATION,
        @RequestParam pathTypeEven: Boolean = true,
        @RequestParam minLength: Int = min(width, height),
        @RequestParam maxLength: Int = Int.MAX_VALUE,
    ): ResponseEntity<Any> {
        return try {
            val maze = mazeService.generateMaze(width, height, numbersRangeStart, numbersRangeEnd, operation, pathTypeEven, minLength, maxLength)
            ResponseEntity.ok().body(maze)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
