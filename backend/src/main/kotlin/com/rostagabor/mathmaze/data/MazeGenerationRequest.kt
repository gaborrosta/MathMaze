package com.rostagabor.mathmaze.data

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
    val minLength: Int,
    val maxLength: Int,
)
