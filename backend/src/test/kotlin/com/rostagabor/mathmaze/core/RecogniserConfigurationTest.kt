package com.rostagabor.mathmaze.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 *   Tests for the RecogniserConfiguration class.
 */
class RecogniserConfigurationTest {

    @Test
    fun toString_() {
        val config = RecogniserConfiguration(
            brightness = 1.0,
            lineFillLimit = 0.8,
            linesMaxStepBetween = 4,
            linesMinWidthToKeepFirst = 6,
            linesReducedMinWidth = 7,
            noiseLimit = 60.0,
        )

        //Assert...
        assertEquals(
            "brightness=1.0, lineFillLimit=0.8, linesMaxStepBetween=4, linesMinWidthToKeepFirst=6, linesReducedMinWidth=7, noiseLimit=60.0",
            config.toString()
        )
    }

}
