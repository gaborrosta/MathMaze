package com.rostagabor.mathmaze.data

/**
 *   Data class for login request.
 */
data class LoginRequest(
    val email: String,
    val password: String,
)