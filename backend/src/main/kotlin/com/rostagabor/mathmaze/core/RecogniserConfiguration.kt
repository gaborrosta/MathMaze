package com.rostagabor.mathmaze.core

/**
 *   Configuration for the recogniser.
 */
class RecogniserConfiguration(
    /**
     *   The factor to make image brighter when loading. (Default: 0.0)
     */
    val brightness: Double = 0.0,
    /**
     *   This ratio many pixels have to be nonzero in a line to be considered as an actual line across the image. (Default: 0.9)
     */
    val lineFillLimit: Double = 0.9,
    /**
     *   The maximum step between lines to be considered as a part of the same block when determining lines across the image. (Default: 3)
     */
    val linesMaxStepBetween: Int = 3,
    /**
     *   The minimum width of the found lines, everything with width less than this will be considered as "noise". (Default: 5)
     */
    val linesMinWidthToKeepFirst: Int = 5,
    /**
     *   The minimum width a line has to have. Lines are made narrower until this width is reached. (Default: 5)
     */
    val linesReducedMinWidth: Int = 5,
    /**
     *   Noise limit for the processed numbers. Pixel with value above this limit is considered as part of the number. (Default: 50.0)
     */
    val noiseLimit: Double = 50.0,
) {

    /**
     *   Returns a string representation of the object.
     */
    override fun toString(): String = "brightness=$brightness, " +
            "lineFillLimit=$lineFillLimit, " +
            "linesMaxStepBetween=$linesMaxStepBetween, " +
            "linesMinWidthToKeepFirst=$linesMinWidthToKeepFirst, " +
            "linesReducedMinWidth=$linesReducedMinWidth, " +
            "noiseLimit=$noiseLimit"


    companion object {

        /**
         *   Possible configurations for the recogniser.
         */
        val configs = listOf(
            RecogniserConfiguration(),
            RecogniserConfiguration(lineFillLimit = 0.99),
            RecogniserConfiguration(lineFillLimit = 0.97),
            RecogniserConfiguration(lineFillLimit = 0.95),
            RecogniserConfiguration(brightness = 75.0),
            RecogniserConfiguration(brightness = 75.0, lineFillLimit = 0.99),
            RecogniserConfiguration(brightness = 75.0, lineFillLimit = 0.97),
            RecogniserConfiguration(brightness = 75.0, lineFillLimit = 0.95),
        )

    }

}
