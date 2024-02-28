package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.PasswordResetToken
import org.springframework.data.jpa.repository.JpaRepository

/**
 *   Manages the password_reset_tokens table in the database.
 */
interface PasswordResetTokenRepository : JpaRepository<PasswordResetToken, Long> {

    /**
     *   Finds a password reset token by token column.
     */
    fun findByToken(token: String): PasswordResetToken?

}
