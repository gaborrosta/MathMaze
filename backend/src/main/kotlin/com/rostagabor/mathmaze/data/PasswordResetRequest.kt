package com.rostagabor.mathmaze.data

/**
 *   Data class for password reset request.
 */
data class PasswordResetRequest(
    val token: String,
    val password: String,
)
