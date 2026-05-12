package com.rostagabor.mathmaze.requests

import com.rostagabor.mathmaze.data.OperationType
import kotlin.math.min

/**
 *   Class for maze generation request.
 */
class MazeGenerationRequest(
    val width: Int,
    val height: Int,
    val numbersRangeStart: Int,
    val numbersRangeEnd: Int,
    val operation: OperationType,
    val pathTypeEven: Boolean,
    val minLength: Int? = null,
    val maxLength: Int? = null,
    val discardedMazes: List<Long> = emptyList(),
    val solution1: SolutionIDForm,
    val solution2: SolutionIDForm,
    val solution3: SolutionIDForm,
    val token: String?,
) {

    val resolvedMinLength: Int
        get() = minLength ?: min(height, width)

    val resolvedMaxLength: Int
        get() = maxLength ?: (width * height)

}
