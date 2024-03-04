package com.rostagabor.mathmaze.data

/**
 *   Data class for the maze save request.
 */
data class MazeSaveRequest(
    val mazeId: Long,
    val token: String?,
)
