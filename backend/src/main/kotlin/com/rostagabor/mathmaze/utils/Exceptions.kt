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


/**
 *   Exception for when a user is not found with the given email.
 */
class UserNotFoundException : Exception()

/**
 *   Exception for when a token is invalid or expired.
 */
class TokenInvalidOrExpiredException : Exception()


/**
 *   Exception for when a maze dimension is invalid.
 */
class InvalidMazeDimensionException : Exception()

/**
 *   Exception for when a path range is invalid.
 */
class InvalidPathRangeException : Exception()

/**
 *   Exception for when a numbers range is invalid.
 */
class InvalidNumbersRangeException : Exception()
