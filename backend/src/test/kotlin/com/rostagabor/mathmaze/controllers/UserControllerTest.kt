package com.rostagabor.mathmaze.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import com.rostagabor.mathmaze.data.PasswordResetToken
import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.requests.AccountPasswordResetRequest
import com.rostagabor.mathmaze.requests.EmailRequest
import com.rostagabor.mathmaze.requests.LoginRequest
import com.rostagabor.mathmaze.requests.PasswordResetRequest
import com.rostagabor.mathmaze.services.UserService
import com.rostagabor.mathmaze.utils.UserNotFoundException
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 *   Tests for the UserController class.
 */
@SpringBootTest(
    properties = [
        "spring.datasource.url=jdbc:hsqldb:mem:testUser;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.hsqldb.jdbcDriver",
        "hibernate.dialect=org.hibernate.dialect.HSQLDialect",
    ]
)
@AutoConfigureMockMvc
@ActiveProfiles("test", "dev")
class UserControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    @MockkBean(relaxed = true)
    private lateinit var userService: UserService

    private lateinit var userController: UserController

    @BeforeEach
    fun setUp() {
        userController = UserController(userService)
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun register() {
        val user = User(username = "testUser", email = "test@example.com")
        every { userService.register(any()) } returns user
        every { userService.generateToken(any()) } returns "testToken"

        val response = userController.register(user)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testToken", response.body)
    }

    @Test
    fun registerWithException() {
        val user = User(username = "testUser", email = "test@example.com")
        every { userService.register(any()) } throws Exception()
        every { userService.generateToken(any()) } returns "testToken"

        val response = userController.register(user)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlRegister() {
        val user = User(username = "testUser", email = "test@example.com")
        every { userService.register(any()) } returns user
        every { userService.generateToken(any()) } returns "testToken"

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(user)

        //Assert...
        mockMvc
            .perform(
                post("/users/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testToken"))
    }

    @Test
    fun login() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        every { userService.login(any(), any()) } returns User(username = "testUser", email = loginRequest.email)
        every { userService.generateToken(any()) } returns "testToken"

        val response = userController.login(loginRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testToken", response.body)
    }

    @Test
    fun loginWithException() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        every { userService.login(any(), any()) } throws Exception()
        every { userService.generateToken(any()) } returns "testToken"

        val response = userController.login(loginRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlLogin() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        every { userService.login(any(), any()) } returns User(username = "testUser", email = loginRequest.email)
        every { userService.generateToken(any()) } returns "testToken"

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(loginRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testToken"))
    }

    @Test
    fun requestPasswordReset() {
        val emailRequest = EmailRequest(email = "test@example.com")
        every { userService.requestPasswordReset(any()) } just runs

        val response = userController.requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun requestPasswordResetWithException1() {
        val emailRequest = EmailRequest(email = "test@example.com")
        every { userService.requestPasswordReset(any()) } throws Exception()

        val response = userController.requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun requestPasswordResetWithException2() {
        val emailRequest = EmailRequest(email = "test@example.com")
        every { userService.requestPasswordReset(any()) } throws UserNotFoundException()

        val response = userController.requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun urlRequestPasswordReset() {
        val emailRequest = EmailRequest(email = "test@example.com")
        every { userService.requestPasswordReset(any()) } just runs

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(emailRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/password-request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun validateToken() {
        val token = "test-token"
        every { userService.validateToken(any()) } returns PasswordResetToken()

        val response = userController.validateToken(token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun validateTokenWithException() {
        val token = "test-token"
        every { userService.validateToken(any()) } throws Exception()

        val response = userController.validateToken(token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlValidateToken() {
        val token = "test-token"
        every { userService.validateToken(any()) } returns PasswordResetToken()

        //Assert...
        mockMvc
            .perform(get("/users/password-validate?token=$token"))
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun resetPassword() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        every { userService.resetPassword(any(), any()) } just runs

        val response = userController.resetPassword(passwordResetRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun resetPasswordWithException() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        every { userService.resetPassword(any(), any()) } throws Exception()

        val response = userController.resetPassword(passwordResetRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlResetPassword() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        every { userService.resetPassword(any(), any()) } just runs

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(passwordResetRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun accountResetPassword() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("test@example.com", "testNewToken")
        every { userService.accountResetPassword(any(), any(), any()) } just runs

        val response = userController.accountResetPassword(accountPasswordResetRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testNewToken", response.body)
    }

    @Test
    fun accountResetPasswordWithException() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("test@example.com", "testNewToken")
        every { userService.accountResetPassword(any(), any(), any()) } throws Exception()

        val response = userController.accountResetPassword(accountPasswordResetRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlAccountResetPassword() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("test@example.com", "testNewToken")
        every { userService.accountResetPassword(any(), any(), any()) } just runs

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(accountPasswordResetRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/account-password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testNewToken"))
    }

    @Test
    fun isUserStillLoggedIn() {
        val token = "test-token"
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("test@example.com", "testNewToken")

        val response = userController.isUserStillLoggedIn(token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testNewToken", response.body)
    }

    @Test
    fun isUserStillLoggedInWithException() {
        val token = "test-token"
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("", "")

        val response = userController.isUserStillLoggedIn(token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun urlIsUserStillLoggedIn() {
        val token = "test-token"
        every { userService.regenerateTokenIfStillValid(any()) } returns Pair("test@example.com", "testNewToken")

        //Assert...
        mockMvc
            .perform(get("/users/check?token=$token"))
            .andExpect(status().isOk)
            .andExpect(content().string("testNewToken"))
    }

}
