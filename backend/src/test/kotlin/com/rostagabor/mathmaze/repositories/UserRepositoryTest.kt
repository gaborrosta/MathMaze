package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
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

}
