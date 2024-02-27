package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.utils.*
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

/**
 *   Handles user related operations.
 */
@Service
class UserService(private val userRepository: UserRepository) {

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

}
