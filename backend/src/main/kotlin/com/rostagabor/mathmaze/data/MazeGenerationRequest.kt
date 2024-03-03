package com.rostagabor.mathmaze.data

import kotlin.math.min

/**
 *   Data class for the maze generation request.
 */
data class MazeGenerationRequest(
    val width: Int,
    val height: Int,
    val numbersRangeStart: Int,
    val numbersRangeEnd: Int,
    val operation: OperationType,
    val pathTypeEven: Boolean,
    val minLength: Int = min(height, width),
    val maxLength: Int = width * height,
    val discardedMazes: List<Long> = emptyList(),
    val token: String = "",
)
