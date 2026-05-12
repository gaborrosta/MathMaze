package com.rostagabor.mathmaze.requests

import com.fasterxml.jackson.annotation.JsonProperty

/**
 *   Class for maze update request.
 */
class MazeUpdateRequest(
    val mazeId: Long,
    val description: String?,
    val location: String,
    @get:JsonProperty("isPrivate")
    val isPrivate: Boolean,
    val passcode: String,
    val token: String,
)
