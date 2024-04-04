package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.context.ActiveProfiles

/**
 *   Test for the UserRepository interface.
 */
@DataJpaTest
@ActiveProfiles("test", "dev")
class UserRepositoryTest {

    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun findByUsername() {
        //Save 2 users
        userRepository.save(User(username = "testUser", email = "test@example.com"))
        userRepository.save(User(username = "testUser2", email = "test2@example.com"))

        //Find the user by username
        val foundUser = userRepository.findByUsername("testUser")

        //Assert...
        assertNotNull(foundUser)
        assertEquals("testUser", foundUser?.username)
        assertEquals("test@example.com", foundUser?.email)
    }

    @Test
    fun findByEmail() {
        //Save 2 users
        userRepository.save(User(username = "testUser", email = "test@example.com"))
        userRepository.save(User(username = "testUser2", email = "test2@example.com"))

        //Find the user by email
        val foundUser = userRepository.findByEmail("test@example.com")

        //Assert...
        assertNotNull(foundUser)
        assertEquals("testUser", foundUser?.username)
        assertEquals("test@example.com", foundUser?.email)
    }

    @Test
    fun testUsernameUniqueness() {
        //Create 2 users with the same username
        val user1 = User(username = "testUser", email = "test@example.com")
        val user2 = User(username = "testUser", email = "test2@example.com")

        //Save the first user
        userRepository.save(user1)

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) { userRepository.saveAndFlush(user2) }
    }

    @Test
    fun testEmailUniqueness() {
        //Create 2 users with the same email
        val user1 = User(username = "testUser", email = "test@example.com")
        val user2 = User(username = "testUser2", email = "test@example.com")

        //Save the first user
        userRepository.save(user1)

        //Assert...
        assertThrows(DataIntegrityViolationException::class.java) { userRepository.saveAndFlush(user2) }
    }

}
