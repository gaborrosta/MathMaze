package com.rostagabor.mathmaze

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@SpringBootApplication
class MathMazeApplication

fun main(args: Array<String>) {
    runApplication<MathMazeApplication>(*args)
}

@RestController
class BasicController {

    @GetMapping("/")
    fun index() = "Hello"

    @GetMapping("/name")
    fun name(@RequestParam("name") name: String) = "Hello, $name!"

}
