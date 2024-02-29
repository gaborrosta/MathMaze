package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.utils.loadOpenCV
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 *   The main class of the application.
 */
@SpringBootApplication
class MathMazeApplication


/**
 *   This is the main entry point of the application.
 */
fun main(args: Array<String>) {
    //Load OpenCV
    loadOpenCV()

    //Load ML model
    //ML.train()

    //Run Spring Boot application
    runApplication<MathMazeApplication>(*args)
}
