package com.rostagabor.mathmaze.utils

/**
 *   Validates a username. The same regex is used in the frontend.
 */
fun validateUsername(username: String): Boolean {
    val usernameRegex = "^[a-zA-Z0-9]{5,20}$".toRegex()
    return usernameRegex.matches(username)
}

/**
 *   Validates an email. The same regex is used in the frontend.
 */
fun validateEmail(email: String): Boolean {
    val emailRegex = "^[\\w-.]+@([\\w-]+.)+[\\w-]{2,4}$".toRegex()
    return emailRegex.matches(email)
}

/**
 *   Validates a password. The same regex is used in the frontend.
 */
fun validatePassword(password: String): Boolean {
    val passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$".toRegex()
    return passwordRegex.matches(password)
}
