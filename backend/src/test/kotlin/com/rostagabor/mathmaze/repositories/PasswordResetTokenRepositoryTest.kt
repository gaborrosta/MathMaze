package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.PasswordResetToken
import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.context.ActiveProfiles

/**
 *   Tests for the PasswordResetTokenRepository interface.
 */
@DataJpaTest
@ActiveProfiles("test", "dev")
class PasswordResetTokenRepositoryTest {

    @Autowired
    lateinit var passwordResetTokenRepository: PasswordResetTokenRepository

    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun findByToken() {
        //Save 2 users
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)
        userRepository.save(User(username = "testUser2", email = "test2@example.com"))

        //Save 2 password reset tokens
        val token = "testToken"
        val passwordResetToken = PasswordResetToken(token = token, user = user)
        passwordResetTokenRepository.save(passwordResetToken)
        passwordResetTokenRepository.save(PasswordResetToken(token = "testToken2", user = user))

        //Find the password reset token by token
        val foundToken = passwordResetTokenRepository.findByToken(token)

        //Assert...
        assertNotNull(foundToken)
        assertEquals(token, foundToken?.token)
        assertEquals(user, foundToken?.user)
    }

    @Test
    fun testTokenUniqueness() {
        //Save 1 user
        val user = User(username = "testUser", email = "test@example.com")
        userRepository.save(user)

        //Create 2 password reset tokens with the same token
        val token = "testToken"
        val passwordResetToken1 = PasswordResetToken(token = token, user = user)
        val passwordResetToken2 = PasswordResetToken(token = token, user = user)

        //Save the first password reset token
        passwordResetTokenRepository.save(passwordResetToken1)

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) {
            passwordResetTokenRepository.saveAndFlush(passwordResetToken2)
        }
    }

}
