package com.rostagabor.mathmaze.requests

/**
 *   Class for password reset request in the account page.
 */
class AccountPasswordResetRequest(
    val oldPassword: String,
    val newPassword: String,
    val token: String?,
)
