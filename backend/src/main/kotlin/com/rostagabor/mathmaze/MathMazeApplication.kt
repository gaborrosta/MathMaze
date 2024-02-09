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

    @GetMapping("/ml")
    fun ml() = "<pre>" + ML.ask().joinToString(separator = "<br>") + "</pre>"

}
