package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.configs.JwtConfig
import com.rostagabor.mathmaze.data.PasswordResetToken
import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.repositories.PasswordResetTokenRepository
import com.rostagabor.mathmaze.repositories.UserRepository
import com.rostagabor.mathmaze.utils.*
import io.jsonwebtoken.Jwts
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.test.util.ReflectionTestUtils
import java.time.Instant
import java.util.*

/**
 *   Tests for the UserService class.
 */
class UserServiceTest {

    private lateinit var userRepository: UserRepository

    private lateinit var passwordResetTokenRepository: PasswordResetTokenRepository

    private lateinit var mailService: MailService

    private lateinit var jwtConfig: JwtConfig

    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository = mockk<UserRepository>()
        passwordResetTokenRepository = mockk<PasswordResetTokenRepository>()
        mailService = mockk<MailService>()
        jwtConfig = spyk<JwtConfig>()
        userService = UserService(userRepository, passwordResetTokenRepository, mailService, jwtConfig)

        //Mock the secret key and the admin password
        ReflectionTestUtils.setField(
            jwtConfig,
            "secretKey",
            "máp dosklmkfng ijgpfwélmvf nsdkvkdqálwé,s mvdxjpkőifowqdűé, dvmdékfwőfeúlS_:yc ?v-XMÉKSLFPŐ"
        )
        ReflectionTestUtils.setField(userService, "adminPassword", "")
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun `run creates a new admin user when there is no admin user in the database`() {
        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns null

        userService.run()

        //Assert...
        verify { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) }
        verify { userRepository.save(any<User>()) }
    }

    @Test
    fun `run does not create a new admin user when there is already an admin user in the database`() {
        val adminUser = User(username = "MathMaze Admin", email = ADMIN_EMAIL_ADDRESS, password = "adminPassword")
        every { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) } returns adminUser

        userService.run()

        //Assert...
        verify { userRepository.findByEmail(ADMIN_EMAIL_ADDRESS) }
        verify(exactly = 0) { userRepository.save(any<User>()) }
    }

    @Test
    fun `register creates a new user when username, email, and password are valid and unique`() {
        val user = User(username = "username", email = "test@example.com", password = "TestPassword@123")

        every { userRepository.findByUsername(any()) } returns null
        every { userRepository.findByEmail(any()) } returns null
        every { userRepository.save(any()) } returns user

        val result = userService.register(user)

        //Assert...
        verify { userRepository.findByUsername(user.username) }
        verify { userRepository.findByEmail(user.email) }
        verify { userRepository.save(user) }

        assertEquals(user.username, result.username)
        assertEquals(user.email, result.email)
        assertTrue(BCryptPasswordEncoder().matches("TestPassword@123", result.password))
    }

    @Test
    fun `register throws UsernameInvalidFormatException when username is invalid`() {
        val user = User(username = "", email = "test@example.com", password = "TestPassword@123")

        //Assert...
        assertThrows(UsernameInvalidFormatException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun `register throws EmailInvalidFormatException when email is invalid`() {
        val user = User(username = "username", email = "invalidEmail", password = "TestPassword@123")

        //Assert...
        assertThrows(EmailInvalidFormatException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun `register throws PasswordInvalidFormatException when password is invalid`() {
        val user = User(username = "username", email = "test@example.com", password = "invalidPassword")

        //Assert...
        assertThrows(PasswordInvalidFormatException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun `register throws UsernameNotUniqueException when username is not unique`() {
        val user = User(username = "username", email = "test@example.com", password = "TestPassword@123")

        every { userRepository.findByUsername(any()) } returns user

        //Assert...
        assertThrows(UsernameNotUniqueException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun `register throws EmailNotUniqueException when email is not unique`() {
        val user = User(username = "username", email = "test@example.com", password = "TestPassword@123")

        every { userRepository.findByUsername(any()) } returns null
        every { userRepository.findByEmail(any()) } returns user

        //Assert...
        assertThrows(EmailNotUniqueException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun `login returns the user when the email and password are correct`() {
        val user = User(username = "username", email = "test@example.com", password = BCryptPasswordEncoder().encode("TestPassword@123"))

        every { userRepository.findByEmail(any()) } returns user

        val result = userService.login(user.email, "TestPassword@123")

        //Assert...
        assertEquals(user.username, result.username)
        assertEquals(user.email, result.email)
    }

    @Test
    fun `login throws InvalidCredentialsException when the email is incorrect`() {
        val user = User(username = "username", email = "test@example.com", password = "TestPassword@123")

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows(InvalidCredentialsException::class.java) {
            userService.login(user.email, user.password)
        }
    }

    @Test
    fun `login throws InvalidCredentialsException when the password is incorrect`() {
        val user = User(username = "username", email = "test@example.com", password = "TestPassword@123")

        every { userRepository.findByEmail(any()) } returns user

        //Assert...
        assertThrows(InvalidCredentialsException::class.java) {
            userService.login(user.email, "WrongPassword")
        }
    }

    @Test
    fun `generateToken returns a valid JWT token when the email is provided`() {
        val email = "test@example.com"
        val result = userService.generateToken(email)

        //Assert...
        assertEquals(Jwts.parser().verifyWith(jwtConfig.key).build().parseSignedClaims(result).payload.subject, email)
    }

    @Test
    fun `regenerateTokenIfStillValid returns a new token when the token is valid`() {
        val email = "test@example.com"

        val token = Jwts.builder()
            .subject(email)
            .expiration(Date(System.currentTimeMillis() + 1 * 60 * 60))
            .signWith(jwtConfig.key, Jwts.SIG.HS512)
            .compact()

        val result = userService.regenerateTokenIfStillValid(token)

        //Assert...
        assertEquals(email, result.first)
        assertNotEquals(token, result.second)
        assertEquals(Jwts.parser().verifyWith(jwtConfig.key).build().parseSignedClaims(result.second).payload.subject, email)
    }

    @Test
    fun `regenerateTokenIfStillValid returns an empty string when the token is invalid`() {
        val result = userService.regenerateTokenIfStillValid(null)

        //Assert...
        assertEquals("", result.first)
        assertEquals("", result.second)
    }

    @Test
    fun `requestPasswordReset generates a token, saves it, and sends an email when the email is valid and exists in the database`() {
        val email = "test@example.com"
        val user = User(username = "username", email = email, password = "TestPassword@123")

        every { userRepository.findByEmail(any()) } returns user
        every { passwordResetTokenRepository.save(any()) } returns PasswordResetToken()
        every { mailService.sendPasswordResetMail(any(), any()) } just runs

        userService.requestPasswordReset(email)

        //Assert...
        verify { userRepository.findByEmail(email) }
        verify { passwordResetTokenRepository.save(any<PasswordResetToken>()) }
        verify { mailService.sendPasswordResetMail(user, any()) }
    }

    @Test
    fun `requestPasswordReset throws UserNotFoundException when the email is not found in the database`() {
        val email = "test@example.com"

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows(UserNotFoundException::class.java) {
            userService.requestPasswordReset(email)
        }
    }

    @Test
    fun `validateToken returns the token when the token is valid and not expired`() {
        val token = "validToken"
        val passwordResetToken = PasswordResetToken(token = token, user = User(), expiryDate = Instant.now().plusSeconds(3600), used = false)

        every { passwordResetTokenRepository.findByToken(any()) } returns passwordResetToken

        val result = userService.validateToken(token)

        //Assert...
        assertEquals(passwordResetToken, result)
    }

    @Test
    fun `validateToken throws TokenInvalidOrExpiredException when the token is not found`() {
        val token = "invalidToken"

        every { passwordResetTokenRepository.findByToken(any()) } returns null

        //Assert...
        assertThrows(TokenInvalidOrExpiredException::class.java) {
            userService.validateToken(token)
        }
    }

    @Test
    fun `validateToken throws TokenInvalidOrExpiredException when the token is expired`() {
        val token = "expiredToken"
        val passwordResetToken = PasswordResetToken(token = token, user = User(), expiryDate = Instant.now().minusSeconds(3600), used = false)

        every { passwordResetTokenRepository.findByToken(any()) } returns passwordResetToken

        //Assert...
        assertThrows(TokenInvalidOrExpiredException::class.java) {
            userService.validateToken(token)
        }
    }

    @Test
    fun `validateToken throws TokenInvalidOrExpiredException when the token is used`() {
        val token = "usedToken"
        val passwordResetToken = PasswordResetToken(token = token, user = User(), expiryDate = Instant.now().plusSeconds(3600), used = true)

        every { passwordResetTokenRepository.findByToken(any()) } returns passwordResetToken

        //Assert...
        assertThrows(TokenInvalidOrExpiredException::class.java) {
            userService.validateToken(token)
        }
    }

    @Test
    fun `resetPassword resets the password and marks the token as used when the token is valid and the new password is valid`() {
        val token = "validToken"
        val newPassword = "NewValidPassword@123"
        val passwordResetToken = PasswordResetToken(token = token, user = User(), expiryDate = Instant.now().plusSeconds(3600), used = false)

        every { passwordResetTokenRepository.findByToken(any()) } returns passwordResetToken
        every { userRepository.save(any()) } returns User()
        every { passwordResetTokenRepository.save(any()) } returns passwordResetToken

        userService.resetPassword(token, newPassword)

        //Assert...
        verify { userRepository.save(passwordResetToken.user) }
        verify { passwordResetTokenRepository.save(passwordResetToken) }
        assertTrue(passwordResetToken.used)
        assertTrue(BCryptPasswordEncoder().matches(newPassword, passwordResetToken.user.password))
    }

    @Test
    fun `resetPassword throws TokenInvalidOrExpiredException when the token is invalid`() {
        val token = "invalidToken"
        val newPassword = "NewValidPassword@123"

        every { passwordResetTokenRepository.findByToken(any()) } returns null

        //Assert...
        assertThrows(TokenInvalidOrExpiredException::class.java) {
            userService.resetPassword(token, newPassword)
        }
    }

    @Test
    fun `resetPassword throws PasswordInvalidFormatException when the new password is invalid`() {
        val token = "validToken"
        val newPassword = "invalidPassword"
        val passwordResetToken = PasswordResetToken(token = token, user = User(), expiryDate = Instant.now().plusSeconds(3600), used = false)

        every { passwordResetTokenRepository.findByToken(any()) } returns passwordResetToken

        //Assert...
        assertThrows(PasswordInvalidFormatException::class.java) {
            userService.resetPassword(token, newPassword)
        }
    }

    @Test
    fun `accountResetPassword resets the password when the email is valid, old password is correct and new password is valid`() {
        val email = "test@example.com"
        val oldPassword = "OldValidPassword@123"
        val newPassword = "NewValidPassword@123"
        val user = User(username = "username", email = email, password = BCryptPasswordEncoder().encode(oldPassword))

        every { userRepository.save(any()) } returns user
        every { userRepository.findByEmail(any()) } returns user

        userService.accountResetPassword(email, oldPassword, newPassword)

        //Assert...
        every { userRepository.save(user) }
        assertTrue(BCryptPasswordEncoder().matches(newPassword, user.password))
    }

    @Test
    fun `accountResetPassword throws UserNotFoundException when the email is not found`() {
        val email = "test@example.com"
        val oldPassword = "OldValidPassword@123"
        val newPassword = "NewValidPassword@123"

        every { userRepository.findByEmail(any()) } returns null

        //Assert...
        assertThrows(UserNotFoundException::class.java) {
            userService.accountResetPassword(email, oldPassword, newPassword)
        }
    }

    @Test
    fun `accountResetPassword throws InvalidCredentialsException when the old password is incorrect`() {
        val email = "test@example.com"
        val oldPassword = "OldValidPassword@123"
        val wrongOldPassword = "WrongOldPassword"
        val newPassword = "NewValidPassword@123"
        val user = User(username = "username", email = email, password = BCryptPasswordEncoder().encode(oldPassword))

        every { userRepository.findByEmail(any()) } returns user

        //Assert...
        assertThrows(InvalidCredentialsException::class.java) {
            userService.accountResetPassword(email, wrongOldPassword, newPassword)
        }
    }

    @Test
    fun `accountResetPassword throws PasswordInvalidFormatException when the new password is invalid`() {
        val email = "test@example.com"
        val oldPassword = "OldValidPassword@123"
        val newPassword = "invalidPassword"
        val user = User(username = "username", email = email, password = BCryptPasswordEncoder().encode(oldPassword))

        every { userRepository.findByEmail(any()) } returns user

        //Assert...
        assertThrows(PasswordInvalidFormatException::class.java) {
            userService.accountResetPassword(email, oldPassword, newPassword)
        }
    }

}
