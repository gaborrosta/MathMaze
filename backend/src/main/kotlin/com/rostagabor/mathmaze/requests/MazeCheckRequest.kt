package com.rostagabor.mathmaze.requests

import com.rostagabor.mathmaze.data.Point

/**
 *   Class for maze check request.
 */
class MazeCheckRequest(
    val mazeId: Long,
    val data: List<List<String>>,
    val path: List<Point>,
    val nickname: String,
    val token: String?,
)
