package com.rostagabor.mathmaze.utils

import com.rostagabor.mathmaze.data.OperationType

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


/**
 *   Validates the dimensions of a maze.
 */
fun validateMazeDimensions(width: Int, height: Int): Boolean {
    val validRange = 11 until 50
    return width in validRange && height in validRange && width % 2 != 0 && height % 2 != 0
}

/**
 *   Validates the numbers range of a maze.
 */
fun validateNumbersRange(numbersRangeStart: Int, numbersRangeEnd: Int, operation: OperationType): Boolean {
    val range = numbersRangeStart..numbersRangeEnd
    val ranges = if (operation.involvesSum) listOf(1..10, 1..20, 1..100) else listOf(1..10, 1..20, 11..20)
    return numbersRangeStart < numbersRangeEnd && range in ranges
}


/**
 *   Validates a nickname. The same regex is used in the frontend.
 */
fun validateNickname(nickname: String): Boolean {
    val nicknameRegex = "^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]{5,20}$".toRegex()
    return nicknameRegex.matches(nickname)
}
