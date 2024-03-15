package com.rostagabor.mathmaze.requests

/**
 *   Class for location update request.
 */
class LocationUpdateRequest(
    val parentLocation: String,
    val originalLocation: String,
    val newLocation: String,
    val token: String,
)
