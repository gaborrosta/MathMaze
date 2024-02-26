package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.repositories.UserRepository
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
    fun register(user: User): User {
        //Hash the password
        user.password = passwordEncoder.encode(user.password)

        //Save the user
        return userRepository.save(user)
    }

    /**
     *   Logs in a user.
     */
    fun login(email: String, password: String): Long? {
        //Find the user by username
        val foundUser = userRepository.findByEmail(email)

        //Check if the user exists and the password is correct
        if (foundUser != null && passwordEncoder.matches(password, foundUser.password)) {
            return foundUser.userId
        }

        //Return -1 if the user does not exist or the password is incorrect
        return -1
    }

}
