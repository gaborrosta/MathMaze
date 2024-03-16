package com.rostagabor.mathmaze.requests

/**
 *   Class for maze update request.
 */
class MazeUpdateRequest(
    val mazeId: Long,
    val description: String?,
    val location: String,
    val isPrivate: Boolean,
    val passcode: String,
    val token: String,
)
