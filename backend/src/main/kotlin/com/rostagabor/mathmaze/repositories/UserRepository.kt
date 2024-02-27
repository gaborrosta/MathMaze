package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.User
import org.springframework.data.jpa.repository.JpaRepository

/**
 *   Manages the users table in the database.
 */
interface UserRepository : JpaRepository<User, Long> {

    /**
     *   Finds a user by email.
     */
    fun findByEmail(email: String): User?

    /**
     *   Finds a user by username.
     */
    fun findByUsername(username: String): User?

}
