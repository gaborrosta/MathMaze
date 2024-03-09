package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.utils.loadOpenCV
import org.springframework.boot.runApplication

/**
 *   This is the main entry point of the application.
 */
fun main(args: Array<String>) {
    //Load OpenCV
    loadOpenCV()

    //Run Spring Boot application
    runApplication<MathMazeApplication>(*args)
}
