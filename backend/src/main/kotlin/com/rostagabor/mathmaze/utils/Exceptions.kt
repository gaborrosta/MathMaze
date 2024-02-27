package com.rostagabor.mathmaze.utils

/**
 *   IF THE NAME OF THE EXCEPTIONS CHANGES, THE FRONTEND WILL HAVE TO BE UPDATED AS WELL!
 */

/**
 *   Exception for when a username is in an invalid format.
 */
class UsernameInvalidFormatException : Exception()

/**
 *   Exception for when an email is in an invalid format.
 */
class EmailInvalidFormatException : Exception()

/**
 *   Exception for when a password is in an invalid format.
 */
class PasswordInvalidFormatException : Exception()


/**
 *   Exception for when a username is not unique.
 */
class UsernameNotUniqueException : Exception()

/**
 *   Exception for when an email is not unique.
 */
class EmailNotUniqueException : Exception()


/**
 *   Exception for when a user is not found with the given credentials.
 */
class InvalidCredentialsException : Exception()
