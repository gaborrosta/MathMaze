package com.rostagabor.mathmaze.data

/**
 *   Data class for the maze check request.
 */
data class MazeCheckRequest(
    val mazeId: Long,
    val data: List<List<String>>,
    val path: List<Point>,
    val nickname: String,
    val token: String?,
)
