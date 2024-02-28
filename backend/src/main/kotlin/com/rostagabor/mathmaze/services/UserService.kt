package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.*
import com.rostagabor.mathmaze.repositories.PasswordResetTokenRepository
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.utils.*
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*

/**
 *   Handles user related operations.
 */
@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordResetTokenRepository: PasswordResetTokenRepository,
    private val mailService: MailService,
) {

    /**
     *   The password encoder.
     */
    private val passwordEncoder = BCryptPasswordEncoder()


    /**
     *   Registers a new user.
     */
    @Throws(Exception::class)
    fun register(user: User): User {
        //Validate the username, email, and password
        validateUsername(user.username).let { if (!it) throw UsernameInvalidFormatException() }
        validateEmail(user.email).let { if (!it) throw EmailInvalidFormatException() }
        validatePassword(user.password).let { if (!it) throw PasswordInvalidFormatException() }

        //Check if the username is unique
        userRepository.findByUsername(user.username)?.let { throw UsernameNotUniqueException() }

        //Check if the email is unique
        userRepository.findByEmail(user.email)?.let { throw EmailNotUniqueException() }

        //Hash the password
        user.password = passwordEncoder.encode(user.password)

        //Save the user
        return userRepository.save(user)
    }

    /**
     *   Logs in a user.
     */
    @Throws(Exception::class)
    fun login(email: String, password: String): User {
        //Find the user by username
        val foundUser = userRepository.findByEmail(email)

        //Check if the user exists and the password is correct
        if (foundUser != null && passwordEncoder.matches(password, foundUser.password)) {
            return foundUser
        }

        //Throw an exception if the user does not exist or the password is incorrect
        throw InvalidCredentialsException()
    }


    /**
     *   Requests a password reset.
     */
    @Throws(Exception::class)
    fun requestPasswordReset(email: String) {
        //Find the user by email
        val user = userRepository.findByEmail(email) ?: throw UserNotFoundException()

        //Generate a token
        val token = UUID.randomUUID().toString()

        //Save the token
        val passwordResetToken = PasswordResetToken(token = token, user = user, expiryDate = Instant.now().plusSeconds(3600))
        passwordResetTokenRepository.save(passwordResetToken)

        //Send the email
        mailService.sendPasswordResetMail(user, token)
    }

    /**
     *   Validates a password reset token.
     */
    @Throws(Exception::class)
    fun validateToken(token: String): PasswordResetToken {
        //Find the token
        val passwordResetToken = passwordResetTokenRepository.findByToken(token) ?: throw TokenInvalidOrExpiredException()

        //Check if the token is expired or used
        if (passwordResetToken.expiryDate.isBefore(Instant.now()) || passwordResetToken.used) {
            throw TokenInvalidOrExpiredException()
        }

        //Return the token
        return passwordResetToken
    }

    /**
     *   Resets a user's password.
     */
    @Throws(Exception::class)
    fun resetPassword(token: String, newPassword: String) {
        //Validate the token
        val passwordResetToken = validateToken(token)

        //Validate the password
        validatePassword(newPassword).let { if (!it) throw PasswordInvalidFormatException() }

        //Get the user
        val user = passwordResetToken.user

        //Hash the password and save the user
        user.password = passwordEncoder.encode(newPassword)
        userRepository.save(user)

        //Mark the token as used and save it
        passwordResetToken.used = true
        passwordResetTokenRepository.save(passwordResetToken)
    }

}
