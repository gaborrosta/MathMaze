package com.rostagabor.mathmaze

import com.rostagabor.mathmaze.core.ML
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.SpringBootApplication

/**
 *   The main class of the application.
 */
@SpringBootApplication
class MathMazeApplication : ApplicationRunner {

    /**
     *   States whether the machine learning is enabled or not.
     */
    @Value("\${app.ml-enabled}")
    private val isMLEnabled: Boolean = false


    /**
     *   Trains the machine learning model if it is enabled.
     */
    override fun run(args: ApplicationArguments?) {
        if (isMLEnabled) {
            println("Training the machine learning model...")
            val accuracy = ML.train()
            println("Machine learning model is trained with accuracy: $accuracy.")
        } else {
            println("Machine learning is disabled, all the predictions will be 0.")
        }
    }

}
