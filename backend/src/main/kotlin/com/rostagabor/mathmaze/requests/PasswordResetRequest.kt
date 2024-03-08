package com.rostagabor.mathmaze.requests

/**
 *   Class for password reset request.
 */
class PasswordResetRequest(
    val token: String,
    val password: String,
)
