package com.rostagabor.mathmaze

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class MathMazeApplication

fun main(args: Array<String>) {
    ML.train()
    runApplication<MathMazeApplication>(*args)
}

@RestController
class BasicController {

    @GetMapping("/")
    fun index() = "Hello"

    @GetMapping("/name")
    fun name(@RequestParam("name") name: String) = "Hello, $name!"

    @GetMapping("/generate")
    fun generate(@RequestParam("width") width: Int, @RequestParam("height") height: Int): String {
        return try {
            val result = Generator.generateCharacterMaze(width, height)
            "<pre>" + result.joinToString(
                separator = "<br>",
                prefix = "-".repeat(width + 2) + "\n",
                postfix = "\n" + "-".repeat(width + 2),
            ) {
                it.joinToString(
                    separator = "",
                    prefix = "|",
                    postfix = "|",
                )
            } + "</pre>"
        } catch (e: Exception) {
            e.message ?: "Unknown error"
        }
    }

    @GetMapping("/ml")
    fun ml() = "<pre>" + ML.ask().joinToString(separator = "<br>") + "</pre>"

}
