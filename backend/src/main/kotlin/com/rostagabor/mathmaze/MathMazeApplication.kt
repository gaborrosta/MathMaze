package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.core.ML
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.SpringBootApplication

/**
 *   The main class of the application.
 */
@SpringBootApplication
class MathMazeApplication : ApplicationRunner {

    /**
     *   Loads the weights for the machine learning model.
     */
    override fun run(args: ApplicationArguments?) {
        println("Loading the weights for the machine learning model...")
        ML.loadWeights()
        println("Loading done.")
    }

}
