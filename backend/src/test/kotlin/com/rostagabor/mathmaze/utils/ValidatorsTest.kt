package com.rostagabor.mathmaze.utils

import com.rostagabor.mathmaze.data.OperationType
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 *   Tests for the validators.
 */
class ValidatorsTest {

    @Test
    fun validateUsername() {
        assertTrue(validateUsername("validUser1"))
        assertTrue(validateUsername("anotherValidUser"))

        assertFalse(validateUsername("me"))
        assertFalse(validateUsername("invalidUserWithMoreThan20Characters"))
    }

    @Test
    fun validateEmail() {
        assertTrue(validateEmail("valid.email@example.com"))
        assertTrue(validateEmail("another.valid.email@example.com"))

        assertFalse(validateEmail("invalidEmail"))
        assertFalse(validateEmail("invalid.email@.com"))
    }

    @Test
    fun validatePassword() {
        assertTrue(validatePassword("ValidPassword1!"))
        assertTrue(validatePassword("AnotherPassword2@"))

        assertFalse(validatePassword("invalidpassword"))
        assertFalse(validatePassword("InvalidPasswordWithoutSpecialCharacter"))
    }

    @Test
    fun validateMazeDimensions() {
        assertTrue(validateMazeDimensions(11, 11))
        assertTrue(validateMazeDimensions(13, 13))

        assertFalse(validateMazeDimensions(10, 80))
        assertFalse(validateMazeDimensions(77, 12))
    }

    @Test
    fun validateNumbersRange() {
        assertTrue(validateNumbersRange(1, 10, OperationType.ADDITION))
        assertTrue(validateNumbersRange(1, 20, OperationType.ADDITION))
        assertTrue(validateNumbersRange(1, 100, OperationType.ADDITION))

        assertFalse(validateNumbersRange(1, 11, OperationType.SUBTRACTION))
        assertFalse(validateNumbersRange(2, 20, OperationType.SUBTRACTION))
        assertFalse(validateNumbersRange(100, 1, OperationType.SUBTRACTION))

        assertTrue(validateNumbersRange(1, 10, OperationType.MULTIPLICATION))
        assertTrue(validateNumbersRange(1, 20, OperationType.MULTIPLICATION))
        assertTrue(validateNumbersRange(11, 20, OperationType.MULTIPLICATION))

        assertFalse(validateNumbersRange(1, 11, OperationType.DIVISION))
        assertFalse(validateNumbersRange(2, 20, OperationType.DIVISION))
        assertFalse(validateNumbersRange(20, 11, OperationType.DIVISION))
    }

    @Test
    fun validateNickname() {
        assertTrue(validateNickname("Valid Nickname 1"))
        assertTrue(validateNickname("János 2"))

        assertFalse(validateNickname("me"))
        assertFalse(validateNickname("invalidNicknameWithMoreThan20Characters"))
    }

    @Test
    fun validateDescription() {
        assertTrue(validateDescription("Valid description 1"))
        assertTrue(validateDescription("Another jó description 2"))

        assertFalse(validateDescription("invalid & now"))
        assertFalse(validateDescription("Invalid description with more than 100 characters. This is a very long description. It is very long.."))
    }

    @Test
    fun validateLocation() {
        assertTrue(validateLocation("/Valid Location 1/"))
        assertTrue(validateLocation("/Another jó/Location 2/"))

        assertFalse(validateLocation("//invalid & now/"))
        assertFalse(validateLocation("/InvalidLocation with more than 20 characters./"))
    }

    @Test
    fun validatePasscode() {
        assertTrue(validatePasscode("12345678"))
        assertTrue(validatePasscode(""))

        assertFalse(validatePasscode("1234"))
        assertFalse(validatePasscode("1"))
    }

}
