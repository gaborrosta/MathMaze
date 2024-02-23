package com.rostagabor.mathmaze

import org.opencv.core.Core
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.io.File
import kotlin.math.min

@SpringBootApplication
class MathMazeApplication

fun main(args: Array<String>) {
    //ML.train()

    System.load(File("libs/opencv_java490.dll").absolutePath)
    try {
        println("OpenCV version: ${Core.VERSION}")
    } catch (e: UnsatisfiedLinkError) {
        println("Failed to load OpenCV: ${e.message}")
    }

    runApplication<MathMazeApplication>(*args)
}

@RestController
class BasicController {

    @GetMapping("/")
    fun index() = "Hello"

    @GetMapping("/name")
    fun name(@RequestParam name: String) = "Hello, $name!"

    @GetMapping("/generate")
    fun generate(
        @RequestParam width: Int,
        @RequestParam height: Int,
        @RequestParam minLength: Int = min(width, height),
        @RequestParam maxLength: Int = Int.MAX_VALUE,
    ): String {
        return try {
            val (result, message) = Generator.generateCharacterMaze(width, height, minLength, maxLength)
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
            } + "</pre><br>$message"
        } catch (e: Exception) {
            e.message ?: "Unknown error"
        }
    }

    //@GetMapping("/ml")
    //fun ml() = "<pre>" + ML.ask().joinToString(separator = "<br>") + "</pre>"

}
