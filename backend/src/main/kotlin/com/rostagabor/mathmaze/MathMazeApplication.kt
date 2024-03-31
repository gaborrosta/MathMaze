package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.core.ML
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.core.env.Environment

/**
 *   The main class of the application.
 */
@SpringBootApplication
class MathMazeApplication(
    val env: Environment
) : ApplicationRunner {

    /**
     *   Loads the weights for the machine learning model.
     */
    override fun run(args: ApplicationArguments?) {
        //Skip loading the weights in test environment
        if (env.activeProfiles.contains("test")) return

        println("Loading the weights for the machine learning model...")
        ML.loadWeights()
        println("Loading done.")
    }

}
